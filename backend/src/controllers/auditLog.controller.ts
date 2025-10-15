import { Request, Response } from "express";
import { OK } from "../constants/http";
import catchErrors from "../utils/catchErrors";
import { getAuditLogs } from "../services/auditLog.service";
import appAssert from "../utils/appAssert";
import { UNAUTHORIZED } from "../constants/http";

export const getAuditLogsHandler = catchErrors(
  async (req: Request, res: Response) => {
    const accountID = req.userID;
    appAssert(accountID, UNAUTHORIZED, "Not authenticated");

    const {
      profileID,
      module,
      action,
      startDate,
      endDate,
      limit,
      skip,
    } = req.query;

    const result = await getAuditLogs({
      accountID,
      profileID: profileID as string | undefined,
      module: module as string | undefined,
      action: action as string | undefined,
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      skip: skip ? parseInt(skip as string) : undefined,
    });

    return res.status(OK).json(result);
  }
);
