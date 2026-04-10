import { Pool } from "pg";

async function test() {
  const pool = new Pool({
    connectionString: "postgres://localhost:5432/postgres", // connect to default db
  });
  
  try {
    const client = await pool.connect();
    console.log("Connected to postgres database");
    
    // Check if cine_script_writer exists
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname='cine_script_writer'");
    if (res.rowCount === 0) {
      console.log("cine_script_writer database does not exist. Creating...");
      await client.query("CREATE DATABASE cine_script_writer");
      console.log("Database created successfully");
    } else {
      console.log("cine_script_writer database already exists");
    }
    client.release();
  } catch (err) {
    console.error("Connection failed:", err.message);
  } finally {
    pool.end();
  }
}

test();
