import mongoose from "mongoose";

const connectDB = () => {

    mongoose.connect(process.env.MONGO_URI,{
        dbName: "SANIACLOTHING",

    }).then(() => {
        console.log("Database connected successfully");
    }).catch((error) => {
        console.error("Database connection failed:", error);
        process.exit(1); 
    });
}

export default connectDB;