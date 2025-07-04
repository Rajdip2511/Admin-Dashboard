import { Schema, model } from 'mongoose';
import { IEmployee, IEmployeeModel } from '../types';

const employeeSchema = new Schema<IEmployee>({
  employeeId: { type: String, required: true, unique: true, trim: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  position: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
  hireDate: { type: Date, required: true },
  salary: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  profileImage: { type: String },
}, { timestamps: true });

employeeSchema.statics.findActiveEmployees = function () {
  return this.find({ isActive: true });
};

const Employee = model<IEmployee, IEmployeeModel>('Employee', employeeSchema);

export default Employee; 