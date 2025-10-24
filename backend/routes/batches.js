import express from 'express';
import Batch from '../models/Batch.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const batches = await Batch.find()
      .populate('owner_id', 'name email')
      .sort({ createdAt: -1 });
    res.json(batches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate('owner_id', 'name email');
    
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    
    res.json(batch);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const { name, owner_id } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Batch name is required' });
  }

  try {
    if (owner_id) {
      const existingBatch = await Batch.findOne({ owner_id });
      if (existingBatch) {
        return res.status(400).json({ 
          message: 'This batch owner already has an assigned batch. Each owner can manage only one batch.' 
        });
      }

      const owner = await User.findById(owner_id);
      if (!owner) {
        return res.status(404).json({ message: 'Batch owner not found' });
      }
      if (owner.role !== 'batch_owner') {
        return res.status(400).json({ message: 'Selected user is not a batch owner' });
      }
    }

    const batch = new Batch({
      name,
      owner_id: owner_id || null
    });

    const savedBatch = await batch.save();
    const populatedBatch = await Batch.findById(savedBatch._id)
      .populate('owner_id', 'name email');
    
    res.status(201).json(populatedBatch);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { name, owner_id } = req.body;

  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    if (owner_id && owner_id !== batch.owner_id?.toString()) {
      const existingBatch = await Batch.findOne({ 
        owner_id, 
        _id: { $ne: req.params.id } 
      });
      
      if (existingBatch) {
        return res.status(400).json({ 
          message: 'This batch owner already has an assigned batch. Each owner can manage only one batch.' 
        });
      }

      if (owner_id) {
        const owner = await User.findById(owner_id);
        if (!owner) {
          return res.status(404).json({ message: 'Batch owner not found' });
        }
        if (owner.role !== 'batch_owner') {
          return res.status(400).json({ message: 'Selected user is not a batch owner' });
        }
      }
    }

    if (name) batch.name = name;
    if (owner_id !== undefined) batch.owner_id = owner_id || null;

    const updatedBatch = await batch.save();
    const populatedBatch = await Batch.findById(updatedBatch._id)
      .populate('owner_id', 'name email');
    
    res.json(populatedBatch);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    await batch.deleteOne();
    res.json({ message: 'Batch deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/available/owners', async (req, res) => {
  try {
    const allOwners = await User.find({ role: 'batch_owner' })
      .select('name email')
      .sort({ name: 1 });

    const batchesWithOwners = await Batch.find({ owner_id: { $ne: null } })
      .select('owner_id');
    
    const assignedOwnerIds = batchesWithOwners.map(b => b.owner_id.toString());

    const availableOwners = allOwners.filter(
      owner => !assignedOwnerIds.includes(owner._id.toString())
    );

    res.json(availableOwners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
