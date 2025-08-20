import express from "express";
import {register,login,logout,getUser,profileUpdate,updatePassword,forgotPassword,resetPassword} from "../controller/userController.js"
import { isAuthenticated } from "../middleware/auth.js";


const router = express.Router();

router.post("/register",register);
router.post("/login",login);
router.get("/logout",logout);
router.get("/getUser" , isAuthenticated, getUser);
router.put("/update/profile",isAuthenticated,profileUpdate);
router.put("/update/pawssord",isAuthenticated,updatePassword);
router.post("/password/forgot",forgotPassword);
router.put("/password/reset/:token",resetPassword);

export default router;