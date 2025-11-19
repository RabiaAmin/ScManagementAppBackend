import { catchAsyncErrors } from "../middleware/CatchAsynErrors.js";
import { Invoice } from "../model/invoice.model.js";
import ErrorHandler from "../middleware/Error.js";
import { generateInvoiceNumber } from "../utils/GenerateInvoiceNumber.js";
import {
  getPaginatedInvoices,
  getMonthlyStats,
} from "../utils/GetMonthlyStates.js";
import { BankAccount } from "../model/bank_account.model.js";
import { BookTransaction } from "../model/book_Keeping.model.js";

export const createInvoice = async (req, res, next) => {
  try {
    const {
      invNo, // manual invoice number (optional)
      date,
      fromBusiness,
      toClient,
      items,
      subTotal,
      tax,
      totalAmount,
      status,
      poNumber,
      category,
    } = req.body;

    if (!fromBusiness || !toClient || !items || !subTotal || !totalAmount || !category) {
      return next(new ErrorHandler("Please provide all required fields", 400));
    }

    let invoiceNumber;

    if (invNo) {
      // Manual invoice number (old invoices being imported)
      invoiceNumber = invNo;
    } else {
      // Auto-generate invoice number from counter
      invoiceNumber = await generateInvoiceNumber();
    }

    const invoice = await Invoice.create({
      invoiceNumber,
      poNumber,
      date,
      fromBusiness,
      toClient,
      items,
      subTotal,
      category,
      tax,
      totalAmount,
      status,
    });

    if (status === "Paid") {
      try {
        await BookTransaction.create({
          transactionType: "INCOME",
          sourceType: "INVOICE",
          relatedInvoice: invoice._id,
          clientId: invoice.toClient,
          amount: invoice.subTotal,
          tax: invoice.tax,
          total: invoice.totalAmount,
          isVatApplicable: invoice.isVatApplicable,
          incomeCategory: invoice.category,
          paymentMethod: "Cash",
          description: `Payment received for invoice #${invoice.invoiceNumber}`,
          date: invoice.date,
          user: req.user._id,
        });
      } catch (error) {
        console.error("BookTransaction creation failed:", err.message);
      }
    }

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      invoice,
    });
  } catch (error) {
    next(error);
  }
};

export const updateInvoice = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const invoice = await Invoice.findById(id);

  if (!invoice) return next(new ErrorHandler("Invoice not found", 404));

  const oldStatus = invoice.status;

  // Update invoice
  Object.assign(invoice, {
    invoiceNumber: req.body.invoiceNumber,
    poNumber: req.body.poNumber,
    date: req.body.date,
    fromBusiness: req.body.fromBusiness,
    category:req.body.category,
    toClient: req.body.toClient,
    items: req.body.items,
    subTotal: req.body.subTotal,
    tax: req.body.tax,
    totalAmount: req.body.totalAmount,
    status: req.body.status,
  });

  await invoice.save();

  // Sync or Create BookTransaction
  const existingTransaction = await BookTransaction.findOne({
    relatedInvoice: invoice._id,
  });

  // Case 1: Invoice just got paid (previously not paid)
  if (oldStatus !== "Paid" && invoice.status === "Paid") {
    try {
      await BookTransaction.create({
        transactionType: "INCOME",
        sourceType: "INVOICE",
        relatedInvoice: invoice._id,
        clientId: invoice.toClient,
        amount: invoice.subTotal,
        tax: invoice.tax,
        total: invoice.totalAmount,
        isVatApplicable: invoice.isVatApplicable,
        incomeCategory: invoice.category,
        paymentMethod: "Cash",
        description: `Payment received for invoice #${invoice.invoiceNumber}`,
        date: invoice.date,
        user: req.user._id,
      });
    } catch (error) {
      console.error("BookTransaction creation failed:", err.message);
    }
  } else if (oldStatus === "Paid" && invoice.status !== "Paid") {
    if (existingTransaction) {
      await BookTransaction.deleteOne({ relatedInvoice: invoice._id });
    }
  } else if (existingTransaction) {
    await BookTransaction.findOneAndUpdate(
      { relatedInvoice: invoice._id },
      {
        amount: invoice.subTotal,
        tax: invoice.tax,
        total: invoice.totalAmount,
        date: invoice.date,
      },
      { new: true }
    );
  }

  res.status(200).json({
    success: true,
    message: "Invoice updated successfully",
    invoice,
  });
});

