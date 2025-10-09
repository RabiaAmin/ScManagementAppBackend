import { Invoice } from "../model/invoice.model.js";

export const getPaginatedInvoices = async (page, limit) => {
  const totalRecords = await Invoice.countDocuments();
  const invoices = await Invoice.find()
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

export const getMonthlyStats = async () => {
  const now = new Date();

  // Start date → 1st of last month
  const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);

  // End date → 1st of current month
  const endDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);



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
