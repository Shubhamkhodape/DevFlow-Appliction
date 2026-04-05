const redis = require("redis");

const client = redis.createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });

client.on("error",   (err) => console.error("Redis error:", err));
client.on("connect", ()    => console.log("✓ Redis connected"));

client.connect().catch((err) => {
  console.error("✗ Redis connection failed:", err.message);
});

module.exports = client;
