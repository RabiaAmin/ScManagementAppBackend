import { Invoice } from "../model/invoice.model.js"; // adjust path if needed

export const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();

  // Find the last invoice of the current year
  const lastInvoice = await Invoice.findOne({ invoiceNumber: { $regex: `INV-${year}-` } })
    .sort({ invoiceNumber: -1 })
    .exec();

  let nextNumber = "001";

  if (lastInvoice) {
    const lastNumber = parseInt(lastInvoice.invoiceNumber.split("-")[2], 10);
    nextNumber = (lastNumber + 1).toString().padStart(3, "0");
  }

  return `INV-${year}-${nextNumber}`;
};
