const router = require("express").Router();
const { v4: uuidv4 } = require("uuid");
const db     = require("../db");
const { requireRole } = require("../middleware/rbac");

// GET /api/projects
router.get("/", async (req, res) => {
  const { rows } = await db.query(
    `SELECT p.*, u.username AS owner_name
       FROM projects p
       LEFT JOIN users u ON u.id = p.owner_id
      ORDER BY p.created_at DESC`
  );
  res.json({ projects: rows });
});

// GET /api/projects/:id
router.get("/:id", async (req, res) => {
  const { rows } = await db.query("SELECT * FROM projects WHERE id = $1", [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: "Project not found" });
  res.json({ project: rows[0] });
});

// POST /api/projects
router.post("/", async (req, res) => {
  const { name, repo, branch = "main", lang, description, env = "staging", stages = [] } = req.body;
  if (!name || !repo || !lang)
    return res.status(400).json({ error: "name, repo and lang are required" });

  const { rows } = await db.query(
    `INSERT INTO projects (id, name, repo, branch, lang, description, env, stages, owner_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [uuidv4(), name, repo, branch, lang, description, env, JSON.stringify(stages), req.user.id]
  );
  res.status(201).json({ project: rows[0] });
});

// PATCH /api/projects/:id
router.patch("/:id", async (req, res) => {
  const allowed = ["repo", "branch", "description", "env", "stages"];
  const fields  = Object.keys(req.body).filter((k) => allowed.includes(k));
  if (fields.length === 0) return res.status(400).json({ error: "No updatable fields provided" });

  const sets   = fields.map((f, i) => `${f} = $${i + 2}`).join(", ");
  const values = fields.map((f) => (f === "stages" ? JSON.stringify(req.body[f]) : req.body[f]));
  const { rows } = await db.query(
    `UPDATE projects SET ${sets} WHERE id = $1 RETURNING *`,
    [req.params.id, ...values]
  );
  if (!rows[0]) return res.status(404).json({ error: "Project not found" });
  res.json({ project: rows[0] });
});

// DELETE /api/projects/:id  (Admin only)
router.delete("/:id", requireRole("Admin"), async (req, res) => {
  const { rowCount } = await db.query("DELETE FROM projects WHERE id = $1", [req.params.id]);
  if (!rowCount) return res.status(404).json({ error: "Project not found" });
  res.json({ deleted: true });
});

module.exports = router;
