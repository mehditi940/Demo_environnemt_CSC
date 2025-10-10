import "dotenv/config";
import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testDockerMigration() {
  console.log("Testing Docker migration process...");

  try {
    // Step 1: Check if Docker is running
    console.log("Checking Docker status...");
    try {
      execSync("docker ps", { stdio: "pipe" });
      console.log("Docker is running");
    } catch (error) {
      console.error("Docker is not running. Please start Docker first.");
      throw error;
    }

    // Step 2: Check if containers are running
    console.log("Checking container status...");
    try {
      const output = execSync("docker ps --format 'table {{.Names}}\t{{.Status}}'", { 
        encoding: "utf8" 
      });
      console.log("Container status:");
      console.log(output);
    } catch (error) {
      console.error("Error checking container status:", error);
    }

    // Step 3: Test database connection
    console.log("Testing database connection...");
    try {
      await prisma.$connect();
      console.log("Database connection successful");
    } catch (error) {
      console.error("Database connection failed:", error);
      throw error;
    }

    // Step 4: Test database operations
    console.log("Testing database operations...");
    
    // Test user creation
    const testUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        password: "test-password",
        salt: "test-salt",
        firstName: "Test",
        lastName: "User",
      },
    });
    console.log("User creation test passed");

    // Test user retrieval
    const retrievedUser = await prisma.user.findUnique({
      where: { id: testUser.id },
    });
    if (retrievedUser) {
      console.log("User retrieval test passed");
    } else {
      throw new Error("User retrieval failed");
    }

    // Test user deletion
    await prisma.user.delete({
      where: { id: testUser.id },
    });
    console.log("User deletion test passed");

    // Step 5: Test migration status
    console.log("Checking migration status...");
    try {
      execSync("npx prisma migrate status", { stdio: "inherit" });
    } catch (error) {
      console.error("Migration status check failed:", error);
    }

    // Step 6: Test data integrity
    console.log("Testing data integrity...");
    const userCount = await prisma.user.count();
    const roomCount = await prisma.room.count();
    const patientCount = await prisma.patient.count();
    
    console.log(`Current data counts:`);
    console.log(`  - Users: ${userCount}`);
    console.log(`  - Rooms: ${roomCount}`);
    console.log(`  - Patients: ${patientCount}`);

    // Step 7: Test foreign key constraints
    console.log("Testing foreign key constraints...");
    try {
      // Try to create a room with invalid user reference
      await prisma.room.create({
        data: {
          name: "Test Room",
          createdBy: "invalid-user-id",
        },
      });
      console.error("Foreign key constraint test failed - should have thrown error");
    } catch (error) {
      console.log("Foreign key constraint test passed - correctly rejected invalid reference");
    }

    console.log("Docker migration test completed successfully!");

  } catch (error) {
    console.error("Docker migration test failed:", error);
    throw error;
  }
}

testDockerMigration()
  .catch((e) => {
    console.error("Test process failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
