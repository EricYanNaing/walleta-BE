import fs from "fs";
import csv from "csv-parser";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

function toNull(v) {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s === "" || s.toLowerCase() === "null" ? null : s;
}

function toNumberOrNull(v) {
  const t = toNull(v);
  if (t === null) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

async function main() {
  const rows = [];

  await new Promise((resolve, reject) => {
    fs.createReadStream(`${process.cwd()}/User.csv`)
      .pipe(csv())
      .on("data", (data) => rows.push(data))
      .on("end", resolve)
      .on("error", reject);
  });

  await pool.query("BEGIN");
  try {
    for (const r of rows) {
      const id = toNull(r.id);
      if (!id) continue;

      await pool.query(
        `
        INSERT INTO "User"
          (id, username, email, "passwordHash", "totalAmount", "limitAmount", "createdAt", "updatedAt")
        VALUES
          ($1,$2,$3,$4,$5,$6,$7,$8)
        ON CONFLICT (id) DO NOTHING;
        `,
        [
          id,
          toNull(r.username),
          toNull(r.email),
          toNull(r.passwordHash),
          toNumberOrNull(r.totalAmount),
          toNumberOrNull(r.limitAmount),
          toNull(r.createdAt),
          toNull(r.updatedAt),
        ]
      );
    }

    await pool.query("COMMIT");
    console.log(`✅ Imported ${rows.length} users`);
  } catch (e) {
    await pool.query("ROLLBACK");
    console.error("❌ Import failed:", e);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();