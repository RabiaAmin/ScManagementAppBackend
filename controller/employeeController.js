import e from "express";
import { catchAsyncErrors } from "../middleware/CatchAsynErrors.js";
import ErrorHandler from "../middleware/Error.js";
import { Employee } from "../model/employee.model.js";


export const addEmployee = catchAsyncErrors(async (req, res, next) => {
  const {
    name,   
    phone,
    cnic,
    department, 
    payType,
    employmentType,
    hourlyRate,
    dailyRate,
    perPieceRate,
    monthlySalary,
    paymentMethod
  } = req.body; 

      if (!name || !phone || !cnic || !department || !payType) {
    return next(new ErrorHandler("All required fields must be provided", 400));
  }

  let finalHourlyRate = hourlyRate;
  let finalMonthlySalary = monthlySalary;
  let finalPerPieceRate = perPieceRate;

  // ✅ TIME BASED EMPLOYEE
  if (payType === "TIME_BASED") {
    if (!weeklyPayment && !hourlyRate) {
      return next(
        new ErrorHandler("Weekly payment or hourly rate is required", 400)
      );
    }

    // ✅ STANDARD FORMULA (6 days × 8 hours = 48 hours)
    const WORKING_DAYS = 6;
    const WORKING_HOURS = 8;
    const TOTAL_WEEKLY_HOURS = WORKING_DAYS * WORKING_HOURS;

    finalHourlyRate = weeklyPayment
      ? Number((weeklyPayment / TOTAL_WEEKLY_HOURS).toFixed(2))
      : hourlyRate;

    finalMonthlySalary = undefined;
    finalPerPieceRate = undefined;
  }

  // ✅ FIXED SALARY EMPLOYEE
  if (payType === "FIXED") {
    if (!monthlySalary) {
      return next(
        new ErrorHandler("Monthly salary is required for fixed employees", 400)
      );
    }

    finalHourlyRate = undefined;
    finalPerPieceRate = undefined;
  }

  // ✅ PIECE BASED EMPLOYEE
  if (payType === "PIECE_BASED") {
    if (!perPieceRate) {
      return next(
        new ErrorHandler("Per piece rate is required", 400)
      );
    }

    finalHourlyRate = undefined;
    finalMonthlySalary = undefined;
  }
    const employee = await Employee.create({
     name,
    phone,
    cnic,
    department,
    payType,
    employmentType,
    hourlyRate: finalHourlyRate,
    monthlySalary: finalMonthlySalary,
    perPieceRate: finalPerPieceRate,
    paymentMethod,
    user: req.user._id,
  });       
    res.status(201).json({

    success: true,
    message: "Employee added successfully",
    employee,
  });
});

export const updateEmployee = catchAsyncErrors(async (req,res,next)=>{

   const {id} = req.params;
    const updatedEmployee = {
    name:req.body.name,
    phone:req.body.phone,
    cnic:req.body.cnic, 
    department:req.body.department,
    payType:req.body.payType,
    employmentType:req.body.employmentType, 
    hourlyRate:req.body.hourlyRate,
    dailyRate:req.body.dailyRate,
    perPieceRate:req.body.perPieceRate,           
    monthlySalary:req.body.monthlySalary,
    paymentMethod:req.body.paymentMethod,
   };   
    const employee = await Employee.findByIdAndUpdate(id,updatedEmployee,{
      new:true,
      runValidators:true,
    }); 
    if(!employee){
      return next(new ErrorHandler("Employee not found",404));
    }
    res.status(200).json({
    success:true,
    message:"Employee updated successfully",
    employee,
  });
});

export const deleteEmployee = catchAsyncErrors(async (req,res,next)=>{
   const {id} = req.params;
   const employee = await Employee.findByIdAndDelete(id); 
    if(!employee){
      return next(new ErrorHandler("Employee not found",404));
    }
    res.status(200).json({
    success:true,
    message:"Employee deleted successfully",
  });
});
export const getAllEmployee = catchAsyncErrors(async (req,res,next)=>{
   const employees = await Employee.find({user:req.user._id}); 
    res.status(200).json({  
    success:true,
    employees,
  });
});

export const getEmployeeDetails = catchAsyncErrors(async (req,res,next)=>{
   const {id} = req.params;
   const employee = await Employee.findById(id); 
    if(!employee){
      return next(new ErrorHandler("Employee not found",404));
    }
    res.status(200).json({  
    success:true,
    employee,
  });
});

