import knex from "knex";

const client = process.env.DB_CLIENT ?? "pg";
const useSsl =
  process.env.DB_USE_SSL === "true" ? { rejectUnauthorized: false } : false;

const connection = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: useSsl,
    }
  : {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE_NAME,
      ssl: useSsl,
    };

const db = knex({
  client: client,
  connection,
});

export default db;
