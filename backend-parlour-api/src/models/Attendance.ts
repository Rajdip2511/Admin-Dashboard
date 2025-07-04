import { Schema, model } from 'mongoose';
import { IAttendance, IAttendanceModel } from '../types';

const attendanceSchema = new Schema<IAttendance>({
  employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  punchInTime: { type: Date, required: true },
  punchOutTime: { type: Date },
}, { timestamps: true });

attendanceSchema.statics.findTodaysAttendance = function () {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return this.find({ punchInTime: { $gte: start, $lt: end } });
};

const Attendance = model<IAttendance, IAttendanceModel>('Attendance', attendanceSchema);

export default Attendance; 