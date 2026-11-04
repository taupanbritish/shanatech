import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const connectionString =
  process.env.DATABASE_URL ?? "postgres://shanatech:shanatech@127.0.0.1:5433/shanatech";

const client = new pg.Client({ connectionString });
await client.connect();

try {
  const schema = await readFile(path.join(__dirname, "..", "db", "schema.sql"), "utf8");
  await client.query(schema);
  console.log("✓ Skema database siap.");
} finally {
  await client.end();
}
