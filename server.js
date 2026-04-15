// server/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require('express-session');
const passport = require('passport');
require("dotenv").config(); // ensure you have a .env with MONGO_URI
require('./config/auth'); // Initialize passport

const authRoutes = require("./routes/authRoutes");

const app = express();

// Middleware
app.use(cors({ 
  origin: "http://localhost:3000",
  credentials: true 
}));
app.use(express.json());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/auth", authRoutes);

// Google OAuth Routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/login',
    session: true
  }),
  (req, res) => {
    // Successful authentication, redirect to the frontend with user data
    res.redirect(`http://localhost:3000/dashboard?user=${encodeURIComponent(JSON.stringify(req.user))}`);
  }
);

// Logout route
app.get('/auth/logout', (req, res) => {
  req.logout();
  res.redirect('http://localhost:3000/login');
});

// Health check (optional)
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// DB + start
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB connection error:", err);
  });
