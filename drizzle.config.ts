import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

// Only load dotenv locally
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set before running Drizzle migrations.");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
