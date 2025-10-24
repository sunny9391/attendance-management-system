import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['admin', 'batch_owner', 'student'],
    required: true,
    default: 'student'
  },
  batch_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Batch',
    default: null
  }
}, { 
  timestamps: true  // Adds createdAt and updatedAt automatically
});

export default mongoose.model('User', userSchema);
