import "dotenv/config";
import { Router } from "express";
import passport from "passport";
import { getAuthMiddleware } from "../../services/passportAuth";
import db from "../../schemas/db";
import { authorizationMiddleware } from "../../services/authorizationMiddleware";
import { patientInsertSchema, patientSchema } from "../../schemas/patient";
import { count, eq } from "drizzle-orm";
import { UserInfo } from "../../schemas/user";
import { ConnectionResponse, connectionSchema } from "../../schemas/connection";

const connectionRouter = Router();

const requireAuth = getAuthMiddleware();

/**
 * @swagger
 * tags:
 *   - name: Connection
 *     description: Endpoints for connection management
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Connection:
 *       type: object
 *       required:
 *         - roomId
 *         - socketUrl
 *         - pinCode
 *         - QrCodeString
 *       properties:
 *         roomId:
 *           type: string
 *           format: string
 *           description: The ID of the room
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         socketUrl:
 *           type: string
 *           description: The socket URL for the connection
 *           example: "wss://example.com/socket"
 *         pinCode:
 *           type: string
 *           description: The pin code that can be used to join the room
 *           example: "AB12"
 *         qrCodeString:
 *           type: string
 *           description: The string to be encoded in the QR code
 *           example: "{roomId: '550e8400-e29b-41d4-a716-446655440000', socketUrl: 'wss://example.com/socket'}"
 *
 * paths:
 *   /connection:
 *     post:
 *       summary: Create a new connection request
 *       description: Allows a user to create a new connection request.
 *       tags: [Connection]
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - roomId
 *               properties:
 *                 roomId:
 *                   type: string
 *                   format: string
 *                   example: "550e8400-e29b-41d4-a716-446655440000"
 *       responses:
 *         200:
 *           description: Successfully created connection request
 *           content:
 *             application/json:
 *               schema:
 *                $ref: '#/components/schemas/Connection'
 *         400:
 *           description: Invalid request
 *         401:
 *           description: Unauthorized
 *         403:
 *           description: Insufficient permissions
 *         500:
 *           description: Server error
 *     get:
 *       summary: Get connection request object by pin code
 *       description: Allows a user to get a connection request object by pin.
 *       tags: [Connection]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: pinCode
 *           required: true
 *           schema:
 *             type: string
 *             format: string
 *             description: The pin code of the connection request
 *             required: true
 *       responses:
 *         200:
 *           description: Successfully retrieved connection request object
 *           content:
 *             application/json:
 *              schema:
 *               type: object
 *               properties:
 *                  roomId:
 *                    type: string
 *                    description: The ID of the room
 *                    example: "550e8400-e29b-41d4-a716-446655440000"
 *                  socketUrl:
 *                    type: string
 *                    description: The socket URL for the connection
 *                    example: "wss://example.com/socket"
 *         401:
 *           description: Unauthorized
 *         403:
 *           description: Insufficient permissions
 *         410:
 *           description: Connection request not found or expired
 *         500:
 *           description: Server error
 *
 */

// Create a connection request
connectionRouter.post(
  "/",
  requireAuth,
  authorizationMiddleware("super-admin"),
  async (req, res) => {
    try {
      try {
        if (req.body.roomId === undefined) {
          res.status(400).send({ message: "roomId is required" });
          return;
        }

        const { roomId } = req.body;
        const socketUrl = process.env.API_URL;

        if (!socketUrl) {
          res.status(500).send({ message: "socketUrl is not defined" });
          return;
        }

        const userId = (req.user as UserInfo).id;

        const newConnections = await db
          .insert(connectionSchema)
          .values({
            roomId,
            startedBy: userId,
          })
          .returning();

        if (newConnections.length === 0) {
          res.status(400).send({ message: "failed to create connection" });
          return;
        }

        const connection = newConnections[0];

        const connectionRespose: ConnectionResponse = {
          roomId: connection.roomId,
          socketUrl: socketUrl,
          pinCode: connection.pinCode,
          qrCodeString: JSON.stringify({
            roomId: connection.roomId,
            socketUrl: socketUrl,
          }),
        };

        res.status(200).send(connectionRespose);
      } catch (error) {
        console.log(error);
        res.status(400).send({ message: "invalid request" });
        return;
      }
    } catch (error) {
      res.status(500).send({ message: "failed to create room" });
    }
  }
);

// Get connection request object by pin code
connectionRouter.get(
  "/:pinCode",
  passport.authenticate("bearer", { session: false }),
  async (req, res) => {
    try {
      const { pinCode } = req.params;

      if (!pinCode) {
        res.status(400).send({ message: "pinCode is required" });
        return;
      }

      const connection = await db
        .select()
        .from(connectionSchema)
        .where(eq(connectionSchema.pinCode, pinCode))
        .limit(1)
        .execute();

      if (connection.length === 0) {
        res.status(410).send({ message: "connection not found" });
        return;
      }

      // Check if the connection is expired
      if (new Date(connection[0].validUntil) < new Date()) {
        res.status(410).send({ message: "connection expired" });
        return;
      }

      res.status(200).send({
        roomId: connection[0].roomId,
        socketUrl: process.env.API_URL,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "failed to get connection" });
    }
  }
);

export default connectionRouter;
