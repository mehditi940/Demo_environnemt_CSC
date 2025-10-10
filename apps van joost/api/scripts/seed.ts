import "dotenv/config";
import { PrismaClient, Role, RoomType } from "@prisma/client";
import { hashPassword } from "../utils/passwordHash.js";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  try {
    // Clear existing data (for development only)
    console.log("Clearing existing data...");
    await prisma.userRoom.deleteMany();
    await prisma.model.deleteMany();
    await prisma.connection.deleteMany();
    await prisma.room.deleteMany();
    await prisma.patient.deleteMany();
    await prisma.user.deleteMany();

    // Create users
    console.log("Creating users...");
    const adminPassword = await hashPassword("admin123");
    const adminUser = await prisma.user.create({
      data: {
        email: "admin@arviewer.com",
        password: adminPassword.hash,
        salt: adminPassword.salt,
        firstName: "Admin",
        lastName: "User",
        role: Role.admin,
      },
    });

    const surgeonPassword = await hashPassword("surgeon123");
    const surgeonUser = await prisma.user.create({
      data: {
        email: "surgeon@arviewer.com",
        password: surgeonPassword.hash,
        salt: surgeonPassword.salt,
        firstName: "Dr. Sarah",
        lastName: "Johnson",
        role: Role.surgeon,
      },
    });

    const userPassword = await hashPassword("user123");
    const regularUser = await prisma.user.create({
      data: {
        email: "user@arviewer.com",
        password: userPassword.hash,
        salt: userPassword.salt,
        firstName: "John",
        lastName: "Doe",
        role: Role.user,
      },
    });

    const systemPassword = await hashPassword("system123");
    const systemUser = await prisma.user.create({
      data: {
        email: "system@arviewer.com",
        password: systemPassword.hash,
        salt: systemPassword.salt,
        firstName: "System",
        lastName: "Bot",
        role: Role.system,
      },
    });

    // Create patients
    console.log("Creating patients...");
    const patient1 = await prisma.patient.create({
      data: {
        nummer: "P001",
        firstName: "Alice",
        lastName: "Smith",
      },
    });

    const patient2 = await prisma.patient.create({
      data: {
        nummer: "P002",
        firstName: "Bob",
        lastName: "Wilson",
      },
    });

    const patient3 = await prisma.patient.create({
      data: {
        nummer: "P003",
        firstName: "Carol",
        lastName: "Brown",
      },
    });

    // Create rooms
    console.log("Creating rooms...");
    const patientRoom1 = await prisma.room.create({
      data: {
        name: "Patient Room - Alice Smith",
        patient: patient1.id,
        type: RoomType.patient,
        createdBy: surgeonUser.id,
      },
    });

    const patientRoom2 = await prisma.room.create({
      data: {
        name: "Patient Room - Bob Wilson",
        patient: patient2.id,
        type: RoomType.patient,
        createdBy: surgeonUser.id,
      },
    });

    const surgeonRoom = await prisma.room.create({
      data: {
        name: "Surgical Planning Room",
        type: RoomType.surgeon,
        createdBy: surgeonUser.id,
      },
    });

    const demoRoom = await prisma.room.create({
      data: {
        name: "Demo Room - Training",
        type: RoomType.demo,
        createdBy: adminUser.id,
      },
    });

    // Create user-room associations
    console.log("Creating user-room associations...");
    await prisma.userRoom.createMany({
      data: [
        { userId: surgeonUser.id, roomId: patientRoom1.id },
        { userId: surgeonUser.id, roomId: patientRoom2.id },
        { userId: surgeonUser.id, roomId: surgeonRoom.id },
        { userId: regularUser.id, roomId: patientRoom1.id },
        { userId: regularUser.id, roomId: demoRoom.id },
        { userId: adminUser.id, roomId: surgeonRoom.id },
        { userId: adminUser.id, roomId: demoRoom.id },
      ],
    });

    // Create connections (active sessions)
    console.log("Creating connections...");
    const connection1 = await prisma.connection.create({
      data: {
        pinCode: "123456",
        startedBy: surgeonUser.id,
        roomId: patientRoom1.id,
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      },
    });

    const connection2 = await prisma.connection.create({
      data: {
        pinCode: "789012",
        startedBy: adminUser.id,
        roomId: demoRoom.id,
        validUntil: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      },
    });

    // Create sample models (3D files)
    console.log("Creating sample models...");
    const sampleModel1 = await prisma.model.create({
      data: {
        name: "Heart Model",
        path: "/models/heart.3mf",
        content: null, // In real scenario, this would contain base64 encoded file
        mimeType: "application/3mf",
        addedBy: surgeonUser.id,
        roomId: patientRoom1.id,
      },
    });

    const sampleModel2 = await prisma.model.create({
      data: {
        name: "Brain Model",
        path: "/models/brain.3mf",
        content: null,
        mimeType: "application/3mf",
        addedBy: surgeonUser.id,
        roomId: surgeonRoom.id,
      },
    });

    const sampleModel3 = await prisma.model.create({
      data: {
        name: "Demo Model",
        path: "/models/demo.3mf",
        content: null,
        mimeType: "application/3mf",
        addedBy: adminUser.id,
        roomId: demoRoom.id,
      },
    });

    console.log("Database seeding completed successfully!");
    console.log("\nSummary:");
    console.log(`- Users created: 4 (admin, surgeon, user, system)`);
    console.log(`- Patients created: 3`);
    console.log(`- Rooms created: 4 (2 patient, 1 surgeon, 1 demo)`);
    console.log(`- User-room associations: 7`);
    console.log(`- Active connections: 2`);
    console.log(`- Sample models: 3`);

    console.log("\nTest Credentials:");
    console.log("Admin: admin@arviewer.com / admin123");
    console.log("Surgeon: surgeon@arviewer.com / surgeon123");
    console.log("User: user@arviewer.com / user123");
    console.log("System: system@arviewer.com / system123");

    console.log("\nActive Connection PINs:");
    console.log(`Room "${patientRoom1.name}": ${connection1.pinCode}`);
    console.log(`Room "${demoRoom.name}": ${connection2.pinCode}`);

  } catch (error) {
    console.error("Error during seeding:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
