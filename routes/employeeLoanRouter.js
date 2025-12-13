import express from "express";
import {
  addLoan,
  getAllLoans,
  getLoansByEmployee,
  payEmi,
  payManualAmount,
  closeLoan,
} from "../controller/employeeLoanController.js";

const router = express.Router();

router.post("/add", addLoan);
router.get("/all", getAllLoans);
router.get("/employee/:id", getLoansByEmployee);

router.put("/pay-emi/:id", payEmi);
router.put("/pay-manual/:id", payManualAmount);

router.delete("/close/:id", closeLoan);

export default router;
