// server/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");

router.post("/signup", async (req, res) => {
  try {
    const { name, email, phone, dob, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      phone,
      dob,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: "Signup successful" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Signup failed" });
  }
});

router.get("/profile/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

module.exports = router;
