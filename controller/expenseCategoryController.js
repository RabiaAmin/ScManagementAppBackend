//  addExpenseCategory,  deleteExpenseCategory, getAllExpenseCategories

import { catchAsyncErrors } from "../middleware/CatchAsynErrors.js";
import ErrorHandler from "../middleware/Error.js";
import { ExpenseCategory } from "../model/expense_category.model.js";


export const addExpenseCategory = catchAsyncErrors(async (req, res, next) => {
  const { name, description ,type } = req.body;

    if (!name || !description || !type) {
    return next(new ErrorHandler("Please provide all required fields", 400));
    }


    const expenseCategory = await ExpenseCategory.create({
    name,
    description,
    type
  });
    res.status(201).json({
    success: true,
    message: "Expense category added successfully",
    expenseCategory,
  });
});

export const deleteExpenseCategory = catchAsyncErrors(async (req, res, next) => {
   const {id} = req.params; 
    if(!id){
        return next(new ErrorHandler("Please provide expense category id",400));
    }
    const expenseCategory = await ExpenseCategory.findByIdAndDelete(id);

    if(!expenseCategory){
        return next(new ErrorHandler("Expense category not found",404));
    }
    res.status(200).json({
        success:true,
        message:"Expense category deleted successfully",
    });
}
);

export const getAllExpenseCategories = catchAsyncErrors(async (req, res, next) => {
    const expenseCategories = await ExpenseCategory.find();
    res.status(200).json({
        success:true,
        expenseCategories,
    });
}
);          
