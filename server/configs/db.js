import { neon } from "@neondatabase/serverless";

let sql;

if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== "") {
  sql = neon(process.env.DATABASE_URL);
} else {
  console.warn("⚠️ DATABASE_URL is not set in server/.env. DB operations will be skipped or return empty results.");
  sql = async () => [];
}

export default sql;