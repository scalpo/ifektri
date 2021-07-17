const ifektri = require('../ifektri');
  
module.exports = class calculateDaysLeftOnEarth extends ifektri.base {

  describe() {
    return super.describe({
      //ifektri capability
      // - this enables one to check the departure date (going to heaven, i downloaded directions)
      //
      //"calculateDaysLeftOnEarth" request schema...
      property1: {
        type: 'string',
        required: true
      },
      property2: {
        type: 'boolean',
        required: false
      } //, etc
    });
  }

  description() {
    return super.description('this enables one to check the departure date (going to heaven, i downloaded directions)');
  }

  authenticate(next) {
    this.debug.authenticate = 'calculateDaysLeftOnEarth.authenticate TRUE';
    next(null, true);
  }

  validateRequest(next) {
    ifektri.validateSchema(this.req.body, this.describe(), (validationErr, validationResult) => {
      this.debug.validateRequest = 'calculateDaysLeftOnEarth.validateRequest ' + (validationResult ? 'TRUE' : 'FALSE');
      next(null, validationResult);
    });
  }

  authorize(next) {
    this.debug.authorize = 'calculateDaysLeftOnEarth.authorize TRUE';
    next(null, true);
  }

  processInstruction(next) {
    this.debug.processInstruction = 'calculateDaysLeftOnEarth.processInstruction TRUE';

    let request = this.req.body.request;

    next(null, 'calculateDaysLeftOnEarth.js performed magnificently...  [PROPERTY1=' + (request.property1 || 'n\a') + ', PROPERTY2=' + (request.property2 || 'n\a') + ']');
  }
}