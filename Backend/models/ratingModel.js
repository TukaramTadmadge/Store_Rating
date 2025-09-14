const db = require('../config/db');

const Rating = {
  create: async ({ user_id, store_id, rating }) => {
    const [result] = await db.query(
      'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
      [user_id, store_id, rating]
    );
    return result.insertId;
  },

  update: async ({ user_id, store_id, rating }) => {
    await db.query(
      'UPDATE ratings SET rating = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND store_id = ?',
      [rating, user_id, store_id]
    );
  },

  getByStore: async (store_id) => {
    const [rows] = await db.query('SELECT * FROM ratings WHERE store_id = ?', [store_id]);
    return rows;
  },

  getByUser: async (user_id) => {
    const [rows] = await db.query('SELECT * FROM ratings WHERE user_id = ?', [user_id]);
    return rows;
  }
};

module.exports = Rating;
