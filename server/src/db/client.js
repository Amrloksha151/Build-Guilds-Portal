import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;
const dbClient = databaseUrl ? neon(databaseUrl) : null;

export function getDb() {
  if (!dbClient) {
    throw new Error("DATABASE_URL is required");
  }

  return dbClient;
}