import "dotenv/config";
import { Router } from "express";
import passport from "passport";
import db from "../../schemas/db";
import { authorizationMiddleware } from "../../services/authorizationMiddleware";
import multer from "multer";
import { Role, UserInfo } from "../../schemas/user";
import {
  PopulatedRoom,
  Room,
  roomInsertSchema,
} from "../../schemas/room";
import { Patient } from "../../schemas/patient";

const roomRouter = Router();

/**
 * @swagger
 * tags:
 *   - name: Rooms
 *     description: Endpoints for room management
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Model:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - path
 *       properties:
 *         id:
 *           type: string
 *           description: The unique identifier for the model.
 *           example: "abc123"
 *         name:
 *           type: string
 *           description: The name of the model.
 *           example: "Example Model"
 *         path:
 *           type: string
 *           description: The storage path of the model.
 *           example: "/models/example-model"
 *     Room:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - createdBy
 *       properties:
 *         id:
 *           type: string
 *           format: string
 *           description: Unique identifier for the room
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         name:
 *           type: string
 *           description: The first name of the user
 *           example: John
 *         patient:
 *           type: object
 *           schema:
 *             $ref: '#/components/schemas/Patient'
 *           description: The patient in the room
 *         models:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Model'
 *           description: The models in the room
 *         createdBy:
 *           type: string
 *           description: The id of the user who created the room
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         type:
 *           type: string
 *           description: The type of the room
 *           enum: [patient, surgeon, demo]
 *           example: "patient"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-03-17T12:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-03-18T14:30:00Z"
 * paths:
 *   /room:
 *     post:
 *       summary: Create a new room
 *       description: Allows surgeon to create a new room in the database
 *       tags: [Rooms]
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           multipart/form-data:
 *             schema:
 *               type: object
 *               required:
 *                 - name
 *               properties:
 *                 name:
 *                   type: string
 *                   format: string
 *                   description: The name of the room
 *                   example: "Room 1"
 *                 patient:
 *                   type: string
 *                   format: uuid
 *                   description: The unique identifier for the patient associated with the room
 *                   example: "550e8400-e29b-41d4-a716-446655440000"
 *                 users:
 *                   type: array
 *                   items:
 *                     type: string
 *                     format: string
 *                   description: The unique identifiers for the users associated with the room
 *                 type:
 *                   type: string
 *                   description: The type of the room
 *                   enum: [patient, surgeon, demo]
 *                   example: "patient"
 *                 files:
 *                   type: array
 *                   items:
 *                     type: string
 *                     format: binary
 *                   description: Multiple files to be uploaded
 *       responses:
 *         200:
 *           description: Room created successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Unique identifier for the room
 *                     example: "550e8400-e29b-41d4-a716-446655440000"
 *                   message:
 *                     type: string
 *                     description: Message indicating the success of the operation
 *                     example: "Room created successfully"
 *         400:
 *           description: Invalid request
 *         401:
 *           description: Unauthorized
 *         403:
 *           description: Insufficient permissions
 *         500:
 *           description: Server error
 *     get:
 *       summary: Get all rooms
 *       description: Retrieves a list of all rooms along with their associated patients and models.
 *       tags: [Rooms]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: limit
 *           schema:
 *             type: integer
 *             format: integer
 *             description: The number of patients to return
 *             required: false
 *       responses:
 *         200:
 *           description: List of rooms retrieved successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Unique identifier for the room.
 *                       example: "room123"
 *                     name:
 *                       type: string
 *                       description: Name of the room.
 *                       example: "ICU Room 1"
 *                     patient:
 *                       type: object
 *                       description: Patient details associated with the room.
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "patient123"
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                     models:
 *                       type: array
 *                       description: List of models associated with the room.
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "model123"
 *                           name:
 *                             type: string
 *                             example: "MRI Scan Model"
 *         401:
 *           description: Unauthorized (Invalid or missing token).
 *         403:
 *           description: Forbidden (User does not have permission).
 *         500:
 *           description: Internal Server Error.
 * /room/{id}:
 *   put:
 *     summary: Update a room
 *     description: Updates a room's information including name, patient, users, and models.
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the room to update.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: New name for the room.
 *               patient:
 *                 type: string
 *                 description: ID of the patient to associate with the room (or 'null' to remove).
 *               users:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of user IDs to have access to the room.
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: New model files to add to the room.
 *     responses:
 *       200:
 *         description: Room updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Room updated successfully"
 *                 room:
 *                   $ref: '#/components/schemas/Room'
 *       400:
 *         description: Invalid request.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (insufficient permissions).
 *       404:
 *         description: Room not found.
 *       500:
 *         description: Internal server error.
 *   get:
 *     summary: Get a room by ID
 *     description: Retrieves a single room along with its associated patient and models.
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the room.
 *     responses:
 *       200:
 *         description: Room retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Unique identifier for the room.
 *                   example: "room123"
 *                 name:
 *                   type: string
 *                   description: Name of the room.
 *                   example: "ICU Room 1"
 *                 patient:
 *                   type: object
 *                   description: Patient details associated with the room.
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "patient123"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                 models:
 *                   type: array
 *                   description: List of models associated with the room.
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "model123"
 *                       name:
 *                         type: string
 *                         example: "MRI Scan Model"
 *       400:
 *         description: Invalid request (missing or invalid ID).
 *       401:
 *         description: Unauthorized (Invalid or missing token).
 *       403:
 *         description: Forbidden (User does not have permission).
 *       404:
 *         description: Room not found.
 *       500:
 *         description: Internal Server Error.
 *   delete:
 *     summary: Delete a room by ID
 *     description: Deletes a room from the database. Only accessible by admin users.
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the room to be deleted.
 *     responses:
 *       200:
 *         description: Room deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Room deleted successfully."
 *       400:
 *         description: Invalid request (missing or invalid ID).
 *       401:
 *         description: Unauthorized (Invalid or missing token).
 *       403:
 *         description: Forbidden (User does not have permission).
 *       404:
 *         description: Room not found.
 *       500:
 *         description: Internal Server Error.
 */

