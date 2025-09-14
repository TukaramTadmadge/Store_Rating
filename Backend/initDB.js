const db = require('./config/db');
const bcrypt = require('bcryptjs');

const initDB = async () => {
  try {
    await db.query(`CREATE DATABASE IF NOT EXISTS store`);
    await db.query(`USE store`);

    // Roles
    await db.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE
      )
    `);
    const [roles] = await db.query('SELECT COUNT(*) as count FROM roles');
    if (roles[0].count === 0) {
      await db.query("INSERT INTO roles (name) VALUES ('System Administrator'), ('Normal User'), ('Store Owner')");
    }

    // Users
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(60) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        address VARCHAR(400) NOT NULL,
        role_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES roles(id)
      )
    `);

    // Default system admin (create only if none exist)
    const [admins] = await db.query("SELECT COUNT(*) as count FROM users WHERE role_id = 1");
    if (admins[0].count === 0) {
      const hashedPassword = await bcrypt.hash("@root123", 10);
      await db.query(
        "INSERT INTO users (name, email, password, address, role_id) VALUES (?, ?, ?, ?, ?)",
        ["tukaram balajji tadmadge", "root@gmail.com", hashedPassword, "Bawada", 1]
      );
      console.log("✅ Default System Administrator created successfully!");
    }

    // Stores
    await db.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        address VARCHAR(400) NOT NULL,
        role_id INT DEFAULT 3,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES roles(id)
      )
    `);

    // Ratings
    await db.query(`
      CREATE TABLE IF NOT EXISTS ratings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        store_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_rating(user_id, store_id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (store_id) REFERENCES stores(id)
      )
    `);

    // Admin logs
    await db.query(`
      CREATE TABLE IF NOT EXISTS admin_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        admin_id INT NOT NULL,
        action VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES users(id)
      )
    `);

    console.log('✅ All tables created successfully or already exist!');
    console.log(' Default System Admin Credentials:');
    console.log('   Email: root@gmail.com');
    console.log('   Password: @root123');
    console.log('Direct Login to get Access to Admin Dashboard with above credentials.');
  } catch (err) {
    console.error('❌ Error creating tables:', err);
  }
};

module.exports = initDB;
