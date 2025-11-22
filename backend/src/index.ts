import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import connectToDatabase from "./config/db";
import { APP_ORIGIN, NODE_ENV, PORT } from "./constants/env";
import errorHandler from "./middleware/errorHandler";
import cathErrors from "./utils/catchErrors";
import { OK } from "./constants/http";
import authRoutes from "./routes/auth.route";
import authenticate from "./middleware/authenticate";
import userRoutes from "./routes/user.route";
import sessionRoutes from "./routes/session.route";
import applicationRoutes from "./routes/application.route";
import notificationRoutes from "./routes/notification.route";
import requirementsRoutes from "./routes/requirements.route";
import userDataRoutes from "./routes/userdata.route";
import officeProfileRoutes from "./routes/officeProfile.route";
import auditLogRoutes from "./routes/auditLog.route";
import workflowRoutes from "./routes/workflow.route";
import traineeRoutes from "./routes/trainee.route";
import dtrRoutes from "./routes/dtr.route";
import leaveRoutes from "./routes/leave.route";
import scholarRequestRoutes from "./routes/scholarRequest.route";
import dashboardRoutes from "./routes/dashboard.route";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let allowedOrigins = APP_ORIGIN?.split(",") || [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "https://sasm.onrender.com", // keep only if still used for backend
  "https://sasm.site",
  "https://www.sasm.site",
];

// Always ensure https://www.sasm.site is included
if (!allowedOrigins.includes("https://www.sasm.site")) {
  allowedOrigins.push("https://www.sasm.site");
}

console.log("APP_ORIGIN from env:", APP_ORIGIN);
console.log("Allowed CORS origins:", allowedOrigins);

app.use(
  cors({
    origin: function (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      }
      // Allow all Vercel preview and production deployments
      else if (
        origin.includes(".vercel.app") ||
        origin.includes("fosterkelvins-projects.vercel.app")
      ) {
        console.log("CORS allowed Vercel origin:", origin);
        callback(null, true);
      } else {
        console.log("CORS blocked origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(cookieParser());

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (_req, res, next) => {
  res.status(OK).json({
    status: "healthy",
  });
});

// Auth Routes
app.use("/auth", authRoutes);

// Protected Routes
app.use("/user", authenticate, userRoutes);
app.use("/users", authenticate, userRoutes); // For getting multiple users (e.g., by role)
app.use("/userdata", authenticate, userDataRoutes);
app.use("/sessions", authenticate, sessionRoutes);
app.use("/applications", applicationRoutes);
app.use("/notifications", authenticate, notificationRoutes);
// Requirements submissions (students upload requirements)
app.use("/requirements", requirementsRoutes);
// Office profile management routes (Netflix-style profiles)
app.use("/office/profiles", authenticate, officeProfileRoutes);
// Office audit logs
app.use("/office/audit-logs", authenticate, auditLogRoutes);
// Application workflow routes (psychometric test, interview, trainee management)
app.use("/workflow", workflowRoutes);
// Trainee deployment and management
app.use("/trainees", authenticate, traineeRoutes);
// Scholar management (accepted students) - separate from trainees
app.use("/scholars", authenticate, traineeRoutes);
// DTR (Daily Time Record) management
app.use("/dtr", dtrRoutes);
// Leave requests (students submit; office/HR review)
app.use("/leave", leaveRoutes);
// Leave management
app.use("/leave", leaveRoutes);
// Scholar requests (office staff request scholars; HR reviews)
app.use("/scholar-requests", scholarRequestRoutes);
// Dashboard statistics
app.use("/dashboard", dashboardRoutes);

app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT} in ${NODE_ENV} environment.`);
  await connectToDatabase();
});
