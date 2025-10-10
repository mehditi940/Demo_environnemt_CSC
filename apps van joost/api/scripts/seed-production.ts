import "dotenv/config";
import { PrismaClient, Role, RoomType } from "@prisma/client";
import { hashPassword } from "../utils/passwordHash.js";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting production database seeding...");

  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@arviewer.com" },
    });

    if (existingAdmin) {
      console.log("Admin user already exists. Skipping user creation.");
      return;
    }

    // Create only essential users for production
    console.log("Creating essential users...");
    const adminPassword = await hashPassword("admin123"); // Change this in production!
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

    const systemPassword = await hashPassword("system123"); // Change this in production!
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

    // Create a demo room for testing
    console.log("Creating demo room...");
    const demoRoom = await prisma.room.create({
      data: {
        name: "Demo Room",
        type: RoomType.demo,
        createdBy: adminUser.id,
      },
    });

    // Associate admin with demo room
    await prisma.userRoom.create({
      data: {
        userId: adminUser.id,
        roomId: demoRoom.id,
      },
    });

    console.log("Production seeding completed successfully!");
    console.log("\nSummary:");
    console.log(`- Users created: 2 (admin, system)`);
    console.log(`- Demo room created: 1`);
    console.log(`- User-room associations: 1`);

    console.log("\nAdmin Credentials:");
    console.log("Email: admin@arviewer.com");
    console.log("Password: admin123");
    console.log("IMPORTANT: Change these credentials in production!");

  } catch (error) {
    console.error("Error during production seeding:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("Production seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
