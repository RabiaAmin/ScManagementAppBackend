import { Expense } from "../model/expense.model.js";
import { Invoice } from "../model/invoice.model.js";

export const getPaginatedInvoices = async (page, limit, filter={}) => {
  const totalRecords = await Invoice.countDocuments(filter);
  const invoices = await Invoice.find(filter)
    .sort({ _id: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    invoices,
    totalRecords,
    totalPages: Math.ceil(totalRecords / limit),
    page,
  };
};

export const getMonthlyStats = async (startDate , endDate) => {

  const currentMonthInvoices = await Invoice.find({
    date: { $gte: startDate, $lt: endDate }, // note: $lt to exclude the end date
  }).populate("toClient");

    // Calculate total revenue (rounded to 2 decimals)
    const totalRevenue = Number(
      currentMonthInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0).toFixed(2)
    );

    // Calculate outstanding revenue (rounded to 2 decimals)
    const outstandingRevenue = Number(
      currentMonthInvoices
        .filter((inv) => inv.status !== "Paid")
        .reduce((sum, inv) => sum + inv.totalAmount, 0)
        .toFixed(2)
    );

       // Calculate Paid Amount (rounded to 2 decimals)
    const PaidAmount = Number(
      currentMonthInvoices
        .filter((inv) => inv.status === "Paid")
        .reduce((sum, inv) => sum + inv.totalAmount, 0)
        .toFixed(2)
    );

    // Upcoming due dates (unpaid, sorted)
    const upcomingDueDates = currentMonthInvoices
      .filter((inv) => inv.status !== "Paid")
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const totalInvoicesOfThisMonth = currentMonthInvoices.length;

      const collectedVAT = Number(
    currentMonthInvoices
      .filter((inv) => inv.toClient?.vatApplicable && inv.status === "Paid")
      .reduce((sum, inv) => sum + (inv.tax || 0), 0)
      .toFixed(2)
  );

  const netRevenue = Number(
    currentMonthInvoices
      .filter((inv) => inv.status === "Paid")
      .reduce((sum, inv) => sum + (inv.totalAmount - (inv.tax || 0)), 0)
      .toFixed(2)
  );

  return {
      startDate,
      endDate,
      totalRevenue,
      outstandingRevenue,
      upcomingDueDates,
      totalInvoicesOfThisMonth,
      PaidAmount,
      collectedVAT,
      netRevenue
  };
};

export const getMonthlyStatsOfExpense = async (startDate , endDate) => {

  const currentMonthExpenses = await Expense.find({
    date: { $gte: startDate, $lt: endDate }, 
  }); 
  
    const totalExpense = Number(
      currentMonthExpenses.reduce((sum, exp) => sum + exp.totalAmount, 0).toFixed(2)
    );  


const nonVatExpenses = currentMonthExpenses.filter(exp => !exp.isVatApplicable);
const vatExpenses = currentMonthExpenses.filter(exp => exp.isVatApplicable);

const totalNonVatExpense = Number(
  nonVatExpenses.reduce((sum, exp) => sum + exp.totalAmount, 0).toFixed(2)
);

const totalVatExpense = Number(
  vatExpenses.reduce((sum, exp) => sum + exp.totalAmount, 0).toFixed(2)
);
const expenseCount = currentMonthExpenses.length;
  return {
      startDate,
      endDate,
      totalExpense ,
      
      totalNonVatExpense,
      totalVatExpense,
      expenseCount
  };
} 