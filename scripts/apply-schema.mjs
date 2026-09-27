// Applies db/schema.sql against POSTGRES_URL / DATABASE_URL.
// Usage: npm run db:push   (reads env vars from .env.local automatically)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { Client } from "pg";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error(
    "No POSTGRES_URL or DATABASE_URL found. Add one to .env.local first (see README.md)."
  );
  process.exit(1);
}

const schema = readFileSync(
  path.join(__dirname, "..", "db", "schema.sql"),
  "utf-8"
);

const client = new Client({
  connectionString,
  ssl: connectionString.includes("localhost")
    ? false
    : { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(schema);
  console.log("✅ Schema applied successfully.");
} catch (err) {
  console.error("❌ Failed to apply schema:", err.message);
  process.exit(1);
} finally {
  await client.end();
}
