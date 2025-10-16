import mongoose from "mongoose";
import { compareValue, hashValue } from "../utils/bcrypt";

export interface UserDocument extends mongoose.Document {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role: "student" | "hr" | "office";
  status: string;
  verified: boolean;
  pendingEmail?: string;
  office?: string;
  officeName?: string; // For office users: "OSAS", "OSA", etc.
  createdAt: Date;
  updatedAt: Date;
  comparePassword(val: string): Promise<boolean>;
  omitPassword(): Pick<
    UserDocument,
    | "_id"
    | "firstname"
    | "lastname"
    | "email"
    | "role"
    | "status"
    | "verified"
    | "pendingEmail"
    | "office"
    | "officeName"
    | "createdAt"
    | "updatedAt"
  >;
}

const userSchema = new mongoose.Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "hr", "office"],
      default: "student",
      required: true,
    },
    status: {
      type: String,
      default: "applicant",
      required: true,
    },
    pendingEmail: {
      type: String,
      required: false,
    },
    office: {
      type: String,
      required: false,
    },
    officeName: {
      type: String,
      required: false,
      default: "", // Shows field in MongoDB even if empty
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await hashValue(this.password);
  next();
});

userSchema.methods.comparePassword = async function (val: string) {
  return compareValue(val, this.password);
};

userSchema.methods.omitPassword = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const UserModel = mongoose.model<UserDocument>("User", userSchema);
export default UserModel;
