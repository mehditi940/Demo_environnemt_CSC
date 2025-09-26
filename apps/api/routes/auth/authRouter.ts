import "dotenv/config";
import { Router } from "express";
import { User, UserInfo, userSchema } from "../../schemas/user";
import passport from "passport";
import jwt from "jsonwebtoken";
import db from "../../schemas/db";
import { hashPassword } from "../../utils/passwordHash";
import { eq } from "drizzle-orm";
import { authorizationMiddleware } from "../../services/authorizationMiddleware";
import { modelSchema } from "../../schemas/model";
import { connectionSchema } from "../../schemas/connection";
import { roomSchema, usersToRooms } from "../../schemas/room";

const authRouter = Router();
const adfsEnabled = Boolean(
  process.env.ADFS_OIDC_JWKS_URI &&
    process.env.ADFS_OIDC_ISSUER &&
    process.env.ADFS_OIDC_AUDIENCE
);

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Endpoints for user authentication and account management
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - id
 *         - firstName
 *         - lastName
 *         - email
 *         - role
 *       properties:
 *         id:
 *           type: string
 *           format: string
 *           description: Unique identifier for the user
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         firstName:
 *           type: string
 *           description: The first name of the user
 *           example: John
 *         lastName:
 *           type: string
 *           description: The last name of the user
 *           example: Doe
 *         email:
 *           type: string
 *           format: email
 *           description: The email of the user
 *           example: johndoe@example.com
 *         role:
 *           type: string
 *           enum: [user, admin, super-admin]
 *           description: The role of the user
 *           example: user
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-03-17T12:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-03-18T14:30:00Z"
 *
 * paths:
 *   /auth/login:
 *     post:
 *       summary: Login user
 *       description: Authenticate user using email and password. Returns a JWT token.
 *       tags: [Auth]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - email
 *                 - password
 *               properties:
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: user@example.com
 *                 password:
 *                   type: string
 *                   example: "yourpassword123"
 *       responses:
 *         200:
 *           description: User authenticated successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   token:
 *                     type: string
 *                     description: JWT authentication token
 *                     example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         400:
 *           description: Invalid credentials
 *         500:
 *           description: Server error
 *
 *   /auth/register:
 *     post:
 *       summary: Register a new user
 *       description: Creates a new user account with hashed password.
 *       tags: [Auth]
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - firstName
 *                 - lastName
 *                 - email
 *                 - password
 *               properties:
 *                 firstName:
 *                   type: string
 *                   example: John
 *                 lastName:
 *                   type: string
 *                   example: Doe
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: johndoe@example.com
 *                 role:
 *                   type: string
 *                   enum: [user, admin, super-admin]
 *                   example: user
 *                 password:
 *                   type: string
 *                   example: "securepassword123"
 *       responses:
 *         201:
 *           description: User registered successfully
 *         400:
 *           description: Invalid input
 *         401:
 *           description: Unauthorized - Invalid or missing token
 *         500:
 *           description: Server error
 *
 *   /auth/me:
 *     get:
 *       summary: Get current user
 *       description: Returns the authenticated user's information.
 *       tags: [Auth]
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         200:
 *           description: Successfully retrieved user data
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/User'
 *         401:
 *           description: Unauthorized - Invalid or missing token
 *         500:
 *           description: Server error
 *
 *   /auth/change-password:
 *     post:
 *       summary: Change user password
 *       description: Allows a super-admin to change a user's password.
 *       tags: [Auth]
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - userId
 *                 - password
 *               properties:
 *                 userId:
 *                   type: string
 *                   format: string
 *                   description: The ID of the user whose password is being changed
 *                   example: "550e8400-e29b-41d4-a716-446655440000"
 *                 password:
 *                   type: string
 *                   description: The new password
 *                   example: "newsecurepassword123"
 *       responses:
 *         200:
 *           description: Password changed successfully
 *         400:
 *           description: Invalid input
 *         401:
 *           description: Unauthorized - Insufficient permissions
 *         500:
 *           description: Server error
 *   /auth/change-password-by-email:
 *     post:
 *       summary: Change user password
 *       description: Allows a super-admin to change a user's password.
 *       tags: [Auth]
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - email
 *                 - password
 *               properties:
 *                 email:
 *                   type: string
 *                   format: string
 *                   description: The email of the user whose password is being changed
 *                   example: "johndoe@email.com"
 *                 password:
 *                   type: string
 *                   description: The new password
 *                   example: "newsecurepassword123"
 *       responses:
 *         200:
 *           description: Password changed successfully
 *         400:
 *           description: Invalid input
 *         401:
 *           description: Unauthorized - Insufficient permissions
 *         500:
 *           description: Server error
 *   /auth/account/{email}:
 *     get:
 *       summary: Get user by email
 *       description: Allows a super-admin to fetch user details by email.
 *       tags: [Auth]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: email
 *           required: true
 *           schema:
 *             type: string
 *             format: email
 *           description: The email address of the user to retrieve
 *       responses:
 *         200:
 *           description: User data retrieved successfully
 *         400:
 *           description: Invalid input
 *         401:
 *           description: Unauthorized - Only accessible by super-admin
 *         404:
 *           description: User not found
 *         500:
 *           description: Server error
 *   /auth/users:
 *     get:
 *       summary: Get list of all users
 *       description: Allows a super-admin to retrieve a list of all registered users.
 *       tags: [Auth]
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         200:
 *           description: List of users retrieved successfully
 *         400:
 *           description: Invalid input
 *         401:
 *           description: Unauthorized - Only accessible by super-admin
 *         500:
 *           description: Server error
 *   /auth/account/{id}:
 *     get:
 *       summary: Get user by ID
 *       description: Allows a super-admin or the user themselves to retrieve user details by ID.
 *       tags: [Auth]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *           description: The ID of the user to retrieve
 *       responses:
 *         200:
 *           description: User data retrieved successfully
 *         400:
 *           description: Invalid input
 *         401:
 *           description: Unauthorized - Insufficient permissions
 *         404:
 *           description: User not found
 *         500:
 *           description: Server error
 *     delete:
 *       summary: Delete user account
 *       description: Allows a super-admin or the user themselves to delete an account.
 *       tags: [Auth]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *             format: string
 *           description: The ID of the user to delete
 *       responses:
 *         200:
 *           description: User deleted successfully
 *         400:
 *           description: Invalid input
 *         401:
 *           description: Unauthorized - Insufficient permissions
 *         500:
 *           description: Server error
 * 
 *
 */
