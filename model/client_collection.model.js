import mongoose from "mongoose";
const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  vatNumber: { type: String },
  vatApplicable: {
    type: Boolean,
    default: true, // or false, depending on your common case
  },
  vatRate: {
    type: Number,
    default: 15, // in percentage
  },
  registrationNumber: { type: String },
  address: { type: String },
  phone: { type: String },
  fax: { type: String },
  email: { type: String },
  telphone: { type: String },
 
});

export const ClientCollection = mongoose.model("Client", clientSchema);