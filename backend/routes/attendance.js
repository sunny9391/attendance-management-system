import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Get all attendance records (Admin only)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, b.name as batch_name, u.name as marked_by_name 
       FROM attendance a 
       LEFT JOIN batches b ON a.batchid = b.id
       LEFT JOIN users u ON a.marked_by = u.id
       ORDER BY a.date DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get attendance records for a specific batch
router.get('/batch/:batchid', async (req, res) => {
  const batchid = req.params.batchid;
  try {
    const [rows] = await pool.query(
      "SELECT id, batchid, date, studentname, status FROM attendance WHERE batchid = ? ORDER BY date DESC",
      [batchid]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Check if attendance already exists for student on specific date
router.get('/check/:batchid/:date', async (req, res) => {
  const { batchid, date } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT COUNT(*) as count FROM attendance WHERE batchid = ? AND date = ?",
      [batchid, date]
    );
    res.json({ exists: rows[0].count > 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Bulk attendance submit with duplicate check
router.post('/bulk', async (req, res) => {
  const attendanceList = req.body;
  
  if (!Array.isArray(attendanceList) || attendanceList.length === 0)
    return res.status(400).json({ message: "No attendance records provided" });

  const batchid = attendanceList[0].batchid;
  const date = attendanceList[0].date;

  try {
    // Check if attendance already exists for this batch on this date
    const [existing] = await pool.query(
      "SELECT COUNT(*) as count FROM attendance WHERE batchid = ? AND date = ?",
      [batchid, date]
    );

    if (existing[0].count > 0) {
      return res.status(400).json({ 
        message: `Attendance for this batch on ${date} has already been recorded. Please delete the existing records first if you want to update.` 
      });
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      
      for (const record of attendanceList) {
        await conn.query(
          "INSERT INTO attendance (batchid, date, studentname, status, marked_by) VALUES (?, ?, ?, ?, ?)",
          [record.batchid, record.date, record.studentname, record.status, record.marked_by || null]
        );
      }
      
      await conn.commit();
      res.status(201).json({ message: "Attendance records added successfully" });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete attendance for a specific batch and date
router.delete('/batch/:batchid/date/:date', async (req, res) => {
  const { batchid, date } = req.params;
  try {
    await pool.query(
      "DELETE FROM attendance WHERE batchid = ? AND date = ?",
      [batchid, date]
    );
    res.json({ message: "Attendance records deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get dashboard statistics
router.get('/stats/dashboard', async (req, res) => {
  try {
    const [totalStudents] = await pool.query(
      "SELECT COUNT(*) as count FROM users WHERE role = 'student'"
    );
    
    const [totalBatches] = await pool.query(
      "SELECT COUNT(*) as count FROM batches"
    );
    
    const [totalBatchOwners] = await pool.query(
      "SELECT COUNT(*) as count FROM users WHERE role = 'batch_owner'"
    );
    
    const [todayAttendance] = await pool.query(
      "SELECT COUNT(*) as count FROM attendance WHERE date = CURDATE()"
    );
    
    const [todayPresent] = await pool.query(
      "SELECT COUNT(*) as count FROM attendance WHERE date = CURDATE() AND status = 'present'"
    );
    
    const [todayAbsent] = await pool.query(
      "SELECT COUNT(*) as count FROM attendance WHERE date = CURDATE() AND status = 'absent'"
    );
    
    res.json({
      totalStudents: totalStudents[0].count,
      totalBatches: totalBatches[0].count,
      totalBatchOwners: totalBatchOwners[0].count,
      todayAttendance: todayAttendance[0].count,
      todayPresent: todayPresent[0].count,
      todayAbsent: todayAbsent[0].count
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get today's attendance for a specific batch
router.get('/today/:batchid', async (req, res) => {
  const { batchid } = req.params;
  const today = new Date().toISOString().split('T')[0];
  
  try {
    const [rows] = await pool.query(
      "SELECT * FROM attendance WHERE batchid = ? AND date = ?",
      [batchid, today]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update attendance record
router.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    await pool.query(
      "UPDATE attendance SET status = ? WHERE id = ?",
      [status, id]
    );
    res.json({ message: "Attendance updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ========== NEW ROUTES FOR EDIT ATTENDANCE PAGE ==========

// Get all unique dates where attendance was marked for a batch
router.get('/dates/:batchid', async (req, res) => {
  const { batchid } = req.params;
  
  try {
    const [rows] = await pool.query(
      "SELECT DISTINCT date FROM attendance WHERE batchid = ? ORDER BY date DESC",
      [batchid]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get attendance for specific batch and date
router.get('/batch/:batchid/date/:date', async (req, res) => {
  const { batchid, date } = req.params;
  
  try {
    const [rows] = await pool.query(
      "SELECT * FROM attendance WHERE batchid = ? AND date = ? ORDER BY studentname",
      [batchid, date]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
