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
  process.env.ADFS_OIDC_ISSUER
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
        // Accept both the OIDC issuer (for id_token) and the OAuth access token issuer used by AD FS
        issuer: (() => {
          const oidcIssuer = process.env.ADFS_OIDC_ISSUER!;
          const configuredAccessIssuer = process.env.ADFS_ACCESS_TOKEN_ISSUER;
          // Derive a common AD FS access token issuer if not explicitly configured
          const derivedAccessIssuer = (() => {
            try {
              if (!oidcIssuer) return undefined;
              const u = new URL(oidcIssuer);
              // AD FS typically uses http and '/adfs/services/trust' for access tokens
              return `http://${u.host}/adfs/services/trust`;
            } catch {
              return undefined;
            }
          })();
          return [oidcIssuer, configuredAccessIssuer || derivedAccessIssuer].filter(Boolean) as string[];
        })(),
        // audience is optional; when provided can be comma-separated list
        audience: process.env.ADFS_OIDC_AUDIENCE,
        algorithms: ["RS256", "RS384", "RS512"],
      },
      async (payload: any, cb) => {
        try {
          // Extract common identity fields from token
          const email =
            payload?.email ||
            payload?.upn ||
            payload?.unique_name ||
            payload?.preferred_username ||
            "";
          const firstName = payload?.given_name || payload?.name || email || "User";
          const id = (payload?.sub || payload?.oid || payload?.sid || email || "").toString();

          // Helper: collect potential group/role claims into a flat list of strings
          const extractStrings = (val: any): string[] => {
            if (!val) return [];
            if (Array.isArray(val)) return val.map((v) => String(v));
            if (typeof val === "string") {
              // split on common separators if multiple values
              return String(val)
                .split(/[;,]/)
                .map((s) => s.trim())
                .filter(Boolean);
            }
            return [];
          };

          const candidateKeys = [
            "groups",
            "group",
            "roles",
            "role",
            // Common ADFS/AAD claim URIs that might be flattened by libraries
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
            "http://schemas.xmlsoap.org/claims/Group",
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/groups",
          ];

          let groups: string[] = [];
          for (const key of candidateKeys) {
            groups = groups.concat(extractStrings(payload?.[key]));
          }

          // Normalize values for comparison
          const norm = (s: string) => s.toLowerCase();
          const groupSet = new Set(groups.map(norm));

          // Configurable group-to-role mapping via env vars (comma-separated lists)
          const envToList = (name: string, def?: string[]): string[] => {
            const raw = process.env[name];
            if (!raw || raw.trim() === "") return def || [];
            return raw
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
          };

          const adminGroups = envToList("ADFS_GROUP_ADMIN", ["Domain Admins"]).map(norm);
          const surgeonGroups = envToList("ADFS_GROUP_SURGEON", ["umc-chirugen"]).map(norm);

          const isInAny = (set: Set<string>, list: string[]) => list.some((g) => set.has(g));

          // Determine role by membership; admin takes precedence over surgeon
          let resolvedRole: "super-admin" | "admin" | "user" | "system" | "surgeon" =
            (process.env.ADFS_DEFAULT_ROLE as any) || "admin";

          if (isInAny(groupSet, adminGroups)) {
            resolvedRole = "admin";
          } else if (isInAny(groupSet, surgeonGroups)) {
            resolvedRole = "surgeon" as any; // accepted by frontend routing
          }

          const user = {
            id,
            firstName,
            role: resolvedRole,
            email,
          };
          return cb(null, user);
        } catch (error) {
          return cb(error as Error);
        }
      }
    )
  : undefined;
