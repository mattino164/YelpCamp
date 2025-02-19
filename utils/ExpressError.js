class ExpressError extends Error {
    constructor(message, statusCode) {
      // Calls the constructor of the parent class (Error)
    super();
    
    // Sets custom properties
    this.message = message;
    this.statusCode = statusCode;
    }
  }
  
  module.exports = ExpressError;