export const deleteInvoice = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const invoice = await Invoice.findById(id);
  if (!invoice) {
    return next(new ErrorHandler("Invoice not found", 404));
  }
  await invoice.deleteOne();
  await BookTransaction.deleteOne({ relatedInvoice: invoice._id });

  res.status(200).json({
    success: true,
    message: "Invoice deleted successfully",
  });
});

export const getInvoice = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const invoice = await Invoice.findById(id)
    .populate("toClient")
    .populate("fromBusiness");
  if (!invoice) {
    return next(new ErrorHandler("Invoice not found", 404));
  }
  let bankAccount;
  if (invoice.toClient.vatApplicable) {
    bankAccount = await BankAccount.findOne({ accountType: "VAT" });
  } else {
    bankAccount = await BankAccount.findOne({ accountType: "NON_VAT" });
  }
  res.status(200).json({
    success: true,
    invoice,
    bankAccount,
  });
});

export const getAllInvoice = catchAsyncErrors(async (req, res, next) => {
  let {
    startDate,
    endDate,
    page = 1,
    limit = 40,
    poNumber,
    toClient,
  } = req.query;
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

  const filter = {};
  if (poNumber) {
    filter.poNumber = poNumber;
  }
  if (toClient) {
    filter.toClient = toClient;
  }
  const { invoices, totalRecords, totalPages } = await getPaginatedInvoices(
    page,
    limit,
    filter
  );

  if (!invoices || invoices.length === 0) {
    return next(new ErrorHandler("No invoices found", 404));
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  const stats = await getMonthlyStats(start, end);

  res.status(200).json({
    success: true,
    invoices,
    page,
    totalPages,
    totalRecords,
    stats,
  });
});

export const getWeeklyStatements = catchAsyncErrors(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return next(new ErrorHandler("Start date and end date are required", 400));
  }

  const invoices = await Invoice.aggregate([
    {
      $match: {
        date: { $gte: new Date(startDate), $lte: new Date(endDate) },
        status: "Sent",
      },
    },
    {
      $lookup: {
        from: "clients", // collection name in MongoDB
        localField: "toClient",
        foreignField: "_id",
        as: "client",
      },
    },
    { $unwind: "$client" }, // deconstruct the array
    {
      $group: {
        _id: "$client.name", // group by client name
        totalInvoices: { $sum: 1 },
        totalAmount: { $sum: "$totalAmount" },
        invoices: { $push: "$$ROOT" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.status(200).json({
    success: true,
    statements: invoices,
  });
});

export const getOrdersPerProduct = catchAsyncErrors(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  let match = { status: "Pending" };

  if (startDate && endDate) {
    match.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const result = await Invoice.aggregate([
    { $match: match },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.description",
        totalOrders: { $sum: "$items.quantity" },
        invoiceCount: { $addToSet: "$_id" }, // collect unique invoice IDs
      },
    },
    {
      $project: {
        _id: 0,
        product: "$_id",
        totalOrders: 1,
        invoiceCount: { $size: "$invoiceCount" }, // number of invoices containing this product
      },
    },
    { $sort: { totalOrders: -1 } },
  ]);

  if (!result.length) {
    return next(new ErrorHandler("No data found for given range", 404));
  }

  res.status(200).json({
    success: true,
    data: result,
  });
});

export const markAsPaid = catchAsyncErrors(async (req, res, next) => {
  const { invoiceIds } = req.body;

  if (!invoiceIds || invoiceIds.length === 0) {
    return next(new ErrorHandler("No invoices provided", 400));
  }

  const invoices = await Invoice.find({ _id: { $in: invoiceIds } });

  let createdTransactions = 0;

  for (const invoice of invoices) {
    const oldStatus = invoice.status;

    // Update invoice status
    invoice.status = "Paid";
    await invoice.save();

    // Check if transaction already exists
    const existingTransaction = await BookTransaction.findOne({
      relatedInvoice: invoice._id,
    });

    // Create new BookTransaction ONLY if:
    // - invoice was previously NOT paid
    // - and no transaction exists
    if (oldStatus !== "Paid" && !existingTransaction) {
      await BookTransaction.create({
        transactionType: "INCOME",
        sourceType: "INVOICE",
        relatedInvoice: invoice._id,
        clientId: invoice.toClient,
        amount: invoice.subTotal,
        tax: invoice.tax,
        total: invoice.totalAmount,
        isVatApplicable: invoice.isVatApplicable,
        paymentMethod: "Cash",
        description: `Payment received for invoice #${invoice.invoiceNumber}`,
        date: invoice.date,
        user: req.user._id,
      });

      createdTransactions++;
    }
  }

  res.status(200).json({
    success: true,
    message: `${invoices.length} invoices marked as Paid, ${createdTransactions} transactions created`,
  });
});
