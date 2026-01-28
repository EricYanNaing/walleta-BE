import pg from "pg";
const { Client } = pg;

const url = process.env.DATABASE_URL;
if (!url) throw new Error("Missing DATABASE_URL");

const client = new Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

await client.connect();

const { rows } = await client.query(`
  SELECT table_schema, table_name
  FROM information_schema.tables
  WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
  ORDER BY table_schema, table_name;
`);

console.log(rows);
await client.end();