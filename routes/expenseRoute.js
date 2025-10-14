import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { addExpense , updateExpense , deleteExpense , getAllExpenseByMonth} from "../controller/expenseController.js";

const router = express.Router();

router.post("/add",isAuthenticated,addExpense);
router.put("/update/:id",isAuthenticated,updateExpense);
router.delete("/delete/:id",isAuthenticated,deleteExpense);
router.get("/getAll",isAuthenticated,getAllExpenseByMonth);



export default router;