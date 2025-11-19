
import ErrorHandler from "../middleware/Error.js";
import { catchAsyncErrors } from "../middleware/CatchAsynErrors.js";
import { BookTransaction } from "../model/book_Keeping.model.js";

export const addTransaction = catchAsyncErrors(async (req, res, next) => {
  const {
    transactionType,
    sourceType,
    clientName,
    category,
    incomeCategory,
    amount,
    tax,
    total,
    paymentMethod,
    description,
    date,
  } = req.body;

  if (!transactionType || !sourceType || !amount || !total || !paymentMethod || !date || !clientName) {
    return next(new ErrorHandler("Please fill all required fields", 400));
  }

  const transaction = await BookTransaction.create({
    transactionType,
    sourceType,
    clientName,
    category,
    incomeCategory,
    amount,
    tax,
    total,
    paymentMethod,
    description,
    date,
    user: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Transaction added successfully",
    transaction,
  });
});


export const updateTransaction = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const transaction = await BookTransaction.findById(id);
  if (!transaction) {
    return next(new ErrorHandler("Transaction not found", 404));
  }

  if (transaction.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("You are not authorized to update this transaction", 401));
  }

  const updatedData = req.body;

  const updatedTransaction = await BookTransaction.findByIdAndUpdate(id, updatedData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "Transaction updated successfully",
    transaction: updatedTransaction,
  });
});


export const deleteTransaction = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const transaction = await BookTransaction.findById(id);
  if (!transaction) {
    return next(new ErrorHandler("Transaction not found", 404));
  }

  if (transaction.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("You are not authorized to delete this transaction", 401));
  }

  await transaction.deleteOne();

  res.status(200).json({
    success: true,
    message: "Transaction deleted successfully",
  });
});

export const getTransactionsByDate = catchAsyncErrors(async (req, res, next) => {

  const { _id } = req.user;
  let { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);

    const formatLocalDate = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    startDate = formatLocalDate(start);
    endDate = formatLocalDate(end);
  }


  const transactions = await BookTransaction.find({
    user: _id,
    date: { $gte: new Date(startDate), $lte: new Date(endDate) },
  })
    .populate("clientId category relatedInvoice relatedExpense")
    .sort({ date: -1 });

  res.status(200).json({
    success: true,
    count: transactions.length,
    transactions,
  });
});

export const getSingleTransaction = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;  
  const transaction = await BookTransaction.findById(id)
    .populate("clientId category relatedInvoice relatedExpense");
  if (!transaction) {
    return next(new ErrorHandler("Transaction not found", 404));
  }
  res.status(200).json({
    success: true,
    transaction,
  });
});


