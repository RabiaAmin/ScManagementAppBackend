import { catchAsyncErrors } from "../middleware/CatchAsynErrors.js";
import {Invoice} from "../model/invoice.model.js";
import ErrorHandler from "../middleware/Error.js";
import { generateInvoiceNumber } from "../utils/GenerateInvoiceNumber.js";
import { getPaginatedInvoices, getMonthlyStats } from "../utils/GetMonthlyStates.js";


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
      poNumber
    } = req.body;

    if (!fromBusiness || !toClient || !items || !subTotal || !totalAmount) {
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
      tax,
      totalAmount,
      status
    });

    res.status(201).json({
      success: true,
      invoice
    });

  } catch (error) {
    next(error);
  }
};


export const updateInvoice = catchAsyncErrors(async (req, res, next)=>{
    const { id } = req.params;
   

    const updatedInvoice = {
        invoiceNumber: req.body.invoiceNumber,
        poNumber: req.body.poNumber,
        date: req.body.date,
        fromBusiness: req.body.fromBusiness,
        toClient: req.body.toClient,
        items: req.body.items,
        subTotal: req.body.subTotal,
        tax: req.body.tax,
        totalAmount: req.body.totalAmount,
        status: req.body.status

    };

    const invoice = await Invoice.findByIdAndUpdate(id, updatedInvoice,
         { new: true,
           runValidators: true, 
        });

    if (!invoice) {
        return next(new ErrorHandler("Invoice not found", 404));
    }

  

    res.status(200).json({
        success: true,
        invoice
    });
} );

export const deleteInvoice = catchAsyncErrors(async (req, res, next)=>{
    const { id } = req.params;

    const invoice = await Invoice.findById(id);     
    if (!invoice) {
        return next(new ErrorHandler("Invoice not found", 404));
    }
    await invoice.deleteOne();
    res.status(200).json({
        success: true,
        message: "Invoice deleted successfully"
    });
} );

export const getInvoice = catchAsyncErrors(async (req, res, next)=>{
    const { id } = req.params;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
        return next(new ErrorHandler("Invoice not found", 404));
    }
    res.status(200).json({
        success: true,
        invoice
    });
} );

export const getAllInvoice = catchAsyncErrors(async (req, res, next) => {
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

  const { invoices, totalRecords, totalPages } = await getPaginatedInvoices(page, limit);

  if (!invoices || invoices.length === 0) {
    return next(new ErrorHandler("No invoices found", 404));
  }

  const stats = await getMonthlyStats(startDate, endDate);

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
        from: "clients",           // collection name in MongoDB
        localField: "toClient",
        foreignField: "_id",
        as: "client",
      },
    },
    { $unwind: "$client" },       // deconstruct the array
    {
      $group: {
        _id: "$client.name",       // group by client name
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
            $lte: new Date(endDate)
        };
    }

    const result = await Invoice.aggregate([
        { $match: match },
        { $unwind: "$items" },
        {
            $group: {
                _id: "$items.description",
                totalOrders: { $sum: "$items.quantity" },
                invoiceCount: { $addToSet: "$_id" } // collect unique invoice IDs
            }
        },
        {
            $project: {
                _id: 0,
                product: "$_id",
                totalOrders: 1,
                invoiceCount: { $size: "$invoiceCount" } // number of invoices containing this product
            }
        },
        { $sort: { totalOrders: -1 } }
    ]);

    if (!result.length) {
        return next(new ErrorHandler("No data found for given range", 404));
    }

    res.status(200).json({
        success: true,
        data: result
    });
});







