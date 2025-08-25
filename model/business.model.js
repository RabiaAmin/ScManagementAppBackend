const businessSchema = new mongoose.Schema({
  name: { type: String, required: true },   // Sanya Clothing
  vatNumber: { type: String },
  registrationNumber: { type: String },
  address: { type: String },
  phone: { type: String },
  fax: { type: String },
  email: { type: String },
});


export const BusinessInfo = mongoose.model('Business',businessSchema);