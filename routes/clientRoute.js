import express from "express";
import { isAuthenticated } from "../middleware/auth.js";


const router = express.Router();

router.post("/add",isAuthenticated,addClient);
router.put("/update/:id",isAuthenticated,updateClient);
router.delete("/delete/:id",isAuthenticated,deleteClient);
router.get("/get/:id", isAuthenticated, getClient);
router.get("/getAll",isAuthenticated,getAllClient);



export default router;