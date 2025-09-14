const db = require('../config/db');

const User = {
  // Create a new user
  create: async ({ name, email, password, address, role_id }) => {
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, address, role_id) VALUES (?, ?, ?, ?, ?)',
      [name, email, password, address, role_id]
    );
    return result.insertId;
  },

  // Get user by email (with role name)
  getByEmail: async (email) => {
    const [rows] = await db.query(
      'SELECT u.*, r.name as role FROM users u JOIN roles r ON u.role_id=r.id WHERE u.email = ?',
      [email]
    );
    return rows[0];
  },

  // ✅ Get user by ID (with role name)
  getById: async (id) => {
    const [rows] = await db.query(
      'SELECT u.*, r.name as role FROM users u JOIN roles r ON u.role_id=r.id WHERE u.id = ?',
      [id]
    );
    return rows[0];
  }
};

module.exports = User;
