import mongoose from 'mongoose'

const attendanceSchema = new mongoose.Schema(
  {
    batchid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    studentname: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late'],
      required: true
    },
    marked_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    batch_name: {
      type: String
    }
  },
  {
    timestamps: true
  }
)

attendanceSchema.index(
  { batchid: 1, studentname: 1, date: 1 },
  { unique: true }
)

export default mongoose.model('Attendance', attendanceSchema)
