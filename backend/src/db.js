const { Pool } = require("pg");

const pool = new Pool({
  host:                   process.env.DB_HOST     || "localhost",
  port:     parseInt(    process.env.DB_PORT      || "5432", 10),
  database:               process.env.DB_NAME     || "devflow",
  user:                   process.env.DB_USER     || "devflow_user",
  password:               process.env.DB_PASSWORD,
  min:      parseInt(    process.env.DB_POOL_MIN  || "2",    10),
  max:      parseInt(    process.env.DB_POOL_MAX  || "10",   10),
  idleTimeoutMillis:      30000,
  connectionTimeoutMillis: 2000,
});

pool.on("error", (err) => {
  console.error("Unexpected DB pool error:", err);
});

const query     = (text, params) => pool.query(text, params);
const getClient = ()             => pool.connect();

// Verify connection at startup
pool.query("SELECT NOW()")
  .then(() => console.log("✓ PostgreSQL connected"))
  .catch((err) => { console.error("✗ PostgreSQL connection failed:", err.message); process.exit(1); });

module.exports = { query, getClient, pool };
