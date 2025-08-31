import { catchAsyncErrors } from "../middleware/CatchAsynErrors.js";
import {Invoice} from "../model/invoice.model.js";
import ErrorHandler from "../middleware/Error.js";


export const createInvoice = catchAsyncErrors(async (req, res, next)=>{
    const { invoiceNumber, date, fromBusiness, toClient, items, subTotal, tax, totalAmount, status ,poNumber } = req.body;

    if (!invoiceNumber || !fromBusiness || !toClient || !items || !subTotal || !totalAmount) {
        return next(new ErrorHandler("Please provide all required fields", 400));
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
} );

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


export const getAllInvoice = catchAsyncErrors(async (req, res, next)=>{
    const invoices = await Invoice.find();
    if (!invoices) {
        return next(new ErrorHandler("No invoices found", 404));
    }
    res.status(200).json({
        success: true,
        invoices
    });
} );




