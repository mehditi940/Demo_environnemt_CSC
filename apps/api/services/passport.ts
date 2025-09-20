import "dotenv/config";
import { Strategy as LocalStategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
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
export const PassportJwtStrategy = new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET!,
  },
  async (jwtPayload, cb) => {
    try {
      // Find user by id
      const users = await db
        .select()
        .from(userSchema)
        .where(eq(userSchema.id, jwtPayload.id))
        .limit(1);

      if (users.length === 0) {
        return cb(null, false);
      }

      // If user exists, return user info without password and salt
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
);

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
