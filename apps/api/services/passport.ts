import "dotenv/config";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import jwksRsa from "jwks-rsa";
import { Strategy as BearerStrategy } from "passport-http-bearer";
import crypto from "crypto";
import db from "../schemas/db";
import { userSchema } from "../schemas/user";
import { eq } from "drizzle-orm";
import { verifyPassword } from "../utils/passwordHash";

  // Local login strategy for passport authentication
  export const LocalLoginStrategy = new LocalStrategy( 
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
        const isValid = await verifyPassword(password, user.password,
  user.salt);

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

  // ============ ADFS helpers ============

  function csvToList(value?: string): string[] {
  return (value || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
  }

  // Allow both ROLE_MAP_* and GROUP_* envs
  const ADMIN_MATCHES = [
  ...csvToList(process.env.ADFS_ROLE_MAP_ADMIN),
  ...csvToList(process.env.ADFS_GROUP_ADMIN),
  ];
  const SURGEON_MATCHES = [
  ...csvToList(process.env.ADFS_ROLE_MAP_SURGEON),
  ...csvToList(process.env.ADFS_GROUP_SURGEON),
  ];

  // Which claim keys to inspect for roles/groups
  const CLAIM_KEYS = csvToList(process.env.ADFS_ROLE_CLAIMS).length
  ? csvToList(process.env.ADFS_ROLE_CLAIMS)
  : [
  "roles",
  "role",
  "groups",
  "group",
  "groupsid",
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/groupsid",
  ];

  function getTokenGroups(payload: any): string[] {
  const results: string[] = [];
  for (const key of CLAIM_KEYS) {
  const v = payload?.[key];
  if (!v) continue;
  if (Array.isArray(v)) {
  for (const item of v) if (typeof item === "string") results.push(item);
  } else if (typeof v === "string") {
  const parts = v.split(/[;,\s]+/).map((s) => s.trim()).filter(Boolean);
  results.push(...parts);
  }
  }
  return Array.from(new Set(results));
  }

  function pickUiRole(groups: string[]): "chirurg" | "admin" | "user" {
  const hasAdmin = groups.some((g) =>
  ADMIN_MATCHES.some((m) => g.toLowerCase() === m.toLowerCase())
  );
  if (hasAdmin) return "admin";
  const hasSurgeon = groups.some((g) =>
  SURGEON_MATCHES.some((m) => g.toLowerCase() === m.toLowerCase())
  );
  if (hasSurgeon) return "chirurg";
  return "user";
  }

  
// ============ ADFS / OIDC JWT strategy ============
const hasAdfsEnv = !!(
  process.env.ADFS_OIDC_JWKS_URI &&
  process.env.ADFS_OIDC_ISSUER
);

export const AdfsJwtStrategy = hasAdfsEnv
  ? new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        // Dynamisch signing keys ophalen via JWKS
        secretOrKeyProvider: jwksRsa.passportJwtSecret({
          jwksUri: process.env.ADFS_OIDC_JWKS_URI!,
          cache: true,
          cacheMaxEntries: 5,
          cacheMaxAge: 10 * 60 * 1000, // 10 min
          rateLimit: true,
          jwksRequestsPerMinute: 5,
        }) as any, // type cast i.v.m. passport-jwt typings
        // Primary issuer + optionele legacy issuer
        issuer: [process.env.ADFS_OIDC_ISSUER!, process.env.ADFS_OIDC_LEGACY_ISSUER || ""].filter(Boolean),
        // audience kan enkelvoudig zijn (bijv. api://umc-webapp)
        audience: process.env.ADFS_OIDC_AUDIENCE,
        algorithms: ["RS256", "RS384", "RS512"],
      },
      async (payload: any, cb: (err: any, user?: any, info?: any) => void) => {
        try {
          // Map veelvoorkomende ADFS/AAD claim keys
          const email =
            payload?.email ||
            payload?.upn ||
            payload?.unique_name ||
            payload?.preferred_username ||
            "";
          const firstName = payload?.given_name || payload?.name || email || "User";
          const id = (payload?.sub || payload?.oid || payload?.sid || email || "").toString();

          // Extract groups/roles uit token
          const groups = getTokenGroups(payload);
          const uiRole = pickUiRole(groups);

          // Backend-rol: 'admin' bij uiRole admin, anders default/user
          const backendRole = uiRole === "admin" ? "admin" : (process.env.ADFS_DEFAULT_ROLE || "user");

          const user = {
            id,
            firstName,
            role: backendRole,
            email,
            groups,
            uiRole,
          };

          return cb(null, user);
        } catch (error) {
          return cb(error as Error);
        }
      }
    )
  : undefined;

