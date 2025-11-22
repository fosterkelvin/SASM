import { Router } from "express";
import {
  getOrCreateDTR,
  getMyDTRs,
  getDTRById,
  updateDTR,
  updateEntry,
  submitDTR,
  approveDTR,
  rejectDTR,
  getSubmittedDTRs,
  getDTRStats,
  deleteDTR,
  confirmDTREntry,
  unconfirmDTREntry,
  confirmAllDTREntries,
  getUserDTRForOffice,
  updateUserEntryForOffice,
  markDayAsExcused,
  markDayAsAbsent,
  sendDTRInquiry,
  getScheduleForDate,
  bulkEmergencyCancelForDate,
} from "../controllers/dtr.controller";
import authenticate from "../middleware/authenticate";

const dtrRoutes = Router();

// Protected routes - require authentication
dtrRoutes.use(authenticate);

// Student routes
dtrRoutes.post("/get-or-create", getOrCreateDTR);
dtrRoutes.get("/my-dtrs", getMyDTRs);
dtrRoutes.get("/stats", getDTRStats);
dtrRoutes.get("/schedule/:year/:month/:day", getScheduleForDate);
dtrRoutes.get("/:id", getDTRById);
dtrRoutes.put("/update", updateDTR);
dtrRoutes.put("/update-entry", updateEntry);
dtrRoutes.post("/submit", submitDTR);
dtrRoutes.delete("/:id", deleteDTR);

// Office routes
dtrRoutes.get("/office/submitted", getSubmittedDTRs);
dtrRoutes.post("/office/approve", approveDTR);
dtrRoutes.post("/office/reject", rejectDTR);
dtrRoutes.post("/office/confirm-entry", confirmDTREntry);
dtrRoutes.post("/office/unconfirm-entry", unconfirmDTREntry);
dtrRoutes.post("/office/confirm-all-entries", confirmAllDTREntries);
dtrRoutes.post("/office/get-user-dtr", getUserDTRForOffice);
dtrRoutes.put("/office/update-user-entry", updateUserEntryForOffice);
dtrRoutes.post("/office/mark-day-excused", markDayAsExcused);
dtrRoutes.post("/office/mark-day-absent", markDayAsAbsent);
dtrRoutes.post("/office/send-inquiry", sendDTRInquiry);

// HR routes
dtrRoutes.post("/hr/bulk-emergency-cancel", bulkEmergencyCancelForDate);

export default dtrRoutes;
