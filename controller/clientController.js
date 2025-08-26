import { catchAsyncErrors } from "../middleware/CatchAsynErrors.js";
import ErrorHandler from "../middleware/Error.js";
import { ClientCollection } from "../model/client_collection.model.js";


// addClient

// updateClient, deleteClient,getClient,getAllClient

//   name: { type: String, required: true },
//   vatNumber: { type: String },
//   registrationNumber: { type: String },
//   address: { type: String },
//   phone: { type: String },
//   fax: { type: String },
//   email: { type: String },


export const addClient = catchAsyncErrors(async (req, res, next) => {
  const { name, email, phone ,address, telphone ,registrationNumber,vatNumber,fax, } = req.body;



  const client = await ClientCollection.create( {
   name,
    email,
    phone,
    telphone,
    registrationNumber,
    vatNumber,
    fax,
    address

  });



  res.status(201).json({
    success: true,
    message: "Client added successfully",
    client,
  });
}
);

export const updateClient = catchAsyncErrors(async (req,res,next)=>{

   const {id} = req.params;

   const updatedClient = {
    name:req.body.name,
    email:req.body.email,
    phone:req.body.phone,
    telphone:req.body.telphone,
    registrationNumber:req.body.registrationNumber,
    vatNumber:req.body.vatNumber,
    fax:req.body.fax,
    address:req.body.address
   };

    const client = await ClientCollection.findByIdAndUpdate(id,updatedClient,{
      new:true,
      runValidators:true,
    });

    if(!client){
      return next(new ErrorHandler("Client not found",404));
    }

    res.status(200).json({
      success:true,
      message:"Client updated successfully",
      client,
    })

});

export const deleteClient = catchAsyncErrors(async (req,res,next)=>{

  const {id} = req.params;

  const client = await ClientCollection.findByIdAndDelete(id);

  if(!client){
    return next(new ErrorHandler("Client not found",404));
  }

  res.status(200).json({
    success:true,
    message:"Client deleted successfully",
    client,
  })

});

export const getClient = catchAsyncErrors(async (req,res,next)=>{

  const {id} = req.params;

  const client = await ClientCollection.findById(id);

  if(!client){
    return next(new ErrorHandler("Client not found",404));
  }

  res.status(200).json({
    success:true,
    client,
  })

});

export const getAllClient = catchAsyncErrors(async (req,res,next)=>{

  const clients = await ClientCollection.find();

  res.status(200).json({
    success:true,
    clients,
  })

});