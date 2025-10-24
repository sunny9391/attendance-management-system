import express from 'express';
import Attendance from '../models/Attendance.js';
import Batch from '../models/Batch.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const attendance = await Attendance.find()
      .populate('batchid', 'name')
      .populate('marked_by', 'name')
      .sort({ date: -1, createdAt: -1 });
    
    const formattedAttendance = attendance.map(record => ({
      ...record.toObject(),
      batch_name: record.batchid?.name || 'Unknown Batch'
    }));
    
    res.json(formattedAttendance);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/batch/:batchId', async (req, res) => {
  try {
    const attendance = await Attendance.find({ batchid: req.params.batchId })
      .populate('marked_by', 'name')
      .sort({ date: -1 });
    
    res.json(attendance);
  } catch (error) {
    console.error('Get batch attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/date/:date/batch/:batchId', async (req, res) => {
  try {
    const { date, batchId } = req.params;
    
    const attendance = await Attendance.find({
      date: new Date(date),
      batchid: batchId
    }).populate('marked_by', 'name');
    
    res.json(attendance);
  } catch (error) {
    console.error('Get date attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/stats/dashboard', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalBatches = await Batch.countDocuments();
    const totalBatchOwners = await User.countDocuments({ role: 'batch_owner' });
    
    const todayAttendance = await Attendance.countDocuments({
      date: { $gte: today }
    });
    
    const todayPresent = await Attendance.countDocuments({
      date: { $gte: today },
      status: {$in :['present','late']},
    });
    
    const todayAbsent = await Attendance.countDocuments({
      date: { $gte: today },
      status: { $in: ['absent', 'late'] }
    });
    
    res.json({
      totalStudents,
      totalBatches,
      totalBatchOwners,
      todayAttendance,
      todayPresent,
      todayAbsent
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { attendance, marked_by } = req.body;
    
    const batchIds = [...new Set(attendance.map(a => a.batchid))];
    const batches = await Batch.find({ _id: { $in: batchIds } });
    const batchMap = {};
    batches.forEach(b => batchMap[b._id.toString()] = b.name);
    
    const attendanceRecords = attendance.map(record => ({
      ...record,
      batch_name: batchMap[record.batchid],
      marked_by,
      date: new Date(record.date)
    }));
    
    const result = await Attendance.insertMany(attendanceRecords, { 
      ordered: false 
    }).catch(err => {
      if (err.code === 11000) {
        return { insertedCount: err.writeErrors ? attendance.length - err.writeErrors.length : 0 };
      }
      throw err;
    });
    
    res.status(201).json({ 
      message: 'Attendance recorded successfully',
      count: result.insertedCount || result.length
    });
  } catch (error) {
    console.error('Create attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    
    const updatedAttendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('batchid', 'name').populate('marked_by', 'name');
    
    if (!updatedAttendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    
    res.json(updatedAttendance);
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedAttendance = await Attendance.findByIdAndDelete(req.params.id);
    
    if (!deletedAttendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    
    res.json({ message: 'Attendance deleted successfully' });
  } catch (error) {
    console.error('Delete attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
