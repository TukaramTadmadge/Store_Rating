const db = require('../config/db');

const Store = {
  create: async ({ name, email, address, owner_id, password }) => {
    const [result] = await db.query(
      'INSERT INTO stores (name, email, password, address, owner_id, role_id) VALUES (?, ?, ?, ?, ?, 3)',
      [name, email, password, address, owner_id]
    );
    return result.insertId;
  },

  getById: async (id) => {
    const [rows] = await db.query('SELECT * FROM stores WHERE id = ?', [id]);
    return rows[0];
  },

  getByEmail: async (email) => {
    const [rows] = await db.query('SELECT * FROM stores WHERE email = ?', [email]);
    return rows[0];
  },

  getAll: async () => {
    const [rows] = await db.query('SELECT * FROM stores');
    return rows;
  }
};

module.exports = Store;
