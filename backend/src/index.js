require("dotenv").config();
const express   = require("express");
const cors      = require("cors");
const helmet    = require("helmet");
const rateLimit = require("express-rate-limit");
const client    = require("prom-client");
const { createServer } = require("http");

const authRoutes      = require("./routes/auth");
const projectRoutes   = require("./routes/projects");
const pipelineRoutes  = require("./routes/pipelines");
const artifactRoutes  = require("./routes/artifacts");
const securityRoutes  = require("./routes/security");
const { verifyToken } = require("./middleware/auth");

const app  = express();
const PORT = process.env.PORT || 4000;

// ── Prometheus metrics ────────────────────────────────────────────────────────
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const buildCounter = new client.Counter({
  name: "ci_builds_total",
  help: "Total pipeline runs",
  labelNames: ["status", "project"],
  registers: [register],
});

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth",      authRoutes);
app.use("/api/projects",  verifyToken, projectRoutes);
app.use("/api/pipelines", verifyToken, pipelineRoutes);
app.use("/api/artifacts", verifyToken, artifactRoutes);
app.use("/api/security",  verifyToken, securityRoutes);

// ── Health & metrics ──────────────────────────────────────────────────────────
app.get("/health", (_, res) => res.json({ status: "ok", uptime: process.uptime() }));

app.get("/metrics", async (_, res) => {
  res.set("Content-Type", register.contentType);
  res.send(await register.metrics());
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: "Not found" }));

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const server = createServer(app);
server.listen(PORT, () => {
  console.log(`✓ DevFlow API running on port ${PORT}`);
});

module.exports = { app, buildCounter };
