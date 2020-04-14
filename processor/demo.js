
const ifektri = require('../ifektri');
const api = require('../helper/api');

module.exports = class demo extends ifektri.base {
  

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

  description() {
    return 'Demo';
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

    //here we search duckduckgo for ...
    let request = this.req.body.request;
    
    api.api('get', 'https://api.duckduckgo.com/?q=' + request.testMessage + '&format=json', null, {}, (err, result) => {
      console.log(err, result);
      
      if (err) {
        next({ message: 'FAIL' });
      } else {

        next(null, JSON.parse(result.RelatedTopics), 200);
      }
    });
  }
}