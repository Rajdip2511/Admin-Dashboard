import { Schema, model, Document } from 'mongoose';

export interface IAttendance extends Document {
  employee: Schema.Types.ObjectId;
  date: Date;
  punchIn: Date;
  punchOut?: Date;
}

const AttendanceSchema = new Schema<IAttendance>({
  employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  date: { type: Date, required: true, index: true },
  punchIn: { type: Date, required: true },
  punchOut: { type: Date },
}, {
  timestamps: true,
});

AttendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

export default model<IAttendance>('Attendance', AttendanceSchema); 