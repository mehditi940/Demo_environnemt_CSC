import "dotenv/config";
import { Router } from "express";
import { Role, User, UserInfo } from "../../schemas/user";
import passport from "passport";
import jwt from "jsonwebtoken";
import db from "../../schemas/db";
import { hashPassword } from "../../utils/passwordHash";
import { authorizationMiddleware } from "../../services/authorizationMiddleware";

const authRouter = Router();

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
 *           enum: [user, surgeon, admin]
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
 *                   enum: [user, surgeon, admin]
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
      }

      const token = jwt.sign(user, process.env.JWT_SECRET!);
      return res.json({ token }); 
    });
  })(req, res, next);
});

// Register Route
// Register Route
type RegisterRequestBody = Pick<
  User,
  "firstName" | "email" | "password" | "lastName" | "role"
>;
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
    const userCount = await db.user.count();
    
    // First user is admin, subsequent users default to 'user' role
    const role: Role = userCount === 0 ? Role.Admin : (body.role as Role) || Role.User;

    // Check for duplicate email before inserting
    const existing = await db.user.findUnique({
      where: { email: body.email },
      select: { id: true }
    });
    if (existing) {
      res.status(409).json({ message: "Email already in use" });
      return;
    }

    const { hash, salt } = await hashPassword(req.body.password);
    await db.user.create({
      data: {
        email: body.email,
        password: hash,
        salt: salt,
        firstName: body.firstName,
        lastName: body.lastName,
        role: role,
      }
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

// Me Route
authRouter.get(
  "/me",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.status(200).json(req.user);
  }
);

//Change Password Route
type ChangePasswordRequestBody = Pick<User, "password"> & { userId: string };
authRouter.post(
  "/change-password",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const body = req.body as ChangePasswordRequestBody;
    const user = req.user as UserInfo;
    if (!body.password || !body.userId) {
      res.status(400).json({ message: "Invalid input" });
      return;
    }

    if (user.role !== Role.Admin) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    try {
      const { hash, salt } = await hashPassword(req.body.password);
      await db.user.update({
        where: { id: body.userId },
        data: {
          password: hash,
          salt: salt,
        }
      });
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
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const body = req.body as ChangePasswordByEmailRequestBody;
    const user = req.user as UserInfo;
    if (!body.password || !body.email) {
      res.status(400).json({ message: "Invalid input" });
      return;
    }

    if (user.role !== Role.Admin) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    try {
      const { hash, salt } = await hashPassword(req.body.password);
      await db.user.update({
        where: { email: body.email },
        data: {
          password: hash,
          salt: salt,
        }
      });
      res.status(200).send({ message: "Password changed successfully" });
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  }
);

authRouter.delete(
  "/account/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const requestingUser = req.user as UserInfo;
      const userIdToDelete = req.params.id;

      // Check if user exists
      const userToDelete = await db.user.findUnique({
        where: { id: userIdToDelete }
      });

      if (!userToDelete) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      // Authorization check
      if (requestingUser.role === Role.Admin) {
        if (userToDelete.role === Role.System || userToDelete.role === Role.Admin) {
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
      await db.$transaction(async (tx) => {
        // First delete all models created by this user
        await tx.model.deleteMany({
          where: { addedBy: userIdToDelete }
        });

        // Delete all connections started by this user
        await tx.connection.deleteMany({
          where: { startedBy: userIdToDelete }
        });

        // Remove user from all rooms (userRooms)
        await tx.userRoom.deleteMany({
          where: { userId: userIdToDelete }
        });

        // Delete rooms created by this user
        await tx.room.deleteMany({
          where: { createdBy: userIdToDelete }
        });

        // Finally delete the user
        await tx.user.delete({
          where: { id: userIdToDelete }
        });
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
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const user = req.user as UserInfo;
    const email = req.params.email;
    if (user.role !== Role.Admin) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    try {
      const userData = await db.user.findUnique({
        where: { email },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        }
      });
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
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const user = req.user as UserInfo;
    // Allow all authenticated users to get the users list
    // (they can only see surgeons and users, not admin/system)

    try {
      let users;
      if (user.role === Role.Admin) {
        // Admin can see all users
        users = await db.user.findMany({
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            deleted: true,
            createdAt: true,
            updatedAt: true,
          }
        });
      } else {
        // Non-admin users can only see surgeons and regular users (not admin/system)
        users = await db.user.findMany({
          where: {
            role: {
              in: ['surgeon', 'user']
            }
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            deleted: true,
            createdAt: true,
            updatedAt: true,
          }
        });
      }
      res.status(200).send(users);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  }
);

authRouter.get(
  "/account/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const user = req.user as UserInfo;
    const id = req.params.id;
    if (user.role !== Role.Admin && user.id !== id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    try {
      const userData = await db.user.findUnique({
        where: { id },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        }
      });
      
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
 *                 enum: [user, surgeon, admin]
 *                 description: Updated role (only changeable by admin)
 *                 example: "surgeon"
 *               deleted:
 *                 type: string
 *                 enum: ["true", "false"]
 *                 description: Soft delete status (only changeable by admin)
 *                 example: "false"
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

type UpdateUserRequestBody = Partial<Pick<User, "firstName" | "lastName" | "email" | "role" | "deleted">>;

authRouter.put(
  "/account/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const requestingUser = req.user as UserInfo;
      const userIdToUpdate = req.params.id;
      const updateData = req.body as UpdateUserRequestBody;

      // Check if user exists
      const userToUpdate = await db.user.findUnique({
        where: { id: userIdToUpdate }
      });

      if (!userToUpdate) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      // Authorization check
      if (requestingUser.id !== userIdToUpdate && requestingUser.role !== Role.Admin) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      // Additional checks for role changes
      if (updateData.role) {
        if (requestingUser.role !== Role.Admin) {
          res.status(403).json({ 
            message: "Only admin can change roles" 
          });
          return;
        }
        
        // Prevent modifying system or other admin accounts
        if (userToUpdate.role === Role.System || 
            (userToUpdate.role === Role.Admin && requestingUser.id !== userIdToUpdate)) {
          res.status(403).json({ 
            message: "Cannot modify this account's role" 
          });
          return;
        }
      }

      // Additional checks for deleted field changes
      if (updateData.deleted !== undefined) {
        if (requestingUser.role !== Role.Admin) {
          res.status(403).json({ 
            message: "Only admin can change deleted status" 
          });
          return;
        }
        
        // Prevent modifying system or other admin accounts
        if (userToUpdate.role === Role.System || 
            (userToUpdate.role === Role.Admin && requestingUser.id !== userIdToUpdate)) {
          res.status(403).json({ 
            message: "Cannot modify this account's deleted status" 
          });
          return;
        }
      }

      // Prevent email changes for system accounts
      if (updateData.email && userToUpdate.role === Role.System) {
        res.status(403).json({ 
          message: "System account email cannot be changed" 
        });
        return;
      }

      // Update user
      const updatedUser = await db.user.update({
        where: { id: userIdToUpdate },
        data: {
          ...updateData,
          role: updateData.role || undefined,
          deleted: updateData.deleted || undefined
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          deleted: true,
          createdAt: true,
          updatedAt: true
        }
      });

      res.status(200).json(updatedUser);
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