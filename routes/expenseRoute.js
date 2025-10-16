import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { addExpense , updateExpense , deleteExpense , getAllExpenseByMonth,getSingleExpense} from "../controller/expenseController.js";

const router = express.Router();

router.post("/add",isAuthenticated,addExpense);
router.put("/update/:id",isAuthenticated,updateExpense);
router.delete("/delete/:id",isAuthenticated,deleteExpense);
router.get("/getAll",isAuthenticated,getAllExpenseByMonth);
router.get("/get/:id",isAuthenticated,getSingleExpense)



export default router;