// processors/confirmMNO_BL.js

const ifektri = require('../ifektri');
const aeon = require('../integration/aeonSwitch');
  
module.exports = class confirmMNO_BL extends ifektri.base {

  describe() {
    return super.describe({
      //"confirmMNO_BL" request schema...
      network: {
        type: 'string',
        required: true,
        //default: 'Vodacom',
        enum: [
          'CellC',
          'MTN',
          'TelkomMobile',
          'VirginMobile',
          'Vodacom'
        ]
      },
      recipient: {
        type: 'string',
        required: true
      }
    });
  }

  // authenticate(next) {
  //   this.debug.authenticate = 'confirmMNO_BL.authenticate TRUE';
  //   next(null, true);
  // }

  // validateRequest(next) {
  //   let request = this.req.body;

  //   ifektri.validateSchema(request, this.describe(), (validationErr, result) => {
  //     this.debug.validateRequest = `request received, cellNo = ${request.recipient} and MNO = ${request.network}`;

  //     next(null, result);
  //   });
  // }

  authorize(next) {
    this.debug.authorize = 'confirmMNO_BL.authorize TRUE';
    next(null, true);
  }

  processInstruction(next) {

    aeon.validateMNO({ mno: 'MTN', cellNo: '0736549000' }, (err, data) => {

      if (err) {
        this.debug.processInstruction = err;
        return next({ reason: err });
      }

      this.debug.processInstruction = 'confirmMNO_BL worked ok-ish...';

      let request = this.req.body.request;

      next(null, 'confirmMNO_BL.js performed magnificently...  [PROPERTY1=' + (request.property1 || 'n\a') + ', PROPERTY2=' + (request.property2 || 'n\a') + ']');
    });    
  }
}