import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
// express() creates a function that is both for  handles requests and a container for middleware and routes. 
const app = express();
dotenv.config({path: './config/.env'});

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






export default app;