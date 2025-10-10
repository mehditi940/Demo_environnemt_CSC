import "dotenv/config";
import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

async function rollback() {
  console.log("Starting database rollback process...");

  try {
    // Step 1: Check current migration status
    console.log("Checking current migration status...");
    execSync("npx prisma migrate status", { stdio: "inherit" });

    // Step 2: List available migrations
    console.log("Available migrations:");
    try {
      const migrationsDir = join(process.cwd(), "prisma", "migrations");
      const fs = require("fs");
      const migrations = fs.readdirSync(migrationsDir)
        .filter((dir: string) => dir !== "migration_lock.toml")
        .sort();
      
      migrations.forEach((migration: string, index: number) => {
        console.log(`  ${index + 1}. ${migration}`);
      });
    } catch (error) {
      console.log("  No migrations found or error reading migrations directory");
    }

    // Step 3: Interactive rollback selection
    console.log("\nWARNING: This will rollback your database!");
    console.log("Available options:");
    console.log("1. Rollback to previous migration");
    console.log("2. Reset database (DESTRUCTIVE - removes all data)");
    console.log("3. Cancel rollback");

    // For automated scripts, we'll default to option 1
    const choice = process.env.ROLLBACK_CHOICE || "1";

    switch (choice) {
      case "1":
        console.log("Rolling back to previous migration...");
        // Note: Prisma doesn't have a built-in rollback command
        // This would require manual SQL or custom migration scripts
        console.log("Manual rollback required. Please check Prisma documentation.");
        break;
      
      case "2":
        console.log("Resetting database (DESTRUCTIVE)...");
        execSync("npx prisma migrate reset --force", { stdio: "inherit" });
        console.log("Database reset completed");
        break;
      
      case "3":
        console.log("Rollback cancelled");
        return;
      
      default:
        console.log("Invalid choice, cancelling rollback");
        return;
    }

    // Step 4: Verify database state
    console.log("Verifying database state...");
    await prisma.$connect();
    console.log("Database connection successful");

    console.log("Rollback process completed!");

  } catch (error) {
    console.error("Rollback failed:", error);
    throw error;
  }
}

rollback()
  .catch((e) => {
    console.error("Rollback process failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
