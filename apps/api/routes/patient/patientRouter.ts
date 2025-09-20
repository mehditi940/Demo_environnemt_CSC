import "dotenv/config";
import { Router } from "express";
import passport from "passport";
import db from "../../schemas/db";
import { authorizationMiddleware } from "../../services/authorizationMiddleware";
import { Patient, patientInsertSchema, patientSchema } from "../../schemas/patient";
import { count, eq } from "drizzle-orm";

const patientRouter = Router();

/**
 * @swagger
 * tags:
 *   - name: Patient
 *     description: Endpoints for patient management
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Patient:
 *       type: object
 *       required:
 *         - id
 *         - nummer
 *         - firstName
 *         - lastName
 *       properties:
 *         id:
 *           type: string
 *           format: string
 *           description: Unique identifier for the patient
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         nummer:
 *           type: string
 *           description: The nummer of the patient
 *           example: 123456789
 *         firstName:
 *           type: string
 *           description: The first name of the patient
 *           example: John
 *         lastName:
 *           type: string
 *           description: The last name of the patient
 *           example: Doe
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
 *   /patient:
 *     post:
 *       summary: Create a new patient
 *       description: Allows super-admin to create a new patient in the database
 *       tags: [Patient]
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - nummer
 *                 - firstName
 *                 - lastName
 *               properties:
 *                 nummer:
 *                   type: string
 *                   format: string
 *                   example: "123456789"
 *                 firstName:
 *                   type: string
 *                   format: string
 *                   example: "John"
 *                 lastName:
 *                   type: string
 *                   format: string
 *                   example: "Doe"
 *       responses:
 *         200:
 *           description: Patient created successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Unique identifier for the patient
 *                     example: "550e8400-e29b-41d4-a716-446655440000"
 *                   message:
 *                     type: string
 *                     description: Message indicating the success of the operation
 *                     example: "Patient created successfully"
 *         400:
 *           description: Invalid request
 *         401:
 *           description: Unauthorized
 *         403:
 *           description: Insufficient permissions
 *         500:
 *           description: Server error
 *     get:
 *       summary: Get patients list
 *       description: Allows admin to get a list of patients with limit
 *       tags: [Patient]
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
 *           description: Successfully retrieved patients list
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Patient'
 *         401:
 *           description: Unauthorized
 *         403:
 *           description: Insufficient permissions
 *         500:
 *           description: Server error
 *
 *   /patient/{id}:
 *     put:
 *       summary: Update a patient
 *       description: Allows super-admin to update a patient's information
 *       tags: [Patient]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *           description: The ID of the patient to update
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nummer:
 *                   type: string
 *                   description: The new patient number
 *                   example: "987654321"
 *                 firstName:
 *                   type: string
 *                   description: The new first name
 *                   example: "Jane"
 *                 lastName:
 *                   type: string
 *                   description: The new last name
 *                   example: "Smith"
 *       responses:
 *         200:
 *           description: Patient updated successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "Patient updated successfully"
 *                   patient:
 *                     $ref: '#/components/schemas/Patient'
 *         400:
 *           description: Invalid request
 *         401:
 *           description: Unauthorized
 *         403:
 *           description: Insufficient permissions
 *         404:
 *           description: Patient not found
 *         500:
 *           description: Server error
 *     delete:
 *       summary: Delete a patient
 *       description: Allows a super-admin to delete an patient.
 *       tags: [Patient]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *             format: string
 *           description: The ID of the patient to delete
 *       responses:
 *         200:
 *           description: Patient deleted successfully
 *         400:
 *           description: Invalid input
 *         401:
 *           description: Unauthorized
 *         403:
 *           description: Insufficient permissions
 *         500:
 *           description: Server error
 *     get:
 *       summary: Get a patient
 *       description: Allows a admin to get an patient.
 *       tags: [Patient]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *             format: string
 *           description: The ID of the patient to delete
 *       responses:
 *         200:
 *           description: Successfully retrieved patients list
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Patient'
 *         400:
 *           description: Invalid input
 *         404:
 *           description: Patient not found
 *         401:
 *           description: Unauthorized
 *         403:
 *           description: Insufficient permissions
 *         500:
 *           description: Server error
 */

