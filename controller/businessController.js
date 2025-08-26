import { catchAsyncErrors } from "../middleware/CatchAsynErrors.js";
import ErrorHandler from "../middleware/Error.js";
import { BusinessInfo } from "../model/business.model.js";


// creatBusiness
// updateBusiness
// getBusiness
//   name: { type: String, required: true },   // Sanya Clothing
//   vatNumber: { type: String },
//   registrationNumber: { type: String },
//   address: { type: String },
//   phone: { type: String },
//   fax: { type: String },
//   email: { type: String },


export const creatBusiness = catchAsyncErrors(async (req, res, next) => {
  const { name, vatNumber, phone, address, ckNumber,fax ,email ,telPhone} = req.body;

  const business = await BusinessInfo.create({
    name,
    email,
    phone,
    telPhone,
    address,
    vatNumber,
    ckNumber,
    fax,
  });



  res.status(201).json({
    success: true,
    message: "Business created successfully",
    business,
  });
});

export const updateBusiness = catchAsyncErrors(async (req,res,next)=>{
 
  const { name, vatNumber, phone, address, ckNumber,fax ,email ,telPhone} = req.body;
  let business = await BusinessInfo.findOne();
  if(!business){
    return next(new ErrorHandler("Any Business not found ",404));
  }
  business.name = name || business.name;
  business.email = email || business.email; 
  business.phone = phone || business.phone;
  business.telPhone = telPhone || business.telPhone;
  business.address = address || business.address;
  business.vatNumber = vatNumber || business.vatNumber;
  business.ckNumber = ckNumber || business.ckNumber;
  business.fax = fax || business.fax;
  await business.save();

 
  res.status(200).json({
    success: true,
    message: "Business updated successfully",
    business,

})
    
});

export const getBusiness = catchAsyncErrors(async (req, res, next)=>{
  const business = await BusinessInfo.findOne();
  if(!business){
    return next(new ErrorHandler("Business not found",404));
  }

  res.status(200).json({
    success: true,
    business,
})
    
});  



