import "dotenv/config";
import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { eq, sql } from "drizzle-orm";

import db from "../../schemas/db";
import { hashPassword } from "../../utils/passwordHash";
import { getAuthMiddleware } from "../../services/passportAuth";

import { User, UserInfo, userSchema } from "../../schemas/user";

const authRouter = Router();
const requireAuth = getAuthMiddleware();

// ===== Helpers =====
type AnyUser = UserInfo & { uiRole?: string; groups?: string[] };

const isPrivileged = (u: AnyUser | undefined | null): boolean =>
  !!u && (u.role === "super-admin" || u.role === "admin" || u.uiRole === "admin");

// ===== Me (huidige gebruiker) =====
authRouter.get("/me", requireAuth, async (req, res): Promise<void> => {
  try {
    const user = req.user as AnyUser | undefined;
    if (user?.id) {
      res.status(200).json({
        id: user.id,
        firstName: user.firstName,
        email: user.email,
        role: user.role,
        uiRole: user.uiRole,
        groups: user.groups,
      });
      return;
    }
    res.status(401).json({ message: "Unauthorized" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// ===== Login =====
type LoginRequestBody = Pick<User, "email" | "password">;

authRouter.post("/login", (req, res, next) => {
  const body = req.body as Partial<LoginRequestBody>;
  if (!body?.email || !body?.password) {
    res.status(400).json({ message: "Invalid input" });
    return;
  }

  passport.authenticate(
    "local",
    (err: Error | null, user: AnyUser | false /* passport returns false on fail */) => {
      if (err) return next(err);
      if (!user) return res.status(400).json({ message: "Invalid credentials" });

      req.login(user, { session: false }, (loginErr) => {
        if (loginErr) return res.status(500).json({ message: "Login error" });

        const secret = process.env.JWT_SECRET;
        if (!secret) {
          return res.status(500).json({ message: "JWT secret not configured" });
        }

        // Beperk payload; zet evt. expiresIn
        const token = jwt.sign(
          {
            id: user.id,
            role: user.role,
            uiRole: user.uiRole,
            email: user.email,
          },
          secret,
          { expiresIn: "7d" }
        );

        return res.status(200).json({ token });
      });
    }
  )(req, res, next);
});

// ===== Register =====
type RegisterRequestBody = Pick<User, "firstName" | "lastName" | "email" | "password" | "role">;

authRouter.post("/register", async (req, res): Promise<void> => {
  const body = req.body as Partial<RegisterRequestBody>;

  if (!body?.firstName || !body?.lastName || !body?.email || !body?.password) {
    res.status(400).json({ message: "Invalid input" });
    return;
  }

  try {
    // Drizzle-compatible count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(userSchema);

    const role: User["role"] = (count === 0 ? "super-admin" : body.role) ?? "user";

    // Duplicate email check
    const existing = await db
      .select({ id: userSchema.id })
      .from(userSchema)
      .where(eq(userSchema.email, body.email));

    if (existing.length > 0) {
      res.status(409).json({ message: "Email already in use" });
      return;
    }

    const { hash: passwordHash, salt } = await hashPassword(body.password);

    const inserted = await db
      .insert(userSchema)
      .values({
        email: body.email,
        password: passwordHash,
        salt,
        firstName: body.firstName,
        lastName: body.lastName,
        role,
      })
      .returning({
        id: userSchema.id,
        firstName: userSchema.firstName,
        lastName: userSchema.lastName,
        email: userSchema.email,
        role: userSchema.role,
        createdAt: userSchema.createdAt,
        updatedAt: userSchema.updatedAt,
      });

    res.status(201).json(inserted[0]);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// ===== Users (alleen super-admin) =====
authRouter.get("/users", requireAuth, async (req, res): Promise<void> => {
  const user = req.user as AnyUser;
  if (user.role !== "super-admin") {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const users = await db
      .select({
        id: userSchema.id,
        firstName: userSchema.firstName,
        lastName: userSchema.lastName,
        email: userSchema.email,
        role: userSchema.role,
        deleted: userSchema.deleted,
        createdAt: userSchema.createdAt,
        updatedAt: userSchema.updatedAt,
      })
      .from(userSchema);

    res.status(200).json(users);
  } catch {
    res.status(400).json({ message: "Invalid input" });
  }
});

// ===== Account ophalen =====
authRouter.get("/account/:id", requireAuth, async (req, res): Promise<void> => {
  const requester = req.user as AnyUser;
  const id = req.params.id;

  if (requester.role !== "super-admin" && requester.id !== id) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const userData = await db
      .select({
        id: userSchema.id,
        firstName: userSchema.firstName,
        lastName: userSchema.lastName,
        email: userSchema.email,
        role: userSchema.role,
        createdAt: userSchema.createdAt,
        updatedAt: userSchema.updatedAt,
      })
      .from(userSchema)
      .where(eq(userSchema.id, id));

    if (userData.length === 0) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json(userData[0]);
  } catch {
    res.status(400).json({ message: "Invalid input" });
  }
});

// ===== Account updaten (admin mag ook) =====
type UpdateUserRequestBody = Partial<Pick<User, "firstName" | "lastName" | "email" | "role">>;

authRouter.put("/account/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const requestingUser = req.user as AnyUser;
    const userIdToUpdate = req.params.id;
    const updateData = req.body as UpdateUserRequestBody;

    // Bestaat user?
    const userToUpdateArr = await db.select().from(userSchema).where(eq(userSchema.id, userIdToUpdate));
    const userToUpdate = userToUpdateArr[0] as User | undefined;

    if (!userToUpdate) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Autorisatie: eigenaar mag zichzelf, admin/super-admin mag anderen
    if (requestingUser.id !== userIdToUpdate && !isPrivileged(requestingUser)) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Rol-wijzigingen
    if (updateData.role) {
      if (!isPrivileged(requestingUser)) {
        res.status(403).json({ message: "Only admin can change roles" });
        return;
      }

      // System accounts blijven beschermd
      if (userToUpdate.role === "system") {
        res.status(403).json({ message: "Cannot modify system account role" });
        return;
      }

      // Admin mag geen andere admin wijzigen (tenzij eigen account); super-admin wel
      if (
        userToUpdate.role === "admin" &&
        requestingUser.role !== "super-admin" &&
        requestingUser.id !== userIdToUpdate
      ) {
        res.status(403).json({ message: "Cannot modify other admin accounts" });
        return;
      }
    }

    // E-mail van system account niet wijzigen
    if (updateData.email && userToUpdate.role === "system") {
      res.status(403).json({ message: "System account email cannot be changed" });
      return;
    }

    // NB: je kunt hier optioneel een duplicate e-mail check doen vóór update
    // om een nette 409 te geven i.p.v. vertrouwen op DB-constraint.

    const updatedUser = await db
      .update(userSchema)
      .set({
        ...updateData,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(userSchema.id, userIdToUpdate))
      .returning({
        id: userSchema.id,
        firstName: userSchema.firstName,
        lastName: userSchema.lastName,
        email: userSchema.email,
        role: userSchema.role,
        createdAt: userSchema.createdAt,
        updatedAt: userSchema.updatedAt,
      });

    if (!updatedUser[0]) {
      res.status(404).json({ message: "User not found after update" });
      return;
    }

    res.status(200).json(updatedUser[0]);
  } catch (error) {
    console.error("Update error:", error);
    if (error instanceof Error && /unique constraint|duplicate/i.test(error.message)) {
      res.status(409).json({ message: "Email already in use" });
      return;
    }
    res.status(500).json({
      message: "Server error",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

export default authRouter;
