import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { addExpenseCategory,  deleteExpenseCategory, getAllExpenseCategories } from "../controller/expenseCategoryController.js";

const router = express.Router();

router.post("/add",isAuthenticated,addExpenseCategory);

router.delete("/delete/:id",isAuthenticated,deleteExpenseCategory);

router.get("/getAll",isAuthenticated,getAllExpenseCategories);



export default router;