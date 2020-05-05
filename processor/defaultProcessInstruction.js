const ifektri = require('../ifektri');

module.exports = class defaultProcessInstruction extends ifektri.base {
  
  describe() {
    return super.describe({
      //NO INPUTS
    });
  }

  description() {
    return super.description('defaultProcessInstruction');
  }

  authenticate(next) {
    this.debug.authenticate = 'defaultAuthorize.authenticate TRUE';
    next(null, true);
  }

  validateRequest(next) {
      this.debug.validateRequest = 'defaultProcessInstruction.validateRequest TRUE';  

      //this ability will always validate true
      return next(null, true);    
  }

  authorize(next) {
    this.debug.authorize = 'defaultProcessInstruction.authorize TRUE';

    //this ability will always authorize true
    next(null, true);
  }

  //processInstruction(next) {
  // deliberately removed the code for this ABILITY
  // the default ifektri authenticate step takes care of this!
  //}
}