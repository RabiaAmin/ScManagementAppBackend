import { User } from "../model/user.model.js";
import { catchAsyncErrors } from "./CatchAsynErrors.js";
import ErrorHandler from "./Error.js";
import jwt from "jsonwebtoken";

//this middleware checks if the user is authenticated by verifying the JWT token stored in cookies.
// If the token is valid, it retrieves the user from the database and attaches it to the request object.
// If the token is invalid or not present, it returns an error response.
export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  console.log("JWT Token:", token); // debug
  if (!token) {
    return next(new ErrorHandler("User Not Authenticated!", 400));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  if (!decoded._id) {
    return next(new ErrorHandler("Invalid token payload", 401));
  }
  req.user = await User.findById(decoded._id);

  if (!req.user) {
    return next(new ErrorHandler("User not found", 404));
  }
  next();
});