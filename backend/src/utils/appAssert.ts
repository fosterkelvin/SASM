import assert from "node:assert";
import AppError from "./appError";
import { HttpStatusCode } from "../constants/http";
import AppErrorCode from "../constants/appErrorCode";

type AppAssert = (
    condtion: any,
    httpStatusCode: HttpStatusCode,
    message: string,
    appErrorCode?: AppErrorCode
) => asserts condtion;

/**
 * Assert a condition and throws an AppError if the condition is false.
 */

const appAssert: AppAssert = (
    condition,
    httpStatusCode,
    message,
    appErrorCode
) => assert(condition, new AppError(httpStatusCode, message, appErrorCode));

export default appAssert;