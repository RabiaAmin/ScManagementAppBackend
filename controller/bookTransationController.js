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
    supplierName,
    amount,
    tax,
    total,
    paymentMethod,
    description,
    date,
  } = req.body;

  if (
    !transactionType ||
    !sourceType ||
    !amount ||
    !total ||
    !paymentMethod ||
    !date
  ) {
    return next(new ErrorHandler("Please fill all required fields", 400));
  }

  const transaction = await BookTransaction.create({
    transactionType,
    sourceType,
    clientName,
    category,
    incomeCategory,
    supplierName,
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
    return next(
      new ErrorHandler("You are not authorized to update this transaction", 401)
    );
  }

  const updatedData = req.body;

  const updatedTransaction = await BookTransaction.findByIdAndUpdate(
    id,
    updatedData,
    {
      new: true,
      runValidators: true,
    }
  );

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
    return next(
      new ErrorHandler("You are not authorized to delete this transaction", 401)
    );
  }

  await transaction.deleteOne();

  res.status(200).json({
    success: true,
    message: "Transaction deleted successfully",
  });
});

export const getTransactionsByDate = catchAsyncErrors(
  async (req, res, next) => {
    const { _id } = req.user;
    let { startDate, endDate, page = 1, limit = 40 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

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
      .sort({ _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("clientId category relatedInvoice relatedExpense");

    const totalRecords = await BookTransaction.countDocuments();
    res.status(200).json({
      success: true,
      count: transactions.length,
      totalPages: Math.ceil(totalRecords / limit),
      page,
      transactions,
    });
  }
);

export const getSingleTransaction = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const transaction = await BookTransaction.findById(id).populate(
    "clientId category relatedInvoice relatedExpense"
  );
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
    date: { $gte: new Date(startDate), $lte: new Date(endDate) },
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
  transactions.forEach((t) => {
    let cat = t?.category?.name || "";

    let incomeCat = t?.incomeCategory || "";

    // --------------------
    //       INCOME
    // --------------------
    if (t.transactionType === "INCOME") {
      if (incomeCat === "Finished Garments")
        report.revenue.finishedGarments += t.total;
      else if (incomeCat === "CMT Services")
        report.revenue.cmtServices += t.total;
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
      else if (cat === "Administrative Expenses")
        report.operating.admin += t.total;
      else if (cat === "Sales & Marketing")
        report.operating.salesMarketing += t.total;
      else if (cat === "Rent & Utilities")
        report.operating.rentUtilities += t.total;
      else if (cat === "Depreciation & Machinery Maintenance")
        report.operating.depreciation += t.total;
      else if (cat === "Other Expenses") report.operating.other += t.total;
      // ------ NON OPERATING ----------
      else if (cat === "Interest Expense")
        report.nonOperating.interestExpense += t.total;
      else if (cat === "Other Non-Operational")
        report.nonOperating.other += t.total;
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

  report.grossProfit = report.revenue.total - report.cogs.total;

  report.operating.total =
    report.operating.admin +
    report.operating.salesMarketing +
    report.operating.rentUtilities +
    report.operating.depreciation +
    report.operating.other;

  report.operatingProfit = report.grossProfit - report.operating.total;

  report.nonOperating.total =
    report.nonOperating.interestIncome -
    report.nonOperating.interestExpense +
    report.nonOperating.other;

  report.profitBeforeTax = report.operatingProfit + report.nonOperating.total;

  // Tax if you ever add category "Income Tax"
  report.taxExpense = transactions
    .filter((t) => t?.category?.name === "Income Tax Expense")
    .reduce((sum, t) => sum + t.total, 0);

  report.netProfit = report.profitBeforeTax - report.taxExpense;

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
  if (!req.user) {
    return next(new ErrorHandler("User not authenticated", 401));
  }

  let { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return next(new ErrorHandler("Start and End date are required", 400));
  }

  // Fetch all VAT-applicable transactions in date range
  const transactions = await BookTransaction.find({
    user: req.user._id,
    isVatApplicable: true,
    date: { $gte: new Date(startDate), $lte: new Date(endDate) },
  })
    .populate("category")
    .populate("relatedInvoice")
    .populate("relatedExpense");

  // ---------------------------
  // INITIAL VAT STRUCTURE
  // ---------------------------
  let vatReport = {
    period: { startDate, endDate },

    outputVAT: 0, // VAT on INCOME
    inputVAT: 0, // VAT on EXPENSE
    netVAT: 0,

    outputTransactions: [],
    inputTransactions: [],
  };

  // ---------------------------
  // PROCESS TRANSACTIONS
  // ---------------------------
  transactions.forEach((t) => {
    const taxableAmount = Number(t.amount) || 0;
    const vatAmount = Number(t.tax) || 0;

    const entry = {
      _id: t._id,
      date: t.date,
      reference:
        t.relatedInvoice?.invoiceNumber ||
        t.relatedExpense?.invoiceNo ||
        "Manual Entry",
      customerOrSupplier: t.clientName || t.suplierName || "-",
      taxableAmount,
      vatRate: "15%",
      vatAmount,
      category: t?.category?.name || t?.incomeCategory || "",
    };

    // Output VAT (INCOME)
    if (t.transactionType === "INCOME") {
      vatReport.outputVAT += vatAmount;
      vatReport.outputTransactions.push(entry);
    }

    // Input VAT (EXPENSE)
    if (t.transactionType === "EXPENSE") {
      vatReport.inputVAT += vatAmount;
      vatReport.inputTransactions.push(entry);
    }
  });

  // ---------------------------
  // NET VAT CALCULATIONS
  // ---------------------------
  vatReport.outputVAT = Number(vatReport.outputVAT.toFixed(2));
  vatReport.inputVAT = Number(vatReport.inputVAT.toFixed(2));

  vatReport.netVAT = Number(
    (vatReport.outputVAT - vatReport.inputVAT).toFixed(2)
  );

  // ---------------------------
  // SEND REPORT
  // ---------------------------
  res.status(200).json({
    success: true,
    report: vatReport,
  });
});

export const getVatLedger = catchAsyncErrors(async (req, res, next) => {
  if (!req.user) {
    return next(new ErrorHandler("User not authenticated", 401));
  }

  let { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return next(new ErrorHandler("Start and End date are required", 400));
  }

  // Fetch VAT transactions
  const transactions = await BookTransaction.find({
    user: req.user._id,
    isVatApplicable: true,
    date: { $gte: new Date(startDate), $lte: new Date(endDate) },
  })
    .sort({ date: 1 })
    .populate("category")
    .populate("relatedInvoice")
    .populate("relatedExpense");

  // -----------------------------------------
  // LEDGER STRUCTURE
  // -----------------------------------------
  let ledgerReport = {
    period: { startDate, endDate },

    openingBalance: 0,
    closingBalance: 0,

    summary: {
      totalOutputVAT: 0,
      totalInputVAT: 0,
      netVAT: 0,
    },

    ledger: [],
  };

  let runningBalance = 0;

  // -----------------------------------------
  // PROCESS LEDGER TRANSACTIONS
  // -----------------------------------------
  transactions.forEach((t) => {
    const vatAmount = Number(t.tax) || 0;
    const taxableAmount = Number(t.amount) || 0;

    const isOutput = t.transactionType === "INCOME"; // Output VAT
    const isInput = t.transactionType === "EXPENSE"; // Input VAT

    // Update summary totals
    if (isOutput) ledgerReport.summary.totalOutputVAT += vatAmount;
    if (isInput) ledgerReport.summary.totalInputVAT += vatAmount;

    // Running Balance Logic
    if (isOutput) runningBalance += vatAmount; // Payable
    if (isInput) runningBalance -= vatAmount; // Claimable

    const entry = {
      date: t.date,
      reference:
        t.relatedInvoice?.invoiceNumber ||
        t.relatedExpense?.invoiceNo ||
        "Manual Entry",

      description: t.category?.name || t.incomeCategory || "-",

      type: isOutput ? "OUTPUT" : "INPUT",

      taxableAmount,
      vatRate: 15, // SA VAT Constant
      vatAmount,

      debit: isInput ? vatAmount : 0,
      credit: isOutput ? vatAmount : 0,

      balance: Number(runningBalance.toFixed(2)),
    };

    ledgerReport.ledger.push(entry);
  });

  // Final calculations
  ledgerReport.summary.totalOutputVAT = Number(
    ledgerReport.summary.totalOutputVAT.toFixed(2)
  );

  ledgerReport.summary.totalInputVAT = Number(
    ledgerReport.summary.totalInputVAT.toFixed(2)
  );

  ledgerReport.summary.netVAT = Number(
    (
      ledgerReport.summary.totalOutputVAT - ledgerReport.summary.totalInputVAT
    ).toFixed(2)
  );

  ledgerReport.closingBalance = ledgerReport.summary.netVAT;

  // -----------------------------------------
  // SEND FINAL REPORT JSON
  // -----------------------------------------
  res.status(200).json({
    success: true,
    report: ledgerReport,
  });
});

export const getGeneralLedger = catchAsyncErrors(async (req, res, next) => {
  if (!req.user) {
    return next(new ErrorHandler("User not authenticated", 401));
  }

  let { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return next(new ErrorHandler("Start and End date are required", 400));
  }

  // Fetch ALL transactions (Income + Expense)
  const transactions = await BookTransaction.find({
    user: req.user._id,
    date: { $gte: new Date(startDate), $lte: new Date(endDate) },
  })
    .sort({ date: 1 }) // ledger must be chronological
    .populate("category")
    .populate("relatedInvoice")
    .populate("relatedExpense");

  // ----------------------------------------------------
  // INITIAL LEDGER STRUCTURE
  // ----------------------------------------------------
  let generalLedger = {
    period: { startDate, endDate },

    openingBalance: 0, // optional enhancement for future
    closingBalance: 0,

    totalIncome: 0,
    totalExpense: 0,

    ledgerEntries: [],
  };

  // Running balance (income increases, expense decreases)
  let runningBalance = 0;

  // ----------------------------------------------------
  // PROCESS ALL TRANSACTIONS
  // ----------------------------------------------------
  transactions.forEach((t) => {
    const amount = Number(t.amount) || 0;

    const isIncome = t.transactionType === "INCOME";
    const isExpense = t.transactionType === "EXPENSE";

    // Running Balance Logic
    if (isIncome) {
      generalLedger.totalIncome += amount;
      runningBalance += amount; // increase balance
    }

    if (isExpense) {
      generalLedger.totalExpense += amount;
      runningBalance -= amount; // decrease balance
    }

    const entry = {
      _id: t._id,
      date: t.date,
      reference:
        t.relatedInvoice?.invoiceNumber ||
        t.relatedExpense?.invoiceNo ||
        "Manual Entry",

      description:
        t.category?.name || t.incomeCategory || t.expenseCategory || "-",

      type: isIncome ? "Income" : "Expense",

      debit: isExpense ? amount : 0, // expenses = debit
      credit: isIncome ? amount : 0, // income = credit

      amount,
      runningBalance: Number(runningBalance.toFixed(2)),
    };

    generalLedger.ledgerEntries.push(entry);
  });

  // Final Closing Balance
  generalLedger.closingBalance = Number(runningBalance.toFixed(2));

  // ----------------------------------------------------
  // SEND RESPONSE TO FRONTEND FOR PDF
  // ----------------------------------------------------
  res.status(200).json({
    success: true,
    report: generalLedger,
  });
});

export const getCashFlowReport = catchAsyncErrors(async (req, res, next) => {
  // 1. Auth check
  if (!req.user) {
    return next(new ErrorHandler("User not authenticated", 401));
  }

  // 2. Validate query params
  let { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    return next(new ErrorHandler("Start and End date are required", 400));
  }

  // 3. Fetch all transactions in period
  const transactions = await BookTransaction.find({
    user: req.user._id,
    date: { $gte: new Date(startDate), $lte: new Date(endDate) },
  })
    .sort({ date: 1 }) // chronological order
    .populate("category")
    .populate("relatedInvoice")
    .populate("relatedExpense");

  // 4. Initialize report structure
  let report = {
    period: { startDate, endDate },
    totalCashInflow: 0,
    totalCashOutflow: 0,
    netCashFlow: 0,
    inflowTransactions: [],
    outflowTransactions: [],
  };

  // 5. Process transactions
  transactions.forEach((t) => {
    const amount = Number(t.amount) || 0;

    const isInflow = t.transactionType === "INCOME"; // cash coming in
    const isOutflow = t.transactionType === "EXPENSE"; // cash going out

    const entry = {
      _id: t._id,
      date: t.date,
      reference:
        t.relatedInvoice?.invoiceNumber ||
        t.relatedExpense?.invoiceNo ||
        "Manual Entry",
      description:
        t.category?.name || t.incomeCategory || t.expenseCategory || "-",
      type: isInflow ? "Inflow" : "Outflow",
      amount,
    };

    if (isInflow) {
      report.totalCashInflow += amount;
      report.inflowTransactions.push(entry);
    } else if (isOutflow) {
      report.totalCashOutflow += amount;
      report.outflowTransactions.push(entry);
    }
  });

  // 6. Net cash flow
  report.netCashFlow = report.totalCashInflow - report.totalCashOutflow;

  // 7. Send response
  res.status(200).json({
    success: true,
    report,
  });
});
