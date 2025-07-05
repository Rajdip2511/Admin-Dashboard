import { Schema, model } from 'mongoose';
import { IAttendance, IAttendanceModel } from '../types';

const AttendanceSchema = new Schema<IAttendance, IAttendanceModel>({
  employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  punchInTime: { type: Date, required: true },
  punchOutTime: { type: Date },
  date: { type: Date, required: true, index: true },
}, {
  timestamps: true
});

AttendanceSchema.statics.findTodaysAttendance = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  return this.find({
    date: {
      $gte: today,
      $lt: tomorrow,
    },
  });
};

AttendanceSchema.index({ employee: 1, date: 1 }, { unique: true });


export default model<IAttendance, IAttendanceModel>('Attendance', AttendanceSchema); 