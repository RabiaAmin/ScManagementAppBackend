// addExpense , updateExpense , deleteExpense , getAllExpenseByMonth
import { Expense } from "../model/expense.model.js";
import { catchAsyncErrors } from "../middleware/CatchAsynErrors.js";
import ErrorHandler from "../middleware/Error.js";
import { getMonthlyStatsOfExpense } from "../utils/GetMonthlyStates.js";
import { BookTransaction } from "../model/book_Keeping.model.js";

export const addExpense = catchAsyncErrors(async (req, res, next) => {
  const {
    vendorName,
    invoiceNo,
    amount,
    vatAmount,
    totalAmount,
    category,
    date,
    isVatApplicable,
    paymentMethod,
    notes,
  } = req.body;

  if (!vendorName || !invoiceNo || !amount || !totalAmount || !date) {
    return next(new ErrorHandler("Please enter all required fields", 400));
  }

  const expense = await Expense.create({
    vendorName,
    invoiceNo,
    amount,
    vatAmount,
    totalAmount,
    paymentMethod,
    category,
    date,
    isVatApplicable,
    notes,
  });

  try {
    await BookTransaction.create({
      transactionType: "EXPENSE",
      sourceType: "EXPENSE",
      relatedExpense: expense._id,
      category: expense.category,
      amount: expense.amount,
      tax: expense.vatAmount || 0,
      total: expense.totalAmount,
      isVatApplicable: expense.isVatApplicable,
      paymentMethod: expense.paymentMethod || "CASH",
      description: expense.notes,
      date: expense.date,
      user: req.user._id,
    });
  } catch (err) {
    console.error("BookTransaction creation failed:", err.message);
  }
  res.status(201).json({
    success: true,
    message: "Expense added successfully",
    expense,
  });
});


export const updateExpense = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const expense = await Expense.findById(id);

  if (!expense) return next(new ErrorHandler("Expense not found", 404));

  const {
    vendorName,
    invoiceNo,
    amount,
    vatAmount,
    totalAmount,
    category,
    date,
    isVatApplicable,
    paymentMethod,
    notes,
  } = req.body;

  expense.vendorName = vendorName || expense.vendorName;
  expense.invoiceNo = invoiceNo || expense.invoiceNo;
  expense.amount = amount || expense.amount;
  expense.vatAmount = vatAmount ?? expense.vatAmount;
  expense.totalAmount = totalAmount || expense.totalAmount;
  expense.category = category || expense.category;
  expense.notes = notes || expense.notes;
  expense.date = date || expense.date;
  expense.paymentMethod = paymentMethod || expense.paymentMethod;
  expense.isVatApplicable = isVatApplicable ?? expense.isVatApplicable;

  await expense.save();

  await BookTransaction.findOneAndUpdate(
  { relatedExpense: expense._id },
  { amount: expense.amount, tax: expense.vatAmount, total: expense.totalAmount, date: expense.date },
  { new: true }
);
  res.status(200).json({
    success: true,
    message: "Expense updated successfully",
    expense,
  });
});

export const deleteExpense = catchAsyncErrors(async (req, res, next) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) {
    return next(new ErrorHandler("Expense not found", 404));
  }

  await expense.deleteOne();
  await BookTransaction.deleteOne({ relatedExpense: expense._id });
  res.status(200).json({
    success: true,
    message: "Expense deleted successfully",
  });
});

export const getAllExpenseByMonth = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { startDate, endDate } = req.query;

  // Validate date inputs
  if (!startDate || !endDate) {
    return next(new ErrorHandler("Please provide startDate and endDate", 400));
  }

  // Convert strings to Date objects
  const start = new Date(startDate);
  const end = new Date(endDate);

  const Expenses = await Expense.aggregate([
    {
      $match: {
        date: { $gte: new Date(start), $lte: new Date(end) },
      },
    },
    { $sort: { date: 1 } },
  ]);

  const expenseStats = await getMonthlyStatsOfExpense(start, end);

  res.status(200).json({
    success: true,
    Expenses,
    expenseStats,
  });
});

export const getSingleExpense = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const expense = await Expense.findById(id);
  if (!expense) {
    return next(new ErrorHandler("Expense not found", 404));
  }
  res.status(200).json({
    success: true,
    expense,
  });
});
