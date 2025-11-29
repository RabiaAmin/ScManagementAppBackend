import { BookTransaction } from "../model/book_Keeping.model.js";


export const getPaginatedTransaction = async (page, limit) => {
  const totalRecords = await BookTransaction.countDocuments();
  const BookTransaction = await BookTransaction.find()
    .sort({ _id: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    BookTransaction,
    totalRecords,
    totalPages: Math.ceil(totalRecords / limit),
    page,
  };
};
