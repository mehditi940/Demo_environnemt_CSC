import "dotenv/config";
import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function migrateDev() {
  console.log("Starting development migration process...");

  try {
    // Step 1: Generate Prisma client
    console.log("Generating Prisma client...");
    execSync("npx prisma generate", { stdio: "inherit" });

    // Step 2: Run migrations
    console.log("Running database migrations...");
    execSync("npx prisma migrate dev", { stdio: "inherit" });

    // Step 3: Verify database connection
    console.log("Verifying database connection...");
    await prisma.$connect();
    console.log("Database connection successful");

    // Step 4: Check if we need to seed
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      console.log("No users found, running development seed...");
      execSync("npx tsx scripts/seed.ts", { stdio: "inherit" });
    } else {
      console.log(`Found ${userCount} users, skipping seed`);
    }

    console.log("Development migration completed successfully!");

  } catch (error) {
    console.error("Development migration failed:", error);
    throw error;
  }
}

migrateDev()
  .catch((e) => {
    console.error("Migration process failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