// Create a new room
roomRouter.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  authorizationMiddleware("surgeon"),
  async (req, res) => {
    try {
      const user = req?.user as UserInfo;

      // Setup multer memory storage to read file content
      const storage = multer.memoryStorage();
      const upload = multer({ storage }).array("files");

      // Upload file to user directory
      upload(req, res, async (err) => {
        if (err) {
          console.error("Multer upload error:", err);
          res.status(500).send({ message: "File upload error" });
          return;
        }
        // Handle both array and comma-separated string formats
        let users: string[];
        if (Array.isArray(req.body.users)) {
          users = req.body.users.filter(Boolean);
        } else {
          users = ((req.body.users as string) ?? "")
            .split(",")
            .filter(Boolean);
        }

        // Create room
        let room: Room;
        try {
          const body = { ...req.body, createdBy: user.id };
          const parsedBody = roomInsertSchema.parse(body);
          const createdRoom = await db.room.create({
            data: {
              name: parsedBody.name,
              createdBy: parsedBody.createdBy,
              patient: parsedBody.patient,
              type: parsedBody.type as any
            }
          });
          
          // Convert Prisma Date objects to strings for compatibility
          room = {
            ...createdRoom,
            createdAt: createdRoom.createdAt.toISOString(),
            updatedAt: createdRoom.updatedAt.toISOString()
          };
        } catch (error) {
          console.error("Room creation error:", error);
          res.status(400).send({ message: "invalid request: " + (error as Error).message });
          return;
        }

        // Save users to room
        try {
          if (users.length !== 0) {
            console.log("users", users);
            const usersWithRoom = users.map((userId) => ({
              userId,
              roomId: room.id,
            }));

            await db.userRoom.createMany({
              data: usersWithRoom
            });
          }
        } catch (error) {
          console.error("Error saving users to room:", error);
          res.status(500).send({ message: "Error saving users to room: " + (error as Error).message });
          return;
        }

        if (err) {
          res.status(500).send({ message: "Error uploading model" });
          return;
        }

        // Save file content to database if files were uploaded
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
          const files = req.files.map((file) => ({
            roomId: room.id,
            name: file.originalname,
            addedBy: user.id,
            path: file.originalname, // Keep original filename for reference
            content: file.buffer.toString('base64'), // Store file content as base64
            mimeType: file.mimetype, // Store MIME type
          }));

          try {
            await db.model.createMany({
              data: files
            });
          } catch (dbError) {
            console.log(dbError);
            res
              .status(500)
              .send({ message: "Error saving file content to database" });
            return;
          }
        }

        res
          .status(200)
          .send({ message: "Room created successfully", id: room.id });
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Internal server error" });
    }
  }
);

