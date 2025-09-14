const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");

// Helper: run query safely
const runQuery = async (res, query, params = []) => {
  try {
    const [rows] = await db.query(query, params);
    return rows;
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Dashboard
router.get("/dashboard", async (req, res) => {
  const stats = await Promise.all([
    runQuery(res, "SELECT COUNT(*) total FROM users"),
    runQuery(res, "SELECT COUNT(*) total FROM stores"),
    runQuery(res, "SELECT COUNT(*) total FROM ratings"),
  ]);
  if (stats) res.json({
    total_users: stats[0][0].total,
    total_stores: stats[1][0].total,
    total_ratings: stats[2][0].total,
  });
});

// Add User
router.post("/users", async (req, res) => {
  const { name, email, address, role_id, password } = req.body;
  if (!name || !email || !address || !role_id || !password)
    return res.status(400).json({ error: "All fields required" });

  const exists = await runQuery(res, "SELECT id FROM users WHERE email=?", [email]);
  if (exists?.length) return res.status(400).json({ error: "Email exists" });

  const hashed = await bcrypt.hash(password, 10);
  await runQuery(res,
    "INSERT INTO users (name,email,address,role_id,password) VALUES (?,?,?,?,?)",
    [name, email, address, role_id, hashed]
  );
  res.json({ message: "User added" });
});

// List Users
router.get("/users", async (req, res) => {
  const { name, email, address, role } = req.query;
  let query = `
    SELECT u.id,u.name,u.email,u.address,r.name role
    FROM users u JOIN roles r ON u.role_id=r.id WHERE 1=1`;
  const params = [];
  if (name) { query += " AND u.name LIKE ?"; params.push(`%${name}%`); }
  if (email) { query += " AND u.email LIKE ?"; params.push(`%${email}%`); }
  if (address) { query += " AND u.address LIKE ?"; params.push(`%${address}%`); }
  if (role) { query += " AND r.name LIKE ?"; params.push(`%${role}%`); }

  res.json(await runQuery(res, query, params));
});

// Add Store (NO owner_id anymore)
router.post("/stores", async (req, res) => {
  const { name, email, address, password } = req.body;
  if (!name || !email || !address || !password)
    return res.status(400).json({ error: "All fields required" });

  const exists = await runQuery(res, "SELECT id FROM stores WHERE email=?", [email]);
  if (exists?.length) return res.status(400).json({ error: "Email exists" });

  const hashed = await bcrypt.hash(password, 10);
  await runQuery(res,
    "INSERT INTO stores (name,email,password,address,role_id) VALUES (?,?,?,?,3)",
    [name, email, hashed, address]
  );
  res.json({ message: "Store added" });
});

// List Stores
router.get("/stores", async (req, res) => {
  const { name, email, address } = req.query;
  let query = `
    SELECT s.id,s.name,s.email,s.address,
      (SELECT AVG(r.rating) FROM ratings r WHERE r.store_id=s.id) rating
    FROM stores s WHERE 1=1`;
  const params = [];
  if (name) { query += " AND s.name LIKE ?"; params.push(`%${name}%`); }
  if (email) { query += " AND s.email LIKE ?"; params.push(`%${email}%`); }
  if (address) { query += " AND s.address LIKE ?"; params.push(`%${address}%`); }

  res.json(await runQuery(res, query, params));
});

// Roles
router.get("/roles", async (req, res) => {
  res.json(await runQuery(res, "SELECT id,name FROM roles"));
});

module.exports = router;
