class AutomatonError {
  constructor(message) {
    this.message = message;
    this.stack = new Error().stack; // Optional
  }
}
AutomatonError.prototype = Object.create(Error.prototype);

class InvalidParamsError {
  constructor(message) {
    this.message = message;
    this.stack = new Error().stack; // Optional
  }
}
InvalidParamsError.prototype = Object.create(Error.prototype);


export {InvalidParamsError, AutomatonError}