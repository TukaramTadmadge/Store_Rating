require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const initDB = require('./initDB'); // auto-create tables

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/systemAdmin');
const normalUserRoutes = require('./routes/normalUser');
const storeOwnerRoutes = require("./routes/storeOwnerRoute");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize DB
initDB();

// Routes
app.use('/api/auth', authRoutes);        // auth APIs
app.use('/admin', adminRoutes);          // admin APIs
app.use('/user', normalUserRoutes);  
app.use("/api/store-owner", storeOwnerRoutes);
    // normal user APIs

app.get('/', (req, res) => res.send('Store Rating API is running'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
