import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { addEmployee,updateEmployee, deleteEmployee,getAllEmployee ,getEmployeeDetails} from "../controller/employeeController.js";


const router = express.Router();

router.post("/add",isAuthenticated,addEmployee);
router.put("/update/:id",isAuthenticated,updateEmployee);
router.delete("/delete/:id",isAuthenticated,deleteEmployee);
router.get("/getAll",isAuthenticated,getAllEmployee);
router.get("/get/:id",isAuthenticated,getEmployeeDetails);



export default router;