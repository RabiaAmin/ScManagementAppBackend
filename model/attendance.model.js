import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    workerId: {
      type: String,
      required: true,
    },

    scannedAt: {
      type: Date,
      required: true,
    },

    type: {
      type: String,
      enum: ["CHECK_IN", "CHECK_OUT", "SCAN"],
      default: "SCAN",
    },

    deviceId: {
      type: String,
      default: "UL-FP-F30",
    },

    raw: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

export const Attendance  =  mongoose.model("Attendance", attendanceSchema);
