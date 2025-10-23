import express from "express";
import pool from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

// Login endpoint
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  try {
    const [results] = await pool.query(
      "SELECT id, name, email, role, batch_id, password FROM users WHERE email=?",
      [email]
    );

    if (results.length === 0)
      return res.status(401).json({ message: "Invalid credentials" });

    const user = results[0];
    
    // For plain text password (your current setup)
    if (password !== user.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, batch_id: user.batch_id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    // Don't send password to frontend
    delete user.password;
    
    res.json({ 
      user: user,
      token: token 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Register endpoint
router.post("/register", async (req, res) => {
  const { name, email, password, role, batch_id } = req.body;
  
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if user exists
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    await pool.query(
      "INSERT INTO users (name, email, password, role, batch_id) VALUES (?, ?, ?, ?, ?)",
      [name, email, password, role, batch_id || null]
    );
    
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
