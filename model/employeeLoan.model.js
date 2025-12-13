import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    method: {
      type: String,
      enum: ["CASH", "SALARY_DEDUCTION", "BANK"],
      default: "CASH",
    },
    note: String,
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const employeeLoanSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    loanAmount: {
      type: Number,
      required: true,
    },

    repaymentType: {
      type: String,
      enum: ["INSTALLMENT", "MANUAL"],
      required: true,
    },

    emiAmount: {
      type: Number,
    },

    totalInstallments: {
      type: Number,
    },

    paidInstallments: {
      type: Number,
      default: 0,
    },

    paidAmount: {
      type: Number,
      default: 0,
    },

    remainingAmount: {
      type: Number,
    },

    payments: [paymentSchema],

    autoDeduct: {
      type: Boolean,
      default: false, // for future salary system
    },

    startDate: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["Active", "Completed"],
      default: "Active",
    },

    remarks: String,

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Auto calculate remaining amount
employeeLoanSchema.pre("save", function (next) {
  this.remainingAmount = this.loanAmount - this.paidAmount;
  if (this.remainingAmount <= 0) {
    this.remainingAmount = 0;
    this.status = "Completed";
  }
  next();
});

export const EmployeeLoan = mongoose.model(
  "EmployeeLoan",
  employeeLoanSchema
);
