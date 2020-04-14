// processors/buyAirtime_BL.js

const ifektri = require('../ifektri');
const aeon = require('../integration/aeonSwitch');
const db = require('../db');
  
module.exports = class buyAirtime_BL extends ifektri.base {

  describe() {
    return super.describe({
      //"buyAirtime_BL" request schema...
      network: {
        type: 'string',
        required: true,
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

  description() {
    return 'Buy AIR TIME';
  }

  // authenticate(next) {
  //   this.debug.authenticate = 'buyAirtime_BL.authenticate TRUE';
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
    this.debug.authorize = 'buyAirtime_BL.authorize TRUE';
    next(null, true);
  }

  processInstruction(next) {

    //aeon.buyAirtime({ mno: 'MTN', cellNo: '0736549000' }, (err, data) => {
    aeon.productList({ mno: 'MTN', cellNo: '0736549000' }, (err, data) => {

      if (err) {
        this.debug.processInstruction = err;
        return next({ reason: err });
      }

      this.debug.processInstruction = 'buyAirtime worked';

      let request = this.req.body.request;

      let finalResponse = data;
      finalResponse.processedLater = true;

      //for demo purposes...
      setTimeout(() => {

        db.updateRequest(this.requestId, finalResponse, 201, () => {});

        //respond(res, status, response)
      }, 1000 * 15);

      next(null, 'buyAirtime_BL.js performed magnificently... [response=' + (JSON.stringify(data) || 'n\a') + ']', 202);
    });    
  }
}