import mongoose from "mongoose";
const categorySchema = new mongoose.Schema({
  name: String,
  description: String,
  type: {
    type: String,
    enum: ["COGS", "EXPENSE"], 
    required: true,
  },
  isDefault: { type: Boolean, default: false },
});

export const ExpenseCategory = mongoose.model("ExpenseCategory", categorySchema);