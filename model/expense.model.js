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
    invoiceNumber: {
      type: String,
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
      type: String,
      enum: [
        "Office Supplies",
        "Maintenance",
        "Utilities",
        "Travel",
        "Marketing",
        "Equipment",
        "Miscellaneous",
      ],
      default: "Miscellaneous",
    },

    paymentMethod: {
      type: String,
      enum: ["Cash", "Bank Transfer", "Card", "Cheque", "Other"],
      default: "Cash",
    },
    paidTo: {
      type: String,
      trim: true,
      default: "",
      comment: "Person or company to whom payment was made",
    },

    
    receiptUrl: {
      type: String,
      default: "",
      comment: "Optional URL if image or document is uploaded",
    },

    
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
