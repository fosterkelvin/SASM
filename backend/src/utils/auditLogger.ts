import AuditLogModel from "../models/auditLog.model";
import mongoose from "mongoose";

interface AuditLogParams {
  userID: string | mongoose.Types.ObjectId;
  subUserID?: string | mongoose.Types.ObjectId | null;
  actorName: string;
  actorEmail: string;
  action: string;
  module: string;
  targetType?: string;
  targetID?: string | mongoose.Types.ObjectId;
  targetName?: string;
  details?: Record<string, any>;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
}

export const createAuditLog = async (params: AuditLogParams) => {
  try {
    const auditLog = await AuditLogModel.create({
      userID: params.userID,
      subUserID: params.subUserID || undefined,
      actorName: params.actorName,
      actorEmail: params.actorEmail,
      action: params.action,
      module: params.module,
      targetType: params.targetType,
      targetID: params.targetID,
      targetName: params.targetName,
      details: params.details || {},
      oldValue: params.oldValue,
      newValue: params.newValue,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      timestamp: new Date(),
    });

    return auditLog;
  } catch (error) {
    console.error("Error creating audit log:", error);
    // Don't throw error to prevent blocking main operations
    return null;
  }
};

export const getAuditLogs = async (filters: {
  userID?: string | mongoose.Types.ObjectId;
  subUserID?: string | mongoose.Types.ObjectId;
  module?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  skip?: number;
}) => {
  const query: any = {};

  if (filters.userID) {
    query.userID = filters.userID;
  }

  if (filters.subUserID) {
    query.subUserID = filters.subUserID;
  }

  if (filters.module) {
    query.module = filters.module;
  }

  if (filters.action) {
    query.action = filters.action;
  }

  if (filters.startDate || filters.endDate) {
    query.timestamp = {};
    if (filters.startDate) {
      query.timestamp.$gte = filters.startDate;
    }
    if (filters.endDate) {
      query.timestamp.$lte = filters.endDate;
    }
  }

  const logs = await AuditLogModel.find(query)
    .sort({ timestamp: -1 })
    .limit(filters.limit || 100)
    .skip(filters.skip || 0)
    .populate("subUserID", "subUserName subUserEmail")
    .lean();

  const total = await AuditLogModel.countDocuments(query);

  return {
    logs,
    total,
    limit: filters.limit || 100,
    skip: filters.skip || 0,
  };
};
