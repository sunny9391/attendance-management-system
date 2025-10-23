import express from 'express';
import pool from '../db.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Get all batches
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [batches] = await pool.query(
      "SELECT b.*, u.name as owner_name FROM batches b LEFT JOIN users u ON b.owner_id = u.id"
    );
    res.json(batches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get batch by owner
router.get('/owner/:ownerid', authenticateToken, async (req, res) => {
  const ownerid = req.params.ownerid;
  try {
    const [batches] = await pool.query(
      "SELECT * FROM batches WHERE owner_id = ?",
      [ownerid]
    );
    
    if (batches.length === 0)
      return res.status(404).json({ message: "No batch found for this owner" });
    
    res.json(batches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new batch (Admin only)
router.post('/', authenticateToken, authorizeRole('admin', 'batch_owner'), async (req, res) => {
  const { name, owner_id } = req.body;
  
  if (!name || !owner_id)
    return res.status(400).json({ error: "Name and owner_id are required" });

  try {
    await pool.query(
      "INSERT INTO batches (name, owner_id) VALUES (?, ?)",
      [name, owner_id]
    );
    res.status(201).json({ message: "Batch added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update batch
router.put('/:id',authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, owner_id } = req.body;
  
  try {
    await pool.query(
      "UPDATE batches SET name = ?, owner_id = ? WHERE id = ?",
      [name, owner_id, id]
    );
    res.json({ message: "Batch updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete batch
router.delete('/:id', authenticateToken,async (req, res) => {
  const { id } = req.params;
  
  try {
    await pool.query("DELETE FROM batches WHERE id = ?", [id]);
    res.json({ message: "Batch deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


export default router;
