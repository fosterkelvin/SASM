import AuditLogModel from "../models/auditLog.model";

export const createAuditLog = async (params: {
  userID: string;
  profileID?: any;
  actorName: string;
  action: string;
  module: string;
  details?: Record<string, any>;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
  targetID?: any;
}) => {
  try {
    await AuditLogModel.create({
      userID: params.userID,
      profileID: params.profileID,
      actorName: params.actorName,
      action: params.action,
      module: params.module,
      details: params.details || {},
      oldValue: params.oldValue,
      newValue: params.newValue,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      targetID: params.targetID,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
    // Don't throw - audit logging should not break the main flow
  }
};

export const getAuditLogs = async (params: {
  accountID: string;
  profileID?: string;
  module?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  skip?: number;
}) => {
  const query: any = { userID: params.accountID };

  if (params.profileID) {
    query.profileID = params.profileID;
  }

  if (params.module) {
    query.module = params.module;
  }

  if (params.action) {
    query.action = params.action;
  }

  if (params.startDate || params.endDate) {
    query.timestamp = {};
    if (params.startDate) {
      query.timestamp.$gte = new Date(params.startDate);
    }
    if (params.endDate) {
      query.timestamp.$lte = new Date(params.endDate);
    }
  }

  const limit = params.limit || 100;
  const skip = params.skip || 0;

  const [logs, total] = await Promise.all([
    AuditLogModel.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)
      .lean(),
    AuditLogModel.countDocuments(query),
  ]);

  return { logs, total };
};
