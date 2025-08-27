import mongoose from "mongoose";
const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  date: { type: Date, default: Date.now },
  fromBusiness: { type: mongoose.Schema.Types.ObjectId, ref: "Business" },
  toClient: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
  items: [
    {
      quantity: Number,
      description: String,
      unitPrice: Number,
      amount: Number
    }
  ],
  subTotal: { type: Number, required: true },
  tax: { type: Number },
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ["Pending", "Sent", "Paid"], 
    default: "Pending" 
  },
});

export const Invoice = mongoose.model("Invoice", invoiceSchema);
