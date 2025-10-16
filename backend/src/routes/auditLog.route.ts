import { Router } from "express";
import { getAuditLogsHandler } from "../controllers/auditLog.controller";

const auditLogRoutes = Router();

// GET /office/audit-logs - Get audit logs with filters
auditLogRoutes.get("/", getAuditLogsHandler);

export default auditLogRoutes;
