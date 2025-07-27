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

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: APP_ORIGIN,
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
app.use("/sessions", authenticate, sessionRoutes);
app.use("/applications", applicationRoutes);
app.use("/notifications", authenticate, notificationRoutes);

app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT} in ${NODE_ENV} environment.`);
  await connectToDatabase();
});
