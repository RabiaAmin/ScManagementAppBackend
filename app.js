import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from "cookie-parser";
import fileUpload from 'express-fileupload';
import connectDB from './database/dbConnection.js';
import { errorMiddleware } from './middleware/Error.js';
import userRoute from './routes/userRoute.js';
import businessRoute from './routes/businessRoute.js';
import clientRoute from './routes/clientRoute.js';
import invoiceRoute from './routes/invoiceRoute.js';
import expenseCategoryRoute from './routes/expenseCategoryRoute.js';
import expenseRoute from './routes/expenseRoute.js';
import bankAccountRoute from './routes/bankAccountRoute.js';
import bookTransactionRoute from './routes/bookTransactionRoute.js';

// express() creates a function that is both for  handles requests and a container for middleware and routes. 
const app = express();

const nodeEnv = process.env.NODE_ENV || "development";
dotenv.config({ path: `./config/.env.${nodeEnv}` });

app.use(cors({
    origin: [process.env.FRONTEND_URL],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,

}))

// cookieParser() is a middleware that parses cookies attached to the client request object.
app.use(cookieParser());
// express.json() is a middleware that parses incoming requests with JSON payloads.
app.use(express.json());
// express.urlencoded() is a middleware that parses incoming requests with urlencoded payloads.
app.use(express.urlencoded({ extended: true }));

// fileUpload() is a middleware that allows file uploads in the request.
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
}));

//this is the route for user-related operations.

app.use("/api/v1/user",userRoute);
app.use("/api/v1/business",businessRoute);
app.use("/api/v1/client",clientRoute);
app.use("/api/v1/business/invoice",invoiceRoute);
app.use('/api/v1/expenseCategory', expenseCategoryRoute);
app.use('/api/v1/expense', expenseRoute);
app.use('/api/v1/bankAccount',bankAccountRoute);
app.use('/api/v1/bankTransaction',bookTransactionRoute);




connectDB();

app.use(errorMiddleware);






export default app;