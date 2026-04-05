const router = require("express").Router();
const db     = require("../db");
const { requireRole } = require("../middleware/rbac");

// GET /api/pipelines  — list runs (optionally filter by project)
router.get("/", async (req, res) => {
  const { project, limit = 50, offset = 0 } = req.query;
  let text   = "SELECT * FROM pipeline_runs";
  const vals = [];
  if (project) { text += " WHERE project_name = $1"; vals.push(project); }
  text += ` ORDER BY created_at DESC LIMIT $${vals.length + 1} OFFSET $${vals.length + 2}`;
  vals.push(limit, offset);

  const { rows } = await db.query(text, vals);
  res.json({ runs: rows });
});

// GET /api/pipelines/:id
router.get("/:id", async (req, res) => {
  const { rows } = await db.query("SELECT * FROM pipeline_runs WHERE id = $1", [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: "Run not found" });

  const vulns = await db.query("SELECT * FROM vulnerabilities WHERE run_id = $1", [req.params.id]);
  res.json({ run: rows[0], vulns: vulns.rows });
});

// POST /api/pipelines/trigger
router.post("/trigger", async (req, res) => {
  const { project_id, project_name, branch, trigger = "manual", env = "staging" } = req.body;
  if (!project_name || !branch) return res.status(400).json({ error: "project_name and branch are required" });

  // Generate a short run ID similar to the frontend simulation
  const id = Math.random().toString(36).substr(2, 8).toUpperCase();

  const { rows } = await db.query(
    `INSERT INTO pipeline_runs (id, project_id, project_name, branch, trigger, env, status, triggered_by)
     VALUES ($1,$2,$3,$4,$5,$6,'pending',$7) RETURNING *`,
    [id, project_id || null, project_name, branch, trigger, env, req.user.id]
  );
  res.status(202).json({ run: rows[0] });
});

// PATCH /api/pipelines/:id  — update status / stages / duration (called by CI agent)
router.patch("/:id", async (req, res) => {
  const { status, stages, duration } = req.body;
  const { rows } = await db.query(
    `UPDATE pipeline_runs
        SET status      = COALESCE($2, status),
            stages      = COALESCE($3, stages),
            duration    = COALESCE($4, duration),
            finished_at = CASE WHEN $2 IN ('success','failed') THEN NOW() ELSE finished_at END
      WHERE id = $1 RETURNING *`,
    [req.params.id, status || null, stages ? JSON.stringify(stages) : null, duration || null]
  );
  if (!rows[0]) return res.status(404).json({ error: "Run not found" });
  res.json({ run: rows[0] });
});

// POST /api/pipelines/:id/approve  (Admin only)
router.post("/:id/approve", requireRole("Admin"), async (req, res) => {
  const { rows } = await db.query(
    "UPDATE pipeline_runs SET status = 'approved' WHERE id = $1 RETURNING *",
    [req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: "Run not found" });
  res.json({ run: rows[0] });
});

module.exports = router;
