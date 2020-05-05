const ifektri = require('../ifektri');

module.exports = class defaultIdentifyRequester extends ifektri.base {
  
  describe() {
    return super.describe({
      //NO INPUTS
    });
  }

  description() {
    return super.description('defaultIdentifyRequester');
  }

  //authenticate(next) {
  // deliberately removed the code for this ABILITY
  // the default ifektri authenticate step takes care of this!
  //}

  validateRequest(next) {
      this.debug.validateRequest = 'defaultIdentifyRequester.validateRequest TRUE';  

      //this ability will always validate true
      return next(null, true);    
  }

  authorize(next) {
    this.debug.authorize = 'defaultIdentifyRequester.authorize TRUE';

    //this ability will always authorize true
    next(null, true);
  }

  processInstruction(next) {
    next(null, 'defaultIdentifyRequester said "Please vist again :) and have a great day further"', 200);
  }
}