const router  = require("express").Router();
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const db      = require("../db");

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { username, email, password, role = "Developer" } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: "username, email and password are required" });

  try {
    const hash = await bcrypt.hash(password, 12);
    const avatar = username.slice(0, 2).toUpperCase();
    const { rows } = await db.query(
      `INSERT INTO users (id, username, email, password_hash, role, avatar)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, username, email, role, avatar`,
      [uuidv4(), username, email, hash, role, avatar]
    );
    res.status(201).json({ user: rows[0] });
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ error: "Username or email already taken" });
    throw err;
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "username and password are required" });

  const { rows } = await db.query(
    "SELECT * FROM users WHERE username = $1",
    [username]
  );
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash)))
    return res.status(401).json({ error: "Invalid credentials" });

  await db.query("UPDATE users SET last_login = NOW() WHERE id = $1", [user.id]);

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
  );

  res.json({
    token,
    user: { id: user.id, username: user.username, email: user.email, role: user.role, avatar: user.avatar },
  });
});

// GET /api/auth/me  (requires verifyToken — applied in index.js if mounted under protected prefix)
router.get("/me", require("../middleware/auth").verifyToken, async (req, res) => {
  const { rows } = await db.query(
    "SELECT id, username, email, role, avatar, created_at FROM users WHERE id = $1",
    [req.user.id]
  );
  if (!rows[0]) return res.status(404).json({ error: "User not found" });
  res.json({ user: rows[0] });
});

module.exports = router;
