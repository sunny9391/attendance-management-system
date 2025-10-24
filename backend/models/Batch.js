import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  owner_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: null
  }
}, { 
  timestamps: true 
});

export default mongoose.model('Batch', batchSchema);
