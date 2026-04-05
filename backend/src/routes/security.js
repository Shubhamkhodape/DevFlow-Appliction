const router = require("express").Router();
const { v4: uuidv4 } = require("uuid");
const db     = require("../db");

// GET /api/security  — all findings, optionally filtered
router.get("/", async (req, res) => {
  const { severity, project, run_id } = req.query;
  const conditions = [];
  const vals = [];

  if (severity) { conditions.push(`severity = $${vals.length + 1}`); vals.push(severity); }
  if (project)  { conditions.push(`project_name = $${vals.length + 1}`); vals.push(project); }
  if (run_id)   { conditions.push(`run_id = $${vals.length + 1}`); vals.push(run_id); }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const { rows } = await db.query(
    `SELECT * FROM vulnerabilities ${where} ORDER BY created_at DESC`,
    vals
  );
  res.json({ vulnerabilities: rows });
});

// GET /api/security/summary  — counts by severity
router.get("/summary", async (req, res) => {
  const { rows } = await db.query(
    `SELECT severity, COUNT(*) AS count
       FROM vulnerabilities
      GROUP BY severity
      ORDER BY CASE severity
               WHEN 'Critical' THEN 1
               WHEN 'High'     THEN 2
               WHEN 'Medium'   THEN 3
               ELSE 4 END`
  );
  res.json({ summary: rows });
});

// GET /api/security/:id
router.get("/:id", async (req, res) => {
  const { rows } = await db.query("SELECT * FROM vulnerabilities WHERE id = $1", [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: "Vulnerability not found" });
  res.json({ vulnerability: rows[0] });
});

// POST /api/security  — ingest findings from scanner (called by CI agent)
router.post("/", async (req, res) => {
  const { run_id, findings } = req.body;
  if (!run_id || !Array.isArray(findings))
    return res.status(400).json({ error: "run_id and findings[] are required" });

  const inserted = [];
  for (const f of findings) {
    const { rows } = await db.query(
      `INSERT INTO vulnerabilities
         (id, run_id, project_name, vuln_id, title, severity, tool, cvss, cve, cwe,
          file_path, line_number, package_name, fix)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [
        uuidv4(), run_id, f.project_name, f.vuln_id || f.id, f.title,
        f.severity, f.tool, f.cvss || null, f.cve || null, f.cwe || null,
        f.file || null, f.line || null, f.pkg || null, f.fix || null,
      ]
    );
    inserted.push(rows[0]);
  }
  res.status(201).json({ inserted: inserted.length, vulnerabilities: inserted });
});

module.exports = router;
