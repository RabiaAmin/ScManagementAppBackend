import express from "express";
import { pushAttendance } from "../controller/attendanceController.js";

const router = express.Router();

// Endpoint for UL-FP-F30 device to push attendance
router.post("/push", pushAttendance);

export default router;