import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { createBankAccount, deleteBankAccount, getAllBankAccounts, getBankAccount, updateBankAccount } from "../controller/bankController.js";
const router = express.Router();

router.post("/create",isAuthenticated,createBankAccount);
router.put("/update:id",isAuthenticated,updateBankAccount);
router.get("/get:id",isAuthenticated,getBankAccount);
router.delete("/delete:id",isAuthenticated,deleteBankAccount);
router.get("/getAll",isAuthenticated,getAllBankAccounts);

export default router;