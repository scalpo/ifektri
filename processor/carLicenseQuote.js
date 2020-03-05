// processors/carLicenseQuote.js

const ifektri = require('../ifektri');

module.exports = class carLicenseQuote extends ifektri.base {

  describe() {
    return super.describe({
      //"carLicenseQuote" request schema...
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

  authenticate(next) {
    this.debug.authenticate = 'carLicenseQuote.authenticate TRUE';
    next(null, true);
  }

  validateRequest(next) {
    ifektri.validateSchema(this.req.body, this.describe(), (validationErr, validationResult) => {
      this.debug.validateRequest = 'carLicenseQuote.validateRequest ' + (validationResult ? 'TRUE' : 'FALSE');
      next(null, validationResult);
    });
  }

  authorize(next) {
    this.debug.authorize = 'carLicenseQuote.authorize TRUE';
    next(null, true);
  }

  processInstruction(next) {
    this.debug.processInstruction = 'carLicenseQuote.processInstruction TRUE';

    let request = this.req.body.request;

    next(null, 'carLicenseQuote.js performed magnificently...  [PROPERTY1=' + (request.property1 || 'n\a') + ', PROPERTY2=' + (request.property2 || 'n\a') + ']');
  }
}