roomRouter.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  authorizationMiddleware("admin"),
  async (req, res, next) => {
    try {
      const user = req?.user as UserInfo;
      const roomId = req.params.id;

      // Check if room exists
      const roomResult = await db.room.findUnique({
        where: { id: roomId }
      });

      if (!roomResult) {
         res.status(404).json({ message: "Room not found" });
         return
      }

      // Setup multer memory storage to read file content
      const storage = multer.memoryStorage();
      const upload = multer({ storage }).array("files");

      // Handle the upload (with or without files)
      upload(req, res, async (err) => {
        if (err) {
          return res.status(500).json({ message: "Error uploading files" });
        }

        try {
          const users = ((req.body.users as string) ?? "").split(",").filter(Boolean);
          
          function getDutchDateTime() {
  const now = new Date();
  return now.toLocaleString('nl-NL', {
    timeZone: 'Europe/Amsterdam',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/(\d{2})-(\d{2})-(\d{4})/, '$3-$2-$1'); // Format naar YYYY-MM-DD
}

// Dan in je update code:
const updateData: Partial<Room> = {
  updatedAt: getDutchDateTime()
};

if (req.body.name) updateData.name = req.body.name;
if (req.body.patient !== undefined) {
  updateData.patient = req.body.patient === 'null' ? null : req.body.patient;
}

          // Update room in database
          if (Object.keys(updateData).length > 0) {
            await db.room.update({
              where: { id: roomId },
              data: {
                name: updateData.name,
                patient: updateData.patient
              }
            });
          }

          // Update users
          if (req.body.users !== undefined) {
            // Remove existing user-room associations
            await db.userRoom.deleteMany({
              where: { roomId }
            });
            
            // Add new associations
            if (users.length > 0) {
              const usersWithRoom = users.map((userId) => ({
                userId,
                roomId,
              }));
              await db.userRoom.createMany({
                data: usersWithRoom
              });
            }
          }

          // Handle model removal if requested
          if (req.body.modelsToRemove) {
            try {
              const modelsToRemove = typeof req.body.modelsToRemove === 'string' 
                ? JSON.parse(req.body.modelsToRemove) 
                : req.body.modelsToRemove;
              
              if (Array.isArray(modelsToRemove) && modelsToRemove.length > 0) {
                await db.model.deleteMany({
                  where: {
                    id: {
                      in: modelsToRemove
                    }
                  }
                });
              }
            } catch (error) {
              console.error("Error removing models:", error, req.body.modelsToRemove);
            }
          }

          // Add new files if any were uploaded
          if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            const files = req.files.map(file => ({
              roomId,
              name: file.originalname,
              addedBy: user.id,
              path: file.originalname, // Keep original filename for reference
              content: file.buffer.toString('base64'), // Store file content as base64
              mimeType: file.mimetype, // Store MIME type
            }));
            await db.model.createMany({
              data: files
            });
          }

          // Get updated room with populated data
          const updatedRoom = await db.room.findUnique({
            where: { id: roomId }
          });

          if (!updatedRoom) {
            return res.status(404).json({ message: "Room not found after update" });
          }

          const populatedRoom = await getRoom(updatedRoom);

          res.status(200).json({
            message: "Room updated successfully",
            room: populatedRoom,
          });

        } catch (error) {
          console.error("Error updating room:", error);
          res.status(500).json({ message: "Error updating room" });
        }
      });
    } catch (error) {
      console.error("Error in room update:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
); 
 
// Get room with models and patient
const getRoom = async (room: any) => {
  const models = await db.model.findMany({
    where: { roomId: room.id }
  });
  
  let patient: Patient | undefined;
  if (room.patient) {
    const patientData = await db.patient.findUnique({
      where: { id: room.patient }
    });
    if (patientData) {
      patient = {
        ...patientData,
        createdAt: patientData.createdAt ? patientData.createdAt.toISOString() : null,
        updatedAt: patientData.updatedAt ? patientData.updatedAt.toISOString() : null
      };
    }
  }  

  const populatedRoom: PopulatedRoom = {
    ...room,
    createdAt: room.createdAt ? room.createdAt.toISOString() : null,
    updatedAt: room.updatedAt ? room.updatedAt.toISOString() : null,
    models: models,
    patient: patient,
  };

  return populatedRoom;
};

// Get rooms list
roomRouter.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  authorizationMiddleware("surgeon"),
  async (req, res) => {
    const user = req?.user as UserInfo;
    const { limit } = req.query;

    try {
      // Check if user is admin to get all rooms
      if (user.role === Role.Admin) {
        const roomResponse: PopulatedRoom[] = [];
        const rooms = await db.room.findMany({
          take: parseInt((limit as string) ?? "100")
        });

        for (const room of rooms) {
          roomResponse.push(await getRoom(room));
        }

        res.status(200).send(roomResponse);
        return;
      }

      // Get rooms for surgeon with all the rooms they are associated with
      const roomResponse: PopulatedRoom[] = [];
      const userRooms = await db.userRoom.findMany({
        where: { userId: user.id },
        take: parseInt((limit as string) ?? "100")
      });
      const roomIds = userRooms.map((userRoom: any) => userRoom.roomId);
      const rooms = await db.room.findMany({
        where: {
          id: {
            in: roomIds
          }
        }
      });

      for (const room of rooms) {
        roomResponse.push(await getRoom(room));
      }

      res.status(200).send(roomResponse);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Internal server error" });
    }
  }
);

// Get room by ID
roomRouter.get(
  "/:id",
  passport.authenticate(["jwt", "bearer"], { session: false }),
  authorizationMiddleware("surgeon"),
  async (req, res) => {
    const user = req?.user as UserInfo;
    const roomId = req.params.id;
    try {
      // Check if user is admin to get all rooms
      if (user.role === Role.Admin || user.role === Role.System) {
        const room = await db.room.findUnique({
          where: { id: roomId }
        });

        if (!room) {
          res.status(404).send({ message: "Room not found" });
          return;
        }

        const populatedRoom = await getRoom(room);
        res.status(200).send(populatedRoom);
        return;
      }

      // Get rooms for admin with all the rooms they are associated with
      const userRooms = await db.userRoom.findMany({
        where: { userId: user.id }
      });
      const roomIds = userRooms.map((userRoom: any) => userRoom.roomId);
      if (!roomIds.includes(roomId)) {
        res.status(403).send({ message: "Forbidden" });
        return;
      }

      const room = await db.room.findUnique({
        where: { id: roomId }
      });

      if (!room) {
        res.status(404).send({ message: "Room not found" });
        return;
      }

      const populatedRoom = await getRoom(room);
      res.status(200).send(populatedRoom);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Internal server error" });
    }
  }
);

// Delete room by ID
roomRouter.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  authorizationMiddleware("admin"),
  async (req, res) => {
    const roomId = req.params.id;
    try {
      const room = await db.room.findUnique({
        where: { id: roomId }
      });

      if (!room) {
        res.status(404).send({ message: "Room not found" });
        return;
      }

      await db.model.deleteMany({
        where: { roomId }
      });
      await db.userRoom.deleteMany({
        where: { roomId }
      });
      await db.room.delete({
        where: { id: roomId }
      });

      res.status(200).send({ message: "Room deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Internal server error" });
    }
  }
);

export default roomRouter;