// Login Route
type LoginRequestBody = Pick<User, "email" | "password">;
if (!adfsEnabled) {
  authRouter.post("/login", (req, res, next) => {
    passport.authenticate("local", (err: Error, user: User) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const body = req.body as LoginRequestBody;
      if (!body.email || !body.password) {
        return res.status(400).json({ message: "Invalid input" });
      }

      req.login(user, { session: false }, (err) => {
        if (err) {
          res.send(err);
          return;
        }

        const token = jwt.sign(user, process.env.JWT_SECRET!);
        res.json({ token });
      });
    })(req, res, next);
  });
} else {
  authRouter.post("/login", (_req, res) => {
    res.status(404).json({
      message:
        "Local login is disabled because AD FS authentication is configured.",
    });
  });
}

// Register Route
// Register Route
type RegisterRequestBody = Pick<
  User,
  "firstName" | "email" | "password" | "lastName" | "role"
>;
if (!adfsEnabled) {
  authRouter.post("/register", async (req, res) => {
    const body = req.body as RegisterRequestBody;

    if (
      !body.firstName ||
      !body.lastName ||
      !body.email ||
      !body.password
    ) {
      res.status(400).json({ message: "Invalid input" });
      return;
    }

    try {
      const userCount = await db.$count(userSchema);

      // Als er nog geen users zijn, maak dan een super-admin aan
      const role = userCount === 0 ? "super-admin" : body.role || "user";

      // Check for duplicate email before inserting
      const existing = await db
        .select({ id: userSchema.id })
        .from(userSchema)
        .where(eq(userSchema.email, body.email));
      if (existing.length > 0) {
        res.status(409).json({ message: "Email already in use" });
        return;
      }

      const { hash, salt } = await hashPassword(req.body.password);
      await db.insert(userSchema).values({
        email: body.email,
        password: hash,
        salt: salt,
        firstName: body.firstName,
        lastName: body.lastName,
        role: role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      res.status(201).send({ message: "User registered successfully" });
    } catch (error) {
      console.error("Registration error:", error);
      const message =
        error instanceof Error &&
        /unique constraint|SQLITE_CONSTRAINT_UNIQUE/i.test(error.message)
          ? "Email already in use"
          : "Invalid input";
      const status = message === "Email already in use" ? 409 : 400;
      res.status(status).json({
        message,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });
} else {
  authRouter.post(
    "/register",
    passport.authenticate("adfs-jwt", { session: false }),
    authorizationMiddleware("super-admin"),
    async (_req, res) => {
      res.status(403).json({
        message: "User registration is managed via Active Directory.",
      });
    }
  );
}

// Me Route
authRouter.get(
  "/me",
  passport.authenticate("adfs-jwt", { session: false }),
  (req, res) => {
    res.status(200).json(req.user);
  }
);

//Change Password Route
type ChangePasswordRequestBody = Pick<User, "password"> & { userId: string };
authRouter.post(
  "/change-password",
  passport.authenticate("adfs-jwt", { session: false }),
  async (req, res) => {
    const body = req.body as ChangePasswordRequestBody;
    const user = req.user as UserInfo;
    if (!body.password || !body.userId) {
      res.status(400).json({ message: "Invalid input" });
      return;
    }

    if (user.role !== "super-admin") {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    try {
      const { hash, salt } = await hashPassword(req.body.password);
      await db
        .update(userSchema)
        .set({
          password: hash,
          salt: salt,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(userSchema.id, body.userId));
      res.status(200).send({ message: "Password changed successfully" });
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  }
);

//Change Password by Email Route
type ChangePasswordByEmailRequestBody = Pick<User, "password" | "email">;
authRouter.post(
  "/change-password-by-email",
  passport.authenticate("adfs-jwt", { session: false }),
  async (req, res) => {
    const body = req.body as ChangePasswordByEmailRequestBody;
    const user = req.user as UserInfo;
    if (!body.password || !body.email) {
      res.status(400).json({ message: "Invalid input" });
      return;
    }

    if (user.role !== "super-admin") {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    try {
      const { hash, salt } = await hashPassword(req.body.password);
      await db
        .update(userSchema)
        .set({
          password: hash,
          salt: salt,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(userSchema.email, body.email));
      res.status(200).send({ message: "Password changed successfully" });
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  }
);

authRouter.delete(
  "/account/:id",
  passport.authenticate("adfs-jwt", { session: false }),
  async (req, res) => {
    try {
      const requestingUser = req.user as UserInfo;
      const userIdToDelete = req.params.id;

      // Check if user exists
      const userToDeleteArr = await db
        .select()
        .from(userSchema)
        .where(eq(userSchema.id, userIdToDelete));
      const userToDelete = userToDeleteArr[0];

      if (!userToDelete) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      // Authorization check
      if (requestingUser.role === "super-admin") {
        if (userToDelete.role === "system" || userToDelete.role === "super-admin") {
          res.status(403).json({
            message: "System accounts cannot be deleted"
          });
          return;
        }
      } else if (requestingUser.id !== userIdToDelete) {
        res.status(403).json({
          message: "You can only delete your own account"
        });
        return;
      }

      // Start a transaction to handle all related deletions
      await db.transaction(async (tx) => {
        // First delete all models created by this user
        await tx.delete(modelSchema)
          .where(eq(modelSchema.addedBy, userIdToDelete));

        // Delete all connections started by this user
        await tx.delete(connectionSchema)
          .where(eq(connectionSchema.startedBy, userIdToDelete));

        // Remove user from all rooms (usersToRooms)
        await tx.delete(usersToRooms)
          .where(eq(usersToRooms.userId, userIdToDelete));

        // Update rooms created by this user to set createdBy to null
        await tx.update(roomSchema)
          .set({ createdBy: undefined })
          .where(eq(roomSchema.createdBy, userIdToDelete));

        // Finally delete the user
        await tx.delete(userSchema)
          .where(eq(userSchema.id, userIdToDelete));
      });

      res.status(200).json({
        message: "User deleted successfully"
      });
    } catch (error) {
      console.error("Delete error:", error);
      res.status(500).json({
        message: "Failed to delete user due to database constraints",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);
//Get user by email Route
authRouter.get(
  "/account/:email",
  passport.authenticate("adfs-jwt", { session: false }),
  async (req, res) => {
    const user = req.user as UserInfo;
    const email = req.params.email;
    if (user.role !== "super-admin") {
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
        .where(eq(userSchema.email, email));
      if (!userData) {
        res.status(404).send({ message: "User not found" });
        return;
      }
      res.status(200).send(userData);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  }
);

//Get users list Route
authRouter.get(
  "/users",
  passport.authenticate("adfs-jwt", { session: false }),
  async (req, res) => {
    const user = req.user as UserInfo;
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
      res.status(200).send(users);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  }
);

authRouter.get(
  "/account/:id",
  passport.authenticate("adfs-jwt", { session: false }),
  async (req, res) => {
    const user = req.user as UserInfo;
    const id = req.params.id;
    if (user.role !== "super-admin" && user.id !== id) {
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
      
      if (userData.length === 0) {  // Controleer op lege array
        res.status(404).send({ message: "User not found" });
        return;
      }
      res.status(200).send(userData[0]);  // Stuur het eerste (en enige) element
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  }
);
export default authRouter;


/**
 * @swagger
 * /auth/account/{id}:
 *   put:
 *     summary: Update user account
 *     description: Allows a super-admin or the user themselves to update account details.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: Updated first name
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 description: Updated last name
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Updated email address
 *                 example: "john.doe@example.com"
 *               role:
 *                 type: string
 *                 enum: [user, admin, super-admin]
 *                 description: Updated role (only changeable by super-admin)
 *                 example: "admin"
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized - Insufficient permissions
 *       403:
 *         description: Forbidden - Cannot modify certain attributes
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

type UpdateUserRequestBody = Partial<Pick<User, "firstName" | "lastName" | "email" | "role">>;

authRouter.put(
  "/account/:id",
  passport.authenticate("adfs-jwt", { session: false }),
  async (req, res) => {
    try {
      const requestingUser = req.user as UserInfo;
      const userIdToUpdate = req.params.id;
      const updateData = req.body as UpdateUserRequestBody;

      // Check if user exists
      const userToUpdateArr = await db
        .select()
        .from(userSchema)
        .where(eq(userSchema.id, userIdToUpdate));
      const userToUpdate = userToUpdateArr[0];

      if (!userToUpdate) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      // Authorization check
      if (requestingUser.id !== userIdToUpdate && requestingUser.role !== "super-admin") {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      // Additional checks for role changes
      if (updateData.role) {
        if (requestingUser.role !== "super-admin") {
          res.status(403).json({ 
            message: "Only super-admin can change roles" 
          });
          return;
        }
        
        // Prevent modifying system or other super-admin accounts
        if (userToUpdate.role === "system" || 
            (userToUpdate.role === "super-admin" && requestingUser.id !== userIdToUpdate)) {
          res.status(403).json({ 
            message: "Cannot modify this account's role" 
          });
          return;
        }
      }

      // Prevent email changes for system accounts
      if (updateData.email && userToUpdate.role === "system") {
        res.status(403).json({ 
          message: "System account email cannot be changed" 
        });
        return;
      }

      // Build update object
      const updateObject: Partial<User> = {
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      // Update user
      const updatedUser = await db
        .update(userSchema)
        .set(updateObject)
        .where(eq(userSchema.id, userIdToUpdate))
        .returning({
          id: userSchema.id,
          firstName: userSchema.firstName,
          lastName: userSchema.lastName,
          email: userSchema.email,
          role: userSchema.role,
          createdAt: userSchema.createdAt,
          updatedAt: userSchema.updatedAt
        });

      res.status(200).json(updatedUser[0]);
      return;
    } catch (error) {
      console.error("Update error:", error);
      if (error instanceof Error && error.message.includes("unique constraint")) {
        res.status(400).json({ message: "Email already in use" });
        return;
      }
      res.status(500).json({ 
        message: "Server error", 
        error: error instanceof Error ? error.message : String(error) 
      });
      return;
    }
  }
);
