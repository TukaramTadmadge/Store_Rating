const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Store = require('../models/storeModel');
require('dotenv').config();

// ===== SIGNUP =====
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, address } = req.body;
    if (!name || !email || !password || !address) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.getByEmail(email);
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const role_id = 2; // Normal User by default

    const userId = await User.create({ name, email, password: hashedPassword, address, role_id });
    const newUser = await User.getById(userId);

    const token = jwt.sign(
      { id: newUser.id, role_id: newUser.role_id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({ token, user: newUser });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== LOGIN =====
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' });

    // Check in users table
    let user = await User.getByEmail(email);
    if (user) {
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign(
        { id: user.id, role_id: user.role_id },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      return res.json({ token, user });
    }

    // Check in stores table (Store Owners)
    let storeUser = await Store.getByEmail(email);
    if (!storeUser) return res.status(401).json({ error: 'Invalid credentials' });

    const matchStore = await bcrypt.compare(password, storeUser.password);
    if (!matchStore) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: storeUser.id, role_id: storeUser.role_id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: storeUser.id,
        name: storeUser.name,
        email: storeUser.email,
        address: storeUser.address,
        role_id: storeUser.role_id
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== GET CURRENT USER =====
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user = await User.getById(decoded.id);
    if (!user) user = await Store.getById(decoded.id);

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ user });
  } catch (err) {
    console.error('Me error:', err);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// ===== UPDATE PASSWORD =====
router.put('/update-password', async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;
    if (!userId || !oldPassword || !newPassword) {
      return res.status(400).json({ error: 'All fields required' });
    }

    let user = await User.getById(userId);
    let table = 'users';
    if (!user) {
      user = await Store.getById(userId);
      table = 'stores';
    }

    if (!user) return res.status(404).json({ error: 'User not found' });

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) return res.status(400).json({ error: 'Old password incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    if (table === 'users') {
      await User.updatePassword(userId, hashed);
    } else {
      await Store.updatePassword(userId, hashed);
    }

    res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    console.error('Update password error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
