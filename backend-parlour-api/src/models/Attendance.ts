import mongoose, { Schema, Model } from 'mongoose';
import { IAttendance, AttendanceStatus } from '@/types';

const attendanceSchema = new Schema<IAttendance>({
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Employee ID is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: function() {
      const today = new Date();
      return new Date(today.getFullYear(), today.getMonth(), today.getDate());
    }
  },
  punchIn: {
    type: Date,
    default: null
  },
  punchOut: {
    type: Date,
    default: null,
    validate: {
      validator: function(value: Date) {
        if (!value || !this.punchIn) return true;
        return value > this.punchIn;
      },
      message: 'Punch out time must be after punch in time'
    }
  },
  status: {
    type: String,
    enum: Object.values(AttendanceStatus),
    required: true,
    default: AttendanceStatus.PUNCH_IN
  },
  totalHours: {
    type: Number,
    min: [0, 'Total hours cannot be negative'],
    default: 0
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  location: {
    latitude: {
      type: Number,
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    longitude: {
      type: Number,
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, 'Address cannot exceed 200 characters']
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better query performance
attendanceSchema.index({ employeeId: 1 });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ status: 1 });
attendanceSchema.index({ punchIn: 1 });
attendanceSchema.index({ punchOut: 1 });
attendanceSchema.index({ createdAt: -1 });

// Compound indexes
attendanceSchema.index({ employeeId: 1, date: 1 });
attendanceSchema.index({ date: 1, status: 1 });
attendanceSchema.index({ employeeId: 1, status: 1 });

// Ensure unique attendance record per employee per day
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

// Virtual for formatted date
attendanceSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString();
});

// Virtual for work duration
attendanceSchema.virtual('workDuration').get(function() {
  if (!this.punchIn || !this.punchOut) return null;
  
  const duration = this.punchOut.getTime() - this.punchIn.getTime();
  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
});

// Virtual for is present today
attendanceSchema.virtual('isPresentToday').get(function() {
  const today = new Date();
  const recordDate = new Date(this.date);
  return recordDate.toDateString() === today.toDateString() && this.punchIn;
});

// Static method to find attendance by employee
attendanceSchema.statics.findByEmployee = function(employeeId: string) {
  return this.find({ employeeId }).populate('employeeId').sort({ date: -1 });
};

// Static method to find attendance by date range
attendanceSchema.statics.findByDateRange = function(startDate: Date, endDate: Date) {
  return this.find({
    date: { $gte: startDate, $lte: endDate }
  }).populate('employeeId').sort({ date: -1 });
};

// Static method to find today's attendance
attendanceSchema.statics.findTodayAttendance = function() {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  
  return this.find({
    date: { $gte: startOfDay, $lt: endOfDay }
  }).populate('employeeId');
};

// Static method to find active employees (punched in but not out)
attendanceSchema.statics.findActiveEmployees = function() {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  
  return this.find({
    date: { $gte: startOfDay, $lt: endOfDay },
    punchIn: { $exists: true, $ne: null },
    punchOut: { $exists: false }
  }).populate('employeeId');
};

// Static method to punch in
attendanceSchema.statics.punchIn = async function(employeeId: string, location?: any) {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  const existingRecord = await this.findOne({
    employeeId,
    date: startOfDay
  });
  
  if (existingRecord && existingRecord.punchIn) {
    throw new Error('Employee has already punched in today');
  }
  
  const attendanceData = {
    employeeId,
    date: startOfDay,
    punchIn: new Date(),
    status: AttendanceStatus.PUNCH_IN,
    location: location || undefined
  };
  
  if (existingRecord) {
    existingRecord.punchIn = attendanceData.punchIn;
    existingRecord.status = AttendanceStatus.PUNCH_IN;
    existingRecord.location = attendanceData.location;
    return await existingRecord.save();
  }
  
  return await this.create(attendanceData);
};

// Static method to punch out
attendanceSchema.statics.punchOut = async function(employeeId: string, location?: any) {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  const existingRecord = await this.findOne({
    employeeId,
    date: startOfDay
  });
  
  if (!existingRecord || !existingRecord.punchIn) {
    throw new Error('Employee must punch in first');
  }
  
  if (existingRecord.punchOut) {
    throw new Error('Employee has already punched out today');
  }
  
  const punchOutTime = new Date();
  const totalHours = (punchOutTime.getTime() - existingRecord.punchIn.getTime()) / (1000 * 60 * 60);
  
  existingRecord.punchOut = punchOutTime;
  existingRecord.status = AttendanceStatus.PUNCH_OUT;
  existingRecord.totalHours = Math.round(totalHours * 100) / 100; // Round to 2 decimal places
  
  if (location) {
    existingRecord.location = location;
  }
  
  return await existingRecord.save();
};

// Pre-save middleware to calculate total hours
attendanceSchema.pre('save', function(next) {
  if (this.punchIn && this.punchOut) {
    const duration = this.punchOut.getTime() - this.punchIn.getTime();
    this.totalHours = Math.round((duration / (1000 * 60 * 60)) * 100) / 100;
  }
  next();
});

// Ensure virtual fields are serialized
attendanceSchema.set('toJSON', { virtuals: true });

// Create and export the model
const Attendance: Model<IAttendance> = mongoose.model<IAttendance>('Attendance', attendanceSchema);

export default Attendance; 