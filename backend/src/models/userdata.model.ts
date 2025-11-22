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
  createdAt: Date;
  updatedAt: Date;
  getAge(): number | null;
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

const UserDataModel = mongoose.model<UserDataDocument>(
  "UserData",
  userDataSchema
);
export default UserDataModel;
