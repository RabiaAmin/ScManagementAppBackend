// addExpense , updateExpense , deleteExpense , getAllExpenseByMonth
import {Expense} from "../model/expense.model.js";
import { catchAsyncErrors } from "../middleware/CatchAsynErrors.js";
import ErrorHandler from "../middleware/Error.js";

export const addExpense = catchAsyncErrors(async (req, res, next) => {
    const { vendorName, invoiceNo, amount, vatAmount, totalAmount, category, date, isVatApplicable ,paymentMethod ,notes} = req.body;

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
    notes
   
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


  const {  vendorName, invoiceNo, amount, vatAmount, totalAmount, category,  date, isVatApplicable ,paymentMethod ,notes } = req.body;

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



  const Expenses = await Expense.aggregate([
     {
      $match: {
        createdAt: { $gte: new Date(start), $lte: new Date(end) }
      },
    },
    { $sort: { _id: 1 } },
  ])

  res.status(200).json({
    success: true,
    Expenses,
  });
});


