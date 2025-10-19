import mongoose from "mongoose";

const bankAccountSchema = new mongoose.Schema({
  accountType: {
    type: String,
    enum: ["VAT", "NON_VAT"],
    required: true,
    unique: true,
  },
  bankName: {
    type: String,
    required: true,
  },
  accountHolderName: {
    type: String,
    required: true,
  },
  accountNumber: {
    type: String,
    required: true,
  },
  branchCode: {
    type: String,
  },
});

export const BankAccount  =  mongoose.model("BankAccount", bankAccountSchema);
