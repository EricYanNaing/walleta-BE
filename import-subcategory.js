import fs from "fs";
import csv from "csv-parser";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const rows = [];

  fs.createReadStream(`${process.cwd()}/SubCategory.csv`)
    .pipe(csv())
    .on("data", (data) => rows.push(data))
    .on("end", async () => {
      for (const r of rows) {
        await pool.query(
          `
          INSERT INTO "SubCategory"
          (id, name, type, "userId", "createdAt", "updatedAt")
          VALUES ($1,$2,$3,$4,$5,$6)
          `,
          [
            r.id,
            r.name,
            r.type,
            r.userId,
            r.createdAt,
            r.updatedAt,
          ]
        );
      }
      console.log("SubCategory imported");
      await pool.end();
    });
}

run();