import { Invoice } from "../model/invoice.model.js"; // adjust path if needed

export const generateInvoiceNumber = async () => {
  // Find the last invoice regardless of year
  const lastInvoice = await Invoice.findOne()
    .sort({ invoiceNumber: -1 }) // sort by invoiceNumber descending
    .exec();

  let nextNumber = 311; // starting point

  if (lastInvoice) {
    const lastNumber = parseInt(lastInvoice.invoiceNumber, 10);
    nextNumber = lastNumber + 1;
  }

  return nextNumber.toString();
};