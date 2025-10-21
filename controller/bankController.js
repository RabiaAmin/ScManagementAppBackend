import { catchAsyncErrors } from "../middleware/CatchAsynErrors.js";
import ErrorHandler from "../middleware/Error.js";
import { BankAccount } from "../model/bank_account.model.js";


export const createBankAccount = catchAsyncErrors(async(req,res,next)=>{
    const { accountType, bankName, accountHolderName, accountNumber, branchCode } = req.body;

    if(!accountType || !bankName || !accountHolderName || !accountNumber){
        return next(new ErrorHandler("Please provide all required fields",400));
    }

    const existingAccount = await BankAccount.findOne({ accountType });
    if(existingAccount){
        return next(new ErrorHandler("Bank account with this type already exists",400));
    }
    const bankAccount = await BankAccount.create({
        accountType,
        bankName,
        accountHolderName,
        accountNumber,
        branchCode,
    });
    res.status(201).json({
        success:true,
        message:"Bank account created successfully",
        bankAccount,
    });   
});

export const updateBankAccount = catchAsyncErrors(async(req,res,next)=>{
    const { id } = req.params;
    const { bankName, accountHolderName,  accountNumber, branchCode } = req.body;   
    let bankAccount = await BankAccount.findById(id);
    if(!bankAccount){
        return next(new ErrorHandler("Bank account not found",404));
    }   
    bankAccount.bankName = bankName || bankAccount.bankName;
    bankAccount.accountHolderName = accountHolderName || bankAccount.accountHolderName;
    bankAccount.accountNumber = accountNumber || bankAccount.accountNumber; 
    bankAccount.branchCode = branchCode || bankAccount.branchCode;
    await bankAccount.save();
    res.status(200).json({
        success:true,
        message:"Bank account updated successfully",
        bankAccount,
    });
});

export const getBankAccount = catchAsyncErrors(async(req,res,next)=>{
    const { id } = req.params;
    const bankAccount = await BankAccount.findById(id);
    if(!bankAccount){
        return next(new ErrorHandler("Bank account not found",404));
    }
    res.status(200).json({
        success:true,
        bankAccount,
    });
});

export const deleteBankAccount = catchAsyncErrors(async(req,res,next)=>{
    const { id } = req.params;
    const bankAccount = await BankAccount.findById(id);
    if(!bankAccount){
        return next(new ErrorHandler("Bank account not found",404));
    }               
    await bankAccount.deleteOne();
    res.status(200).json({
        success:true,
        message:"Bank account deleted successfully",
    });
}

);
export const getAllBankAccounts = catchAsyncErrors(async(req,res,next)=>{
    const bankAccounts = await BankAccount.find();
    res.status(200).json({          
        success:true,
        bankAccounts,
    });
});


