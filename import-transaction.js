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

  fs.createReadStream(`${process.cwd()}/Transaction.csv`)
    .pipe(csv())
    .on("data", (data) => rows.push(data))
    .on("end", async () => {
      for (const r of rows) {
        await pool.query(
          `
          INSERT INTO "Transaction"
          (id, "userId", "subCategoryId", amount, description, "createdAt", "updatedAt", type, date)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
          `,
          [
            r.id,
            r.userId,
            r.subCategoryId,
            r.amount,
            r.description,
            r.createdAt,
            r.updatedAt,
            r.type,
            r.date,
          ]
        );
      }
      console.log("Transaction imported");
      await pool.end();
    });
}

run();