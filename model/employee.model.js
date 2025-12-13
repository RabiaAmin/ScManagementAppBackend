import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String },
  cnic: { type: String },
  department: {
    type: String,
    enum: ["CLEANER","CUTTER","STITCHER","QA","IT","FINANCE","OTHER"],
    default: "OTHER"
  },
  payType: {
    type: String,
    enum: ["TIME_BASED","PIECE_RATE","FIXED"],
    required: true
  },
  employmentType: { type: String, enum: ["PERMANENT","TEMP"], default: "PERMANENT" },

  // time-based
  hourlyRate: { type: Number, default: 0 },
  dailyRate: { type: Number, default: 0 },

  // piece-rate
  perPieceRate: { type: Number, default: 0 },

  // fixed
  monthlySalary: { type: Number, default: 0 },

  status: { type: String, enum: ["ACTIVE","LEFT"], default: "ACTIVE" },
  joinDate: { type: Date, default: Date.now },

  paymentMethod: { type: String, enum: ["CASH","BANK","CARD"], default: "CASH" },

  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

export const Employee = mongoose.model("Employee", employeeSchema);

