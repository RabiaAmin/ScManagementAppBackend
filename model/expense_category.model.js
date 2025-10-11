import mongoose from "mongoose";
const categorySchema = new mongoose.Schema({
  name: String,
  description: String,
  isDefault: { type: Boolean, default: false },
});

export const ExpenseCategory = mongoose.model("ExpenseCategory", categorySchema);