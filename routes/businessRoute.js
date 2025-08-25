import express from "express";
import { isAuthenticated } from "../middleware/auth.js";


const router = express.Router();

router.post("/create",creatBusiness);
router.put("/update",isAuthenticated,updateBusiness);
router.get("/get",isAuthenticated,getBusiness);


export default router;