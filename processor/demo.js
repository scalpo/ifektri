
const ifektri = require('../ifektri');
const numverify = require('../integration/numverify');
const mysql = require('mysql');

module.exports = class demo extends ifektri.base {
  
  // authenticate(next) {
  //   this.debug.authenticate = 'demo.authenticate TRUE';
  //   next(null, true);
  // }

  xHATEOASLink(host, ref) {
    
    let result = super.HATEOASLink(host, ref);

    result.push({ 
      info: 'this is specific for the demo processor',
      rel : 'linkOfDestruction', 
      href: 'www.doom.net/forYou' 
    });

    return result;
  }

  describe() {

    return super.describe({
      //"demo" request schema...
      testMessage: {
        type: 'string',
        required: true
      },
      malea: {
        type: 'string',
        required: false
      }
    });
  }

  validateRequest(next) {

    ifektri.validateSchema(this.req.body, this.describe(), (validationErr, validationResult) => {

      this.debug.validateRequest = 'demo.validateRequest ' + (validationResult ? 'TRUE' : 'FALSE');  

      return next(validationErr, validationResult);
    });
  }

  // authorize(next) {
  //   this.debug.authorize = 'demo.authorize TRUE';
  //   next(null, true);
  // }

  processInstruction(next) {




    
    //http://rest.mymobileapi.com/v1/Authentication

//i-pivot-271014:us-central1:ifektri

let connection = mysql.createConnection({
  host     : '34.69.132.111',
  user     : 'root',
  password : 'kwagga1KWAGGA!',
  database : 'mm'
});
 
connection.connect();
 
connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
  if (error) 
    console.log('err', error);
  else
    console.log('The solution is: ', results[0].solution);
});
 
connection.end();


    let request = this.req.body.request;

    if (request.malea === 'yes') {
      next(null, { malea: 'isQueen' });
    }

    if (request.testMessage === '200') {
      this.debug.processInstruction = 'returning 200';
      next(null, { testMessageReceived: '200 she said' }, 200);
    } else {
      this.debug.processInstruction = 'returning create';
      next(null, { message: 'success' }, 201);
    }
  }
}