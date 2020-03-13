// processors/search for a chef.js

const ifektri = require('../ifektri');

module.exports = class searchForAChef extends ifektri.base {
  describe() {
    return super.describe({
      //\"search for a chef\" request schema...
      property1: {''},
      property2: {
        type: 'boolean',
        required: false
      } //, etc
    });
  }
  
  authenticate(next) {
    this.debug.authenticate = 'search for a chef.authenticate TRUE';
    next(null, true);
  }
  
  validateRequest(next) {
    ifektri.validateSchema(this.req.body, this.describe(), (validationErr, validationResult) => {
      this.debug.validateRequest = 'search for a chef.validateRequest ' + (validationResult ? 'TRUE' : 'FALSE');
      next(null, validationResult);
    });
  }
            
  authorize(next) {
    this.debug.authorize = 'search for a chef.authorize TRUE';
    next(null, true);
  }
  
  processInstruction(next) {
    this.debug.processInstruction = 'search for a chef.processInstruction TRUE';
    let request = this.req.body.request;
    next(null, 'search for a chef.js performed magnificently...  [PROPERTY1=' + (request.property1 || 'n\\a') + ', PROPERTY2=' + (request.property2 || 'n\\a') + ']');
  }
}