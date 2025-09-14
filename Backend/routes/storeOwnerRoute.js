const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db'); // your MySQL db
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [store] = await db.query('SELECT * FROM stores WHERE email = ?', [email]);
    if (!store[0]) return res.status(400).json({ error: 'Invalid email or password' });

    const validPassword = await bcrypt.compare(password, store[0].password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ id: store[0].id, email: store[0].email }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, store: { id: store[0].id, name: store[0].name, email: store[0].email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update password
router.put('/update-password', authMiddleware, async (req, res) => {
  const { newPassword } = req.body;
  try {
    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE stores SET password = ? WHERE id = ?', [hashed, req.user.id]);
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Dashboard - get store info, ratings, average rating
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const storeId = req.user.id;

    // Store info
    const [storeRows] = await db.query('SELECT id, name, email, address FROM stores WHERE id = ?', [storeId]);
    const store = storeRows[0];

    // Ratings & users
    const [ratings] = await db.query(`
      SELECT 
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email,
        r.rating,
        r.created_at AS rated_at
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?`, [storeId]);

    // Average rating
    const [avg] = await db.query('SELECT AVG(rating) AS avgRating FROM ratings WHERE store_id = ?', [storeId]);
    const avgRating = avg[0].avgRating || 0;

    res.json({ store, ratings, avgRating });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
