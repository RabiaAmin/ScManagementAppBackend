import mongoose from "mongoose";
const businessSchema = new mongoose.Schema({
  name: { type: String, required: true },   // Sanya Clothing
  vatNumber: { type: String },
  ckNumber: { type: String },
  address: { type: String },
  phone: { type: String },
  telPhone: { type: String },
  fax: { type: String },
  email: { type: String },
});


export const BusinessInfo = mongoose.model('Business',businessSchema);