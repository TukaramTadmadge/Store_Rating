const db = require('../config/db');

const AdminLog = {
  create: async ({ admin_id, action }) => {
    const [result] = await db.query(
      'INSERT INTO admin_logs (admin_id, action) VALUES (?, ?)',
      [admin_id, action]
    );
    return result.insertId;
  },

  getAll: async () => {
    const [rows] = await db.query('SELECT * FROM admin_logs');
    return rows;
  }
};

module.exports = AdminLog;
