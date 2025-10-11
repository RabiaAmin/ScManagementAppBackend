// addExpense , updateExpense , deleteExpense , getAllExpenseByMonth
import {Expense} from "../model/expense.model.js";
import { catchAsyncErrors } from "../middleware/CatchAsynErrors.js";
import ErrorHandler from "../middleware/Error.js";

export const addExpense = catchAsyncErrors(async (req, res, next) => {
    const { companyName, invoiceNo, amount, vatAmount, totalAmount, category, description, date, isVatApplicable } = req.body;

  if (!companyName || !invoiceNo || !amount || !totalAmount || !date) {
    return next(new ErrorHandler("Please enter all required fields", 400));
  }

  const expense = await Expense.create({
    companyName,
    invoiceNo,
    amount,
    vatAmount,
    totalAmount,
    category,
    description,
    date,
    isVatApplicable,
    user: req.user._id,
  });
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
  if (expense.user.toString() !== req.user._id.toString())
    return next(new ErrorHandler("You are not authorized to update this expense", 401));

  const { companyName, invoiceNo, amount, vatAmount, totalAmount, category, description, date, isVatApplicable } = req.body;

  expense.companyName = companyName || expense.companyName;
  expense.invoiceNo = invoiceNo || expense.invoiceNo;
  expense.amount = amount || expense.amount;
  expense.vatAmount = vatAmount ?? expense.vatAmount;
  expense.totalAmount = totalAmount || expense.totalAmount;
  expense.category = category || expense.category;
  expense.description = description || expense.description;
  expense.date = date || expense.date;
  expense.isVatApplicable = isVatApplicable ?? expense.isVatApplicable;

  await expense.save();
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
    if (expense.user.toString() !== req.user._id.toString()) {
        return next(new ErrorHandler("You are not authorized to delete this expense", 401));
    }   
    await expense.deleteOne();
    res.status(200).json({
        success: true,
        message: "Expense deleted successfully",
    });
}); 

export const getAllExpenseByMonth = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params; // user ID
  const { startDate, endDate } = req.query; // frontend will send ?startDate=2025-09-01&endDate=2025-09-30

  // Validate date inputs
  if (!startDate || !endDate) {
    return next(new ErrorHandler("Please provide startDate and endDate", 400));
  }

  // Convert strings to Date objects
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Add one day to end date to include the last day fully
  end.setHours(23, 59, 59, 999);

  const expenses = await Expense.find({
    user: id,
    date: { $gte: start, $lte: end },
  }).sort({ date: -1 });

  res.status(200).json({
    success: true,
    count: expenses.length,
    expenses,
  });
});

