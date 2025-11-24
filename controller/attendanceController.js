import { catchAsyncErrors } from "../middleware/CatchAsynErrors.js";
import ErrorHandler from "../middleware/Error.js";
import {Attendance} from "../model/attendance.model.js";

// Handles attendance pushed by UL-FP-F30 device
export const pushAttendance = catchAsyncErrors(async (req, res, next) => {
  console.log("Raw device data:", req.body);

  const { uid, empid, time } = req.body;

  if (!empid || !time) {
    return next(new ErrorHandler("empid and time are required", 400));
  }

  const attendance = await Attendance.create({
    workerId: empid,
    scannedAt: new Date(time),
    type: "SCAN",
    deviceId: "UL-FP-F30",
    raw: req.body
  });

  res.status(201).json({
    success: true,
    message: "Attendance recorded",
    attendance
  });
});
