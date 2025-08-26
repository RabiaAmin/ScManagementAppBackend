import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { creatBusiness ,updateBusiness ,getBusiness} from "../controller/businessController.js";


const router = express.Router();

router.post("/create",isAuthenticated,creatBusiness);
router.put("/update",isAuthenticated,updateBusiness);
router.get("/get",isAuthenticated,getBusiness);


export default router;