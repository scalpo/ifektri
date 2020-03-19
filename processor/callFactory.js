// processors/callFactory.js

const ifektri = require('../ifektri');
  
module.exports = class callFactory extends ifektri.base {

  describe() {
    return super.describe({
      //\"callFactory\" request schema...
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
    this.debug.authenticate = 'callFactory.authenticate TRUE';
    next(null, true);
  }

  validateRequest(next) {
    ifektri.validateSchema(this.req.body, this.describe(), (validationErr, validationResult) => {
      this.debug.validateRequest = 'callFactory.validateRequest ' + (validationResult ? 'TRUE' : 'FALSE');
      next(null, validationResult);
    });
  }

  authorize(next) {
    this.debug.authorize = 'callFactory.authorize TRUE';
    next(null, true);
  }

  processInstruction(next) {
    this.debug.processInstruction = 'callFactory.processInstruction TRUE';

    let request = this.req.body.request;

    console.log(this.res);

    next(null, 'callFactory.js performed magnificently...  [PROPERTY1=' + (request.property1 || 'n\\a') + ', PROPERTY2=' + (request.property2 || 'n\\a') + ']');
  }
}
