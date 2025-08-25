const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  vatNumber: { type: String },
  registrationNumber: { type: String },
  address: { type: String },
  phone: { type: String },
  fax: { type: String },
  email: { type: String },
});

export const ClientCollection = mongoose.model("Client", clientSchema);