import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    vendorName: {
      type: String,
      required: true,
      trim: true,
    },
    invoiceNo: {
      type: String,
      unique: true,
      trim: true,
      default: "",
    },


    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    vatAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    
    isVatApplicable: {
      type: Boolean,
      default: true,
      comment: "Some clients/vendors do not charge VAT",
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExpenseCategory",
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["Cash", "Bank Transfer", "Card", "Cheque", "Other"],
      default: "Cash",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export const Expense = mongoose.model("Expense", expenseSchema);
