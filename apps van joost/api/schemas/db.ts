import "dotenv/config";
import { PrismaClient } from "@prisma/client";

// Create Prisma client with proper configuration
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Export as default for backward compatibility
export default prisma;
export const db = prisma;
