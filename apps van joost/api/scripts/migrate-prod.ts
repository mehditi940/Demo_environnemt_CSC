import "dotenv/config";
import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function migrateProd() {
  console.log("Starting production migration process...");

  try {
    // Step 1: Generate Prisma client
    console.log("Generating Prisma client...");
    execSync("npx prisma generate", { stdio: "inherit" });

    // Step 2: Deploy migrations (production-safe)
    console.log("Deploying database migrations...");
    execSync("npx prisma migrate deploy", { stdio: "inherit" });

    // Step 3: Verify database connection
    console.log("Verifying database connection...");
    await prisma.$connect();
    console.log("Database connection successful");

    // Step 4: Check if we need to seed (production-safe)
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      console.log("No users found, running production seed...");
      execSync("npx tsx scripts/seed-production.ts", { stdio: "inherit" });
    } else {
      console.log(`Found ${userCount} users, skipping seed`);
    }

    console.log("Production migration completed successfully!");

  } catch (error) {
    console.error("Production migration failed:", error);
    throw error;
  }
}

migrateProd()
  .catch((e) => {
    console.error("Migration process failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
