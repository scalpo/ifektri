// processors/guessMyAge.js
const ifektri = require('../ifektri');
  
module.exports = class guessMyAge extends ifektri.base {

  describe() {
    return super.describe({
      //\"guessMyAge\" request schema...
      yourName: {
        type: 'string',
        required: true
      }
    });
  }

  description() {
    return super.description('Guess my age');
  }

  authenticate(next) {
    this.debug.authenticate = 'guessMyAge.authenticate TRUE';
    next(null, true);
  }

  validateRequest(next) {
    ifektri.validateSchema(this.req.body, this.describe(), (validationErr, validationResult) => {
      this.debug.validateRequest = 'guessMyAge.validateRequest ' + (validationResult ? 'TRUE' : 'FALSE');
      next(null, validationResult);
    });
  }


  processInstruction(next) {
    //this is the operate block
    //this is where we add the logic that affects the response

    this.debug.processInstruction = 'guessMyAge.processInstruction TRUE';

    let request = this.req.body.request;

    let randomAge = Math.random(20.2);

    //for now, just trust me that the next() method returns the response
    next(null, request.yourName + ', guessMyAge predicts ypu will live ' + randomAge + ' more moons (of saturn)...');
  }
}
