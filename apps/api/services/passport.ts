import "dotenv/config";
import { Strategy as LocalStategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import jwksRsa from "jwks-rsa";
import { Strategy as BearerStrategy } from "passport-http-bearer";
import crypto from "crypto";
import db from "../schemas/db";
import { userSchema } from "../schemas/user";
import { eq } from "drizzle-orm";
import { verifyPassword } from "../utils/passwordHash";

// Local login strategy for passport authentication
export const LocalLoginStrategy = new LocalStategy(
  {
    usernameField: "email",
    passwordField: "password",
  },
  async (username, password, cb) => {
    // Find user by email
    const users = await db
      .select()
      .from(userSchema)
      .where(eq(userSchema.email, username))
      .limit(1);

    if (users.length === 0) {
      return cb(null, false, {
        message: "Incorrect username or password.",
      });
    }

    const user = users[0];

    try {
      const isValid = await verifyPassword(password, user.password, user.salt);

      if (!isValid) {
        return cb(null, false, {
          message: "Incorrect username or password.",
        });
      }
    } catch (error) {
      return cb(error);
    }

    return cb(null, {
      id: user.id,
      firstName: user.firstName,
      role: user.role,
      email: user.email,
    });
  }
);

// JWT strategy for passport authentication
export const PassportJwtStrategy = process.env.JWT_SECRET
  ? new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET!,
      },
      async (jwtPayload, cb) => {
        try {
          const users = await db
            .select()
            .from(userSchema)
            .where(eq(userSchema.id, jwtPayload.id))
            .limit(1);

          if (users.length === 0) {
            return cb(null, false);
          }

          const user = users[0];
          return cb(null, {
            id: user.id,
            firstName: user.firstName,
            role: user.role,
            email: user.email,
          });
        } catch (error) {
          cb(error);
        }
      }
    )
  : undefined;

// Bearer strategy for passport authentication
export const AuthBearerStrategy = new BearerStrategy((token, done) => {
  if (!process.env.AUTH_TOKEN) {
    return done(
      new Error("AUTH_TOKEN is not set in the environment variables."),
      false
    );
  }

  if (process.env.AUTH_TOKEN !== token) {
    return done(new Error("Invalid token"), false);
  }

  if (!token) {
    return done(new Error("No token provided"), false);
  }

  done(
    null,
    {
      id: crypto.randomUUID(),
      firstName: "System",
      role: "system",
      email: "",
    },
    {
      scope: "all",
    }
  );
});

// Optional: ADFS / OIDC JWT strategy (validates tokens issued by external IdP via JWKS)
// Enabled when ADFS_OIDC_JWKS_URI, ADFS_OIDC_ISSUER, and ADFS_OIDC_AUDIENCE are configured.
const hasAdfsEnv = !!(
  process.env.ADFS_OIDC_JWKS_URI &&
  process.env.ADFS_OIDC_ISSUER &&
  process.env.ADFS_OIDC_AUDIENCE
);

export const AdfsJwtStrategy = hasAdfsEnv
  ? new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        // Dynamically fetch signing keys via JWKS
        secretOrKeyProvider: jwksRsa.passportJwtSecret({
          jwksUri: process.env.ADFS_OIDC_JWKS_URI!,
          cache: true,
          cacheMaxEntries: 5,
          cacheMaxAge: 10 * 60 * 1000, // 10 minutes
          rateLimit: true,
          jwksRequestsPerMinute: 5,
        }) as any,
        issuer: process.env.ADFS_OIDC_ISSUER!,
        audience: process.env.ADFS_OIDC_AUDIENCE!,
        algorithms: ["RS256", "RS384", "RS512"],
      },
      async (payload: any, cb) => {
        try {
          // Map common ADFS/AAD claim shapes to our UserInfo
          const email =
            payload?.email ||
            payload?.upn ||
            payload?.unique_name ||
            payload?.preferred_username ||
            "";
          const firstName = payload?.given_name || payload?.name || email || "User";
          const id = (payload?.sub || payload?.oid || payload?.sid || email || "").toString();

          // Default ADFS users to role "user"; adjust with your own mapping if needed
          const user = {
            id,
            firstName,
            role: "admin",
            email,
          };
          return cb(null, user);
        } catch (error) {
          return cb(error as Error);
        }
      }
    )
  : undefined;
