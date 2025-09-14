const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");
const authMiddleware = require("../middleware/authMiddleware");

// ==========================
// Fetch all stores
// ==========================
router.get("/stores/all", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const [stores] = await db.query(
      `SELECT s.id, s.name, s.address,
              IFNULL(AVG(r.rating), 0) AS overallRating,
              (SELECT rating FROM ratings WHERE user_id = ? AND store_id = s.id) AS userRating
       FROM stores s
       LEFT JOIN ratings r ON s.id = r.store_id
       GROUP BY s.id`,
      [userId]
    );
    res.json(stores);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================
// Search stores
// ==========================
router.post("/stores/search", authMiddleware, async (req, res) => {
  try {
    const { name = "", address = "" } = req.body;
    const userId = req.user.id;

    const [stores] = await db.query(
      `SELECT s.id, s.name, s.address,
              IFNULL(AVG(r.rating), 0) AS overallRating,
              (SELECT rating FROM ratings WHERE user_id = ? AND store_id = s.id) AS userRating
       FROM stores s
       LEFT JOIN ratings r ON s.id = r.store_id
       WHERE s.name LIKE ? AND s.address LIKE ?
       GROUP BY s.id`,
      [userId, `%${name}%`, `%${address}%`]
    );

    res.json(stores);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================
// Rate or modify store rating
// ==========================
router.post("/stores/rate", authMiddleware, async (req, res) => {
  try {
    const { store_id, rating } = req.body;
    const userId = req.user.id;
    if (!store_id || !rating) return res.status(400).json({ error: "Store & rating required" });

    await db.query(
      `INSERT INTO ratings (user_id, store_id, rating)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = ?`,
      [userId, store_id, rating, rating]
    );

    res.json({ message: "Rating saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================
// Update password
// ==========================
router.post("/auth/update-password", authMiddleware, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword) return res.status(400).json({ error: "New password required" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, req.user.id]);

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
