import mongoose from "mongoose";

const bookTransactionSchema = new mongoose.Schema({

  transactionType: {
    type: String,
    enum: ["INCOME", "EXPENSE"],
    required: true,
  },


  sourceType: {
    type: String,
    enum: ["INVOICE", "EXPENSE", "MANUAL"],
    required: true,
  },

  relatedInvoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Invoice",
  },
  relatedExpense: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Expense",
  },

  clientName: {
  type: String,
  
  },
  suplierName: {
    type: String,},


  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
  },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ExpenseCategory",
  },

  incomeCategory: {
  type: String,
  enum: ["Finished Garments", "CMT Services", "Other Income",""],
  },


  amount: {
    type: Number,
    required: true,
  },
  tax: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
  },

  paymentMethod: {
    type: String,
    enum: ["Cash", "Bank Transfer", "Card", "Cheque", "Other"],
    required: true,
  },

  description: String,

  date: {
    type: Date,
    required: true,
  },

  isVatApplicable: {
    type: Boolean,
    default: false,
  },



  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

export const BookTransaction = mongoose.model('BookTransaction',bookTransactionSchema);