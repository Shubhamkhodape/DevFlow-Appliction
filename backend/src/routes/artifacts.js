const router = require("express").Router();
const { v4: uuidv4 } = require("uuid");
const db     = require("../db");
const { requireRole } = require("../middleware/rbac");

// GET /api/artifacts
router.get("/", async (req, res) => {
  const { project } = req.query;
  let text = "SELECT * FROM artifacts";
  const vals = [];
  if (project) { text += " WHERE project = $1"; vals.push(project); }
  text += " ORDER BY pushed_at DESC";
  const { rows } = await db.query(text, vals);
  res.json({ artifacts: rows });
});

// GET /api/artifacts/:id
router.get("/:id", async (req, res) => {
  const { rows } = await db.query("SELECT * FROM artifacts WHERE id = $1", [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: "Artifact not found" });
  res.json({ artifact: rows[0] });
});

// POST /api/artifacts  — register a new artifact (called by pipeline)
router.post("/", async (req, res) => {
  const { name, version, type, size, digest, project, run_id } = req.body;
  if (!name || !version || !type || !project)
    return res.status(400).json({ error: "name, version, type and project are required" });

  const { rows } = await db.query(
    `INSERT INTO artifacts (id, name, version, type, size, digest, project, run_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [uuidv4(), name, version, type, size, digest, project, run_id || null]
  );
  res.status(201).json({ artifact: rows[0] });
});

// DELETE /api/artifacts/:id  (Admin only)
router.delete("/:id", requireRole("Admin"), async (req, res) => {
  const { rowCount } = await db.query("DELETE FROM artifacts WHERE id = $1", [req.params.id]);
  if (!rowCount) return res.status(404).json({ error: "Artifact not found" });
  res.json({ deleted: true });
});

module.exports = router;
