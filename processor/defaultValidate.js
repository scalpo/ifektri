const ifektri = require('../ifektri');

module.exports = class defaultValidate extends ifektri.base {
  
  describe() {
    return super.describe({
      //NO INPUTS
    });
  }

  description() {
    return super.description('defaultValidate');
  }

  authenticate(next) {
    this.debug.authenticate = 'defaultValidate.authenticate TRUE';
    next(null, true);
  }

  //validateRequest(next) {
  // deliberately removed the code for this ABILITY
  // the default ifektri authenticate step takes care of this!
  //}

  authorize(next) {
    this.debug.authorize = 'defaultValidate.authorize TRUE';

    //this ability will always authorize true
    next(null, true);
  }

  processInstruction(next) {
    next(null, 'defaultValidate said "Please vist again :) and have a great day further"', 200);
  }
}