import mongoose from "mongoose";

export interface UserDataDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  gender?: string;
  birthdate?: Date;
  civilStatus?: string;
  phoneNumber?: string;
  address?: string;
  college?: string; // School/Department
  courseYear?: string; // Course & Year
  effectivityDate?: Date; // Effectivity date of scholarship when accepted
  serviceMonths?: number; // Total months in service (accumulated per semester)
  servicePeriods?: Array<{
    startDate: Date;
    endDate?: Date;
    months: number;
    scholarType: "student_assistant" | "student_marshal";
  }>; // Track individual service periods
  createdAt: Date;
  updatedAt: Date;
  getAge(): number | null;
  getServiceDuration(): { years: number; months: number };
}

const userDataSchema = new mongoose.Schema<UserDataDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", null],
      default: null,
    },
    birthdate: {
      type: Date,
      default: null,
    },
    civilStatus: {
      type: String,
      enum: ["single", "married", "divorced", "widowed", null],
      default: null,
    },
    phoneNumber: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      default: null,
    },
    college: {
      type: String,
      default: null,
    },
    courseYear: {
      type: String,
      default: null,
    },
    effectivityDate: {
      type: Date,
      default: null,
    },
    serviceMonths: {
      type: Number,
      default: 0,
    },
    servicePeriods: {
      type: [
        {
          startDate: { type: Date, required: true },
          endDate: { type: Date, default: null },
          months: { type: Number, default: 6 },
          scholarType: {
            type: String,
            enum: ["student_assistant", "student_marshal"],
            required: true,
          },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Method to calculate age from birthdate
userDataSchema.methods.getAge = function (): number | null {
  if (!this.birthdate) {
    return null;
  }

  const today = new Date();
  const birthDate = new Date(this.birthdate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  // Adjust age if birthday hasn't occurred yet this year
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

// Method to get service duration in years and months
userDataSchema.methods.getServiceDuration = function (): {
  years: number;
  months: number;
} {
  const totalMonths = this.serviceMonths || 0;
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  return { years, months };
};

const UserDataModel = mongoose.model<UserDataDocument>(
  "UserData",
  userDataSchema
);
export default UserDataModel;
