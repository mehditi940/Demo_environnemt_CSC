import "dotenv/config";

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./schemas",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DB_FILE_NAME || "file:./dev.sqlite",
  },
});
