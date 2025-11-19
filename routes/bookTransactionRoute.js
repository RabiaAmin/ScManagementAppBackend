import express from "express";
import {
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionsByDate,
getProfitLossReport,
  getVatSummaryReport,
  getCashFlowReport,
  getVatLedger,
  getGeneralLedger,   
  getSingleTransaction,
  
} from "../controller/bookTransationController.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.post("/add", isAuthenticated, addTransaction);
router.put("/update/:id", isAuthenticated, updateTransaction);
router.delete("/delete/:id", isAuthenticated, deleteTransaction);
router.get("/getAll", isAuthenticated, getTransactionsByDate);
router.get("/get/:id",isAuthenticated,getSingleTransaction)
router.get("/report/profit-loss",isAuthenticated, getProfitLossReport);
router.get("/report/vat-summary",isAuthenticated, getVatSummaryReport);
router.get("/report/cash-flow",isAuthenticated, getCashFlowReport);
router.get("/report/vat-ledger",isAuthenticated, getVatLedger);
router.get("/report/general-ledger", isAuthenticated,getGeneralLedger);

export default router;
