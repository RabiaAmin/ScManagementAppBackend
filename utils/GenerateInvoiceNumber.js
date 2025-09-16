import { Counter } from "../model/counter.model.js";

export const generateInvoiceNumber = async () => {
  const counter = await Counter.findOneAndUpdate(
    { name: "invoice" },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );

  return counter.value.toString();
};