export const getProfitLossReport = catchAsyncErrors(async (req, res, next) => {
  
  if (!req.user) {
    return next(new ErrorHandler("User not authenticated", 401));
  }

  let { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return next(new ErrorHandler("Start and End date are required", 400));
  }

  const transactions = await BookTransaction.find({
    user: req.user._id,
    date: { $gte: new Date(startDate), $lte: new Date(endDate) }
  }).populate("category");

  // ============================
  //      INITIAL STRUCTURE
  // ============================
  let report = {
    revenue: {
      finishedGarments: 0,
      cmtServices: 0,
      otherIncome: 0,
      total: 0,
    },

    cogs: {
      fabricTrims: 0,
      labor: 0,
      overheads: 0,
      packaging: 0,
      total: 0,
    },

    operating: {
      admin: 0,
      salesMarketing: 0,
      rentUtilities: 0,
      depreciation: 0,
      other: 0,
      total: 0,
    },

    nonOperating: {
      interestIncome: 0,
      interestExpense: 0,
      other: 0,
      total: 0,
    },

    grossProfit: 0,
    operatingProfit: 0,
    profitBeforeTax: 0,
    taxExpense: 0,
    netProfit: 0,
  };

  // ============================
  //      PROCESS TRANSACTIONS
  // ============================
  transactions.forEach(t => {
    let cat = t?.category?.name || "";
 
    let incomeCat = t?.incomeCategory || "";

    // --------------------
    //       INCOME
    // --------------------
    if (t.transactionType === "INCOME") {
      if (incomeCat === "Finished Garments") report.revenue.finishedGarments += t.total;
      else if (incomeCat === "CMT Services") report.revenue.cmtServices += t.total;
      else report.revenue.otherIncome += t.total;
    }

    // --------------------
    //       EXPENSES
    // --------------------
    else if (t.transactionType === "EXPENSE") {
      
      // ------------ COGS -------------
      if (cat === "Trims & Materials") report.cogs.fabricTrims += t.total;
      else if (cat === "Labor") report.cogs.labor += t.total;
      else if (cat === "Factory Overheads") report.cogs.overheads += t.total;
      else if (cat === "Packaging & Shipping") report.cogs.packaging += t.total;

      // ------ OPERATING EXPENSES ------
      else if (cat === "Administrative Expenses") report.operating.admin += t.total;
      else if (cat === "Sales & Marketing") report.operating.salesMarketing += t.total;
      else if (cat === "Rent & Utilities") report.operating.rentUtilities += t.total;
      else if (cat === "Depreciation & Machinery Maintenance") report.operating.depreciation += t.total;
      else if (cat === "Other Expenses") report.operating.other += t.total;

      // ------ NON OPERATING ----------
      else if (cat === "Interest Expense") report.nonOperating.interestExpense += t.total;

      else if (cat === "Other Non-Operational") report.nonOperating.other += t.total;
    }
  });

  // ============================
  //      CALCULATE TOTALS
  // ============================

  report.revenue.total =
    report.revenue.finishedGarments +
    report.revenue.cmtServices +
    report.revenue.otherIncome;

  report.cogs.total =
    report.cogs.fabricTrims +
    report.cogs.labor +
    report.cogs.overheads +
    report.cogs.packaging;

  report.grossProfit =
    report.revenue.total - report.cogs.total;

  report.operating.total =
    report.operating.admin +
    report.operating.salesMarketing +
    report.operating.rentUtilities +
    report.operating.depreciation +
    report.operating.other;

  report.operatingProfit =
    report.grossProfit - report.operating.total;

  report.nonOperating.total =
    report.nonOperating.interestIncome -
    report.nonOperating.interestExpense +
    report.nonOperating.other;

  report.profitBeforeTax =
    report.operatingProfit + report.nonOperating.total;

  // Tax if you ever add category "Income Tax"
  report.taxExpense =
    transactions
      .filter(t => t?.category?.name === "Income Tax Expense")
      .reduce((sum, t) => sum + t.total, 0);

  report.netProfit =
    report.profitBeforeTax - report.taxExpense;


  // ============================
  //       SEND RESPONSE
  // ============================
  res.status(200).json({
    success: true,
    period: { startDate, endDate },
    report,
  });

});



export const getVatSummaryReport = catchAsyncErrors(async (req, res, next) => {
  const { _id } = req.user;
  let { startDate, endDate } = req.query;

  if (!startDate || !endDate)
    return next(new ErrorHandler("Start & End date required", 400));

  const transactions = await BookTransaction.find({
    user: _id,
    date: { $gte: new Date(startDate), $lte: new Date(endDate) }
  });

  const vatCollected = transactions
    .filter(t => t.transactionType === "INCOME")
    .reduce((sum, t) => sum + (t.tax || 0), 0);

  const vatPaid = transactions
    .filter(t => t.transactionType === "EXPENSE")
    .reduce((sum, t) => sum + (t.tax || 0), 0);

  res.status(200).json({
    success: true,
    period: { startDate, endDate },
    vatCollected,
    vatPaid,
    netVat: vatCollected - vatPaid,
    transactions
  });
});


export const getCashFlowReport = catchAsyncErrors(async (req, res, next) => {
    const { _id } = req.user;
  let { startDate, endDate } = req.query;

  if (!startDate || !endDate)
    return next(new ErrorHandler("Start & End date required", 400));

  const transactions = await BookTransaction.find({
    user: _id,
    date: { $gte: new Date(startDate), $lte: new Date(endDate) }
  });

  const cashIn = transactions
    .filter(t => t.transactionType === "INCOME")
    .reduce((sum, t) => sum + t.total, 0);

  const cashOut = transactions
    .filter(t => t.transactionType === "EXPENSE")
    .reduce((sum, t) => sum + t.total, 0);

  res.status(200).json({
    success: true,
    cashIn,
    cashOut,
    netCashFlow: cashIn - cashOut,
    transactions
  });
});

export const getVatLedger = catchAsyncErrors(async (req, res, next) => {
  const { _id } = req.user;
  let { startDate, endDate } = req.query;

  const ledger = await BookTransaction.find({
    user: _id,
    tax: { $gt: 0 },
    date: { $gte: new Date(startDate), $lte: new Date(endDate) }
  }).sort({ date: 1 });

  res.status(200).json({
    success: true,
    ledger
  });
});

export const getGeneralLedger = catchAsyncErrors(async (req, res, next) => {
   const { _id } = req.user;
  let { startDate, endDate } = req.query;

  const ledger = await BookTransaction.find({
    user: _id,
    date: { $gte: new Date(startDate), $lte: new Date(endDate) }
  }).sort({ date: 1 });

  res.status(200).json({
    success: true,
    ledger
  });
});
