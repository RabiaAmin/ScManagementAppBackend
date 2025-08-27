
//this function takes an asynchronous function as an argument and returns a new function that wraps the original function in a Promise.
// If the original function throws an error or returns a rejected Promise, the error is caught and passed to the next middleware in the Express.js chain.
export const catchAsyncErrors = (func) => {
  return (req,res,next) => {
    Promise.resolve(func(req,res,next)).catch(next);
  }
}