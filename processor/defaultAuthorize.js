const ifektri = require('../ifektri');

module.exports = class defaultAuthorize extends ifektri.base {
  
  describe() {
    return super.describe({
      //NO INPUTS
    });
  }

  description() {
    return super.description('defaultAuthorize');
  }

  authenticate(next) {
    this.debug.authenticate = 'defaultAuthorize.authenticate TRUE';

    //this ABILITY will always validate true
    next(null, true);
  }

  validateRequest(next) {
      this.debug.validateRequest = 'defaultAuthorize.validateRequest TRUE';  

      //this ABILITY will always validate true
      return next(null, true);    
  }

  //authorize(next) {
  // deliberately removed the code for this ABILITY
  // the default ifektri authorize process takes care of this! 
  //}

  processInstruction(next) {
    next(null, 'defaultAuthorize said "Please vist again :) and have a great day further"', 200);
  }
}