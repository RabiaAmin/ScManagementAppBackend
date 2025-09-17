import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { createInvoice, updateInvoice, deleteInvoice, getInvoice, getAllInvoice ,getWeeklyStatements ,getOrdersPerProduct} from "../controller/invoiceController.js";


const router = express.Router();

router.post("/create",isAuthenticated,createInvoice);
router.put("/update/:id",isAuthenticated,updateInvoice);
router.delete("/delete/:id",isAuthenticated,deleteInvoice);
router.get("/get/:id",isAuthenticated,getInvoice);
router.get("/getAllOfThisMonth",isAuthenticated,getAllInvoice);
router.get("/weekly-statements", isAuthenticated,getWeeklyStatements);
router.get("/getOrdersPerProduct",isAuthenticated,getOrdersPerProduct)


export default router;