
//this file is responsible for generating JWT tokens and sending them in the response
export const generateToken = (user, message, statusCode, res) => {
    const token = user.generateJsonWEbToken();
  
    res.status(statusCode)
       .cookie("token", token, {
           expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
           httpOnly: true,
           secure: false,
           sameSite: "Lax",
       })
       .json({
           success: true,
           message,
           token,
           user
       });
};