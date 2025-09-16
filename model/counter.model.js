import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., "invoice"
  value: { type: Number, required: true, default: 0 }    // current sequence
});

export const Counter = mongoose.model("Counter", counterSchema);