import { Schema, model, Document } from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserRole } from '../types';

export interface IUserMethods {
  generateAuthToken(): string;
  comparePassword(password: string): Promise<boolean>;
}

export type UserDocument = Document & {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
} & IUserMethods;

const UserSchema = new Schema<UserDocument, {}, IUserMethods>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  firstName: { type: String },
  lastName: { type: String },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.ADMIN,
  },
}, {
  timestamps: true,
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.generateAuthToken = function (): string {
  const payload = {
    user: {
      id: this._id,
      role: this.role,
    },
  };
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-parlour-dashboard-2024',
    { expiresIn: '1h' }
  );
};

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(password, this.password);
};

export default model<UserDocument>('User', UserSchema); 