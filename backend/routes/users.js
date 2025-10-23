import express from 'express';
import pool from '../db.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Get all users (Admin only)
router.get('/', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const [users] = await pool.query("SELECT id, name, email, role, batch_id FROM users");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get users by batch (Students in a batch)
router.get('/batch/:batchId', authenticateToken, async (req, res) => {
  const batchId = req.params.batchId;
  try {
    const [users] = await pool.query(
      "SELECT id, name, email, role FROM users WHERE batch_id = ? AND role = 'student'", 
      [batchId]
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add user
router.post('/', authenticateToken, authorizeRole('admin'), async (req, res) => {
  const { name, email, password, role, batch_id } = req.body;
  
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    await pool.query(
      "INSERT INTO users (name, email, password, role, batch_id) VALUES (?, ?, ?, ?, ?)",
      [name, email, password, role, batch_id || null]
    );
    res.status(201).json({ message: "User added successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add these routes to your existing users.js file

// Update user
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, password, batch_id } = req.body;
  
  try {
    let query = "UPDATE users SET name = ?, email = ?, batch_id = ?";
    let params = [name, email, batch_id];
    
    // Only update password if provided
    if (password) {
      query += ", password = ?";
      params.push(password);
    }
    
    query += " WHERE id = ?";
    params.push(id);
    
    await pool.query(query, params);
    res.json({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    await pool.query("DELETE FROM users WHERE id = ?", [id]);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


export default router;
