import app from './app.js';



// handling requests
app.listen(process.env.PORT, () => {
  console.log(`'Server is running on port ${process.env.PORT}'`);
});