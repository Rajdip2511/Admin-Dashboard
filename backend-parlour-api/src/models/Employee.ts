import mongoose, { Schema, Model } from 'mongoose';
import { IEmployee } from '@/types';

const employeeSchema = new Schema<IEmployee>({
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^EMP\d{4}$/, 'Employee ID must be in format EMP0001']
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^\+?[\d\s-()]{10,}$/, 'Please provide a valid phone number']
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    trim: true,
    maxlength: [100, 'Position cannot exceed 100 characters']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
    maxlength: [100, 'Department cannot exceed 100 characters']
  },
  hireDate: {
    type: Date,
    required: [true, 'Hire date is required'],
    default: Date.now
  },
  salary: {
    type: Number,
    required: [true, 'Salary is required'],
    min: [0, 'Salary cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profileImage: {
    type: String,
    default: null
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true,
      maxlength: [200, 'Street address cannot exceed 200 characters']
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [100, 'City cannot exceed 100 characters']
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      maxlength: [50, 'State cannot exceed 50 characters']
    },
    zipCode: {
      type: String,
      required: [true, 'ZIP code is required'],
      trim: true,
      match: [/^\d{5}(-\d{4})?$/, 'Please provide a valid ZIP code']
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      maxlength: [50, 'Country cannot exceed 50 characters'],
      default: 'United States'
    }
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
employeeSchema.index({ employeeId: 1 });
employeeSchema.index({ email: 1 });
employeeSchema.index({ department: 1 });
employeeSchema.index({ position: 1 });
employeeSchema.index({ isActive: 1 });
employeeSchema.index({ hireDate: 1 });

// Virtual for full name
employeeSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for full address
employeeSchema.virtual('fullAddress').get(function() {
  const { street, city, state, zipCode, country } = this.address;
  return `${street}, ${city}, ${state} ${zipCode}, ${country}`;
});

// Static method to find active employees
employeeSchema.statics.findActiveEmployees = function() {
  return this.find({ isActive: true });
};

// Static method to find employees by department
employeeSchema.statics.findByDepartment = function(department: string) {
  return this.find({ department: department, isActive: true });
};

// Static method to find employees by position
employeeSchema.statics.findByPosition = function(position: string) {
  return this.find({ position: position, isActive: true });
};

// Static method to generate next employee ID
employeeSchema.statics.generateNextEmployeeId = async function(): Promise<string> {
  const lastEmployee = await this.findOne({}, {}, { sort: { employeeId: -1 } });
  
  if (!lastEmployee) {
    return 'EMP0001';
  }

  const lastIdNumber = parseInt(lastEmployee.employeeId.replace('EMP', ''));
  const nextIdNumber = lastIdNumber + 1;
  
  return `EMP${nextIdNumber.toString().padStart(4, '0')}`;
};

// Pre-save middleware to auto-generate employee ID
employeeSchema.pre('save', async function(next) {
  if (!this.isNew) return next();

  try {
    if (!this.employeeId) {
      this.employeeId = await (this.constructor as any).generateNextEmployeeId();
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Ensure virtual fields are serialized
employeeSchema.set('toJSON', { virtuals: true });

// Create and export the model
const Employee: Model<IEmployee> = mongoose.model<IEmployee>('Employee', employeeSchema);

export default Employee; 