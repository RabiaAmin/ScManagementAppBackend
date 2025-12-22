import { EmployeeLoan } from "../model/employeeLoan.model.js";
import ErrorHandler from "../middleware/Error.js";
import { catchAsyncErrors } from "../middleware/CatchAsynErrors.js";
import { Employee } from "../model/employee.model.js";


// ================= CREATE LOAN =================
export const addLoan = catchAsyncErrors(async (req, res, next) => {
  const {
    employee,
    loanAmount,
    repaymentType,
    emiAmount,
    totalInstallments,
    remarks,
    autoDeduct,
  } = req.body;

  if (!employee || !loanAmount || !repaymentType) {
    return next(new ErrorHandler("Missing required fields", 400));
  }

  if (repaymentType === "INSTALLMENT") {
    if (!emiAmount || !totalInstallments) {
      return next(
        new ErrorHandler("EMI amount & total installments required", 400)
      );
    }
  }

  const loan = await EmployeeLoan.create({
    employee,
    loanAmount,
    repaymentType,
    emiAmount,
    totalInstallments,
    remarks,
    autoDeduct,
  });

  res.status(201).json({
    success: true,
    message: "Loan created successfully",
    loan,
  });
});


// ================= GET ALL LOANS =================
export const getAllLoans = catchAsyncErrors(async (req, res) => {
  const loans = await EmployeeLoan.find({ isActive: true })
    .populate("employee", "name department");

  res.status(200).json({
    success: true,
    loans,
  });
});


// ================= GET LOANS BY EMPLOYEE =================
export const getLoansByEmployee = catchAsyncErrors(async (req, res ,next) => {
  const employeeId = req.params.id;

  // ✅ 1. Check employee exists
  const employee = await Employee.findById(employeeId).select("name department");
  if (!employee) {
    return next(new ErrorHandler("Employee not found with this ID", 404));
  }


  const loans = await EmployeeLoan.find({
    employee: employeeId,
    isActive: true,
  }).populate("employee", "name department");

  const totalLoans = loans.length;

  const totalLoanAmount = loans.reduce((acc, loan) => acc + loan.loanAmount, 0);
  const totalPaidAmount = loans.reduce((acc, loan) => acc + loan.paidAmount, 0);


  res.status(200).json({ success: true,employee, loans , totalLoans, totalLoanAmount, totalPaidAmount});
});


export const payEmi = catchAsyncErrors(async (req, res, next) => {
  const loan = await EmployeeLoan.findById(req.params.id);

  if (!loan) return next(new ErrorHandler("Loan not found", 404));
  if (loan.status === "Completed")
    return next(new ErrorHandler("Loan already completed", 400));

  if (loan.repaymentType !== "INSTALLMENT")
    return next(new ErrorHandler("Not an EMI based loan", 400));

  loan.paidAmount += loan.emiAmount;
  loan.paidInstallments += 1;

  loan.payments.push({
    amount: loan.emiAmount,
    method: "SALARY_DEDUCTION",
    note: "EMI Payment",
  });

  await loan.save();

  res.status(200).json({
    success: true,
    message: "EMI paid successfully",
    loan,
  });
});


// ================= MANUAL PAYMENT =================
export const payManualAmount = catchAsyncErrors(async (req, res, next) => {
  const { amount, method, note } = req.body;

  const loan = await EmployeeLoan.findById(req.params.id);
  if (!loan) return next(new ErrorHandler("Loan not found", 404));
  if (loan.status === "Completed")
    return next(new ErrorHandler("Loan already completed", 400));

  if (amount <= 0)
    return next(new ErrorHandler("Invalid payment amount", 400));

  loan.paidAmount += amount;

  loan.payments.push({
    amount,
    method,
    note,
  });

  await loan.save();

  res.status(200).json({
    success: true,
    message: "Payment recorded successfully",
    loan,
  });
});


// ================= CLOSE LOAN (SOFT DELETE) =================
export const closeLoan = catchAsyncErrors(async (req, res) => {
  await EmployeeLoan.findByIdAndUpdate(req.params.id, {
    isActive: false,
  });

  res.status(200).json({
    success: true,
    message: "Loan closed successfully",
  });
});
