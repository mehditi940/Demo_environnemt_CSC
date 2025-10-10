/**
 * Data Migration Script
 * This script helps migrate data from SQLite (Drizzle) to PostgreSQL (Prisma)
 * 
 * Usage:
 * 1. Ensure your SQLite database is accessible
 * 2. Ensure PostgreSQL is running and accessible
 * 3. Run: npx tsx scripts/migrate-data.ts
 */

import { PrismaClient } from '@prisma/client';
import sqlite3 from 'sqlite3';
import { promisify } from 'util';

const prisma = new PrismaClient();

// SQLite connection (adjust path as needed)
const sqliteDb = new sqlite3.Database('./database.sqlite');
const sqliteGet = promisify(sqliteDb.get.bind(sqliteDb));
const sqliteAll = promisify(sqliteDb.all.bind(sqliteDb));

async function migrateData() {
  try {
    console.log(' Starting data migration from SQLite to PostgreSQL...');

    // Migrate Users
    console.log(' Migrating users...');
    const users = await sqliteAll('SELECT * FROM users') as any[];
    for (const user of users) {
      await prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          password: user.password,
          salt: user.salt,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role as any,
          deleted: user.deleted,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
        },
      });
    }
    console.log(`Migrated ${users.length} users`);

    // Migrate Patients
    console.log('Migrating patients...');
    const patients = await sqliteAll('SELECT * FROM patients') as any[];
    for (const patient of patients) {
      await prisma.patient.create({
        data: {
          id: patient.id,
          nummer: patient.nummer,
          firstName: patient.firstName,
          lastName: patient.lastName,
          createdAt: new Date(patient.createdAt),
          updatedAt: new Date(patient.updatedAt),
        },
      });
    }
    console.log(`Migrated ${patients.length} patients`);

    // Migrate Rooms
    console.log('Migrating rooms...');
    const rooms = await sqliteAll('SELECT * FROM rooms') as any[];
    for (const room of rooms) {
      await prisma.room.create({
        data: {
          id: room.id,
          name: room.name,
          patient: room.patient,
          type: room.type as any,
          createdBy: room.createdBy,
          createdAt: new Date(room.createdAt),
          updatedAt: new Date(room.updatedAt),
        },
      });
    }
    console.log(`Migrated ${rooms.length} rooms`);

    // Migrate Models
    console.log('Migrating models...');
    const models = await sqliteAll('SELECT * FROM models') as any[];
    for (const model of models) {
      await prisma.model.create({
        data: {
          id: model.id,
          name: model.name,
          path: model.path,
          content: model.content,
          mimeType: model.mimeType,
          addedBy: model.addedBy,
          roomId: model.roomId,
          createdAt: new Date(model.createdAt),
        },
      });
    }
    console.log(`Migrated ${models.length} models`);

    // Migrate Connections
    console.log('Migrating connections...');
    const connections = await sqliteAll('SELECT * FROM connection') as any[];
    for (const connection of connections) {
      await prisma.connection.create({
        data: {
          id: connection.id,
          pinCode: connection.pinCode,
          startedBy: connection.startedBy,
          roomId: connection.roomId,
          createdAt: new Date(connection.createdAt),
          validUntil: new Date(connection.validUntil),
        },
      });
    }
    console.log(`Migrated ${connections.length} connections`);

    // Migrate User-Room relationships
    console.log('Migrating user-room relationships...');
    const userRooms = await sqliteAll('SELECT * FROM users_to_groups') as any[];
    for (const userRoom of userRooms) {
      await prisma.userRoom.create({
        data: {
          userId: userRoom.user_id,
          roomId: userRoom.rooms_id,
        },
      });
    }
    console.log(`Migrated ${userRooms.length} user-room relationships`);

    console.log('Data migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    sqliteDb.close();
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateData()
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

export { migrateData };