// Create a new patient
patientRouter.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  authorizationMiddleware("super-admin"),
  async (req, res) => {
    try {
      try {
        const parsedBody = patientInsertSchema.parse(req.body);

        const existingPatient = await db
          .select({ count: count() })
          .from(patientSchema)
          .where(eq(patientSchema.nummer, parsedBody.nummer));

        if (existingPatient[0].count > 0) {
          res.status(400).send({ message: "patient already exists" });
          return;
        }

        const patient = await db
          .insert(patientSchema)
          .values(parsedBody)
          .returning({ insertedId: patientSchema.id });

        res.status(200).send({
          id: patient[0].insertedId,
          message: "Patient created successfully",
        });
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

// Update a patient
patientRouter.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  authorizationMiddleware("super-admin"),
  async (req, res) => {
    try {
      const patientId = req.params.id;
      
      // Check if patient exists
      const patientResult = await db
        .select()
        .from(patientSchema)
        .where(eq(patientSchema.id, patientId));

      if (patientResult.length === 0) {
        res.status(404).json({ message: "Patient not found" });
        return 
      }

      // Get current time in Dutch format for updatedAt
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
        }).replace(/(\d{2})-(\d{2})-(\d{4})/, '$3-$2-$1'); // Format to YYYY-MM-DD
      }

      // Prepare update data
      const updateData: Partial<Patient> = {
        updatedAt: getDutchDateTime()
      };

      // Add fields to update if they exist in request body
      if (req.body.nummer) {
        // Check if the new nummer is already taken by another patient
        const existingPatient = await db
          .select()
          .from(patientSchema)
          .where(eq(patientSchema.nummer, req.body.nummer));

        if (existingPatient.length > 0 && existingPatient[0].id !== patientId) {
          res.status(400).json({ message: "Patient number already in use" });
          return 
        }
        updateData.nummer = req.body.nummer;
      }
      if (req.body.firstName) updateData.firstName = req.body.firstName;
      if (req.body.lastName) updateData.lastName = req.body.lastName;

      // Update patient in database
      await db
        .update(patientSchema)
        .set(updateData)
        .where(eq(patientSchema.id, patientId));

      // Get updated patient
      const updatedPatient = await db
        .select()
        .from(patientSchema)
        .where(eq(patientSchema.id, patientId));

      if (updatedPatient.length === 0) {
        res.status(404).json({ message: "Patient not found after update" });
        return 
      }

      res.status(200).json({
        message: "Patient updated successfully",
        patient: updatedPatient[0],
      });
    } catch (error) {
      console.error("Error updating patient:", error);
      res.status(500).json({ message: "Error updating patient" });
    }
  }
);

// Delete a patient
patientRouter.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  authorizationMiddleware("super-admin"),
  async (req, res) => {
    try {
      try {
        const { id } = req.params;

        if (!id) {
          res.status(400).send({ message: "invalid input" });
          return;
        }

        const result = await db
          .delete(patientSchema)
          .where(eq(patientSchema.id, id));
        if (result.rowsAffected > 0) {
          res.status(200).send({ message: "Patient deleted successfully" });
          return;
        }

        res.status(400).send({ message: "invalid input" });
      } catch (error) {
        res.status(400).send({ message: "invalid input" });
        return;
      }
    } catch (error) {
      res.status(500).send({ message: "failed to delete patient" });
    }
  }
);

// Get patients list
patientRouter.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  authorizationMiddleware("admin"),
  async (req, res) => {
    try {
      try {
        const { limit } = req.query;
        const patients = await db
          .select()
          .from(patientSchema)
          .limit(parseInt((limit as string) ?? "100"));

        res.status(200).send(patients);
      } catch (error) {
        res.status(400).send({ message: "invalid input" });
        return;
      }
    } catch (error) {
      res.status(500).send({ message: "failed to get patients" });
    }
  }
);

// Get a patient
patientRouter.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  authorizationMiddleware("admin"),
  async (req, res) => {
    try {
      try {
        const { id } = req.params;

        if (!id) {
          res.status(400).send({ message: "invalid input" });
          return;
        }

        const patient = await db
          .select()
          .from(patientSchema)
          .where(eq(patientSchema.id, id));

        if (patient.length === 0) {
          res.status(404).send({ message: "patient not found" });
          return;
        }

        res.status(200).send(patient[0]);
      } catch (error) {
        res.status(400).send({ message: "invalid input" });
        return;
      }
    } catch (error) {
      res.status(500).send({ message: "failed to get patient" });
    }
  }
);

export default patientRouter;