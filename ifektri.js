const db = require('./db');
const mschema = require('mschema');
const request = require('request');

let ifektri = module.exports = {
  HATEOASLink: (host, ref) => {
    return [{
      rel: 'self',
      href: 'https://' + host + '/api/instruction/' + ref
    },
    {
      rel: 'item',
      href: 'https://' + host + '/api/instruction/' + ref + '/item'
    }];
  },
  xml2json: require('./helper/xml2json'),
  json2xml: require('./helper/json2xml'),
  tcp: require('./helper/tcp'),
  udp: require('./helper/udp'),
  soapRequest: require('./helper/soap'),
  isValidURL: (url) => {
     let regex = '^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$';
return true;
     return url.length < 2083 && (new RegExp(regex, 'i').test(url) || new RegExp(regex, 'i').test('http://' + url) || new RegExp(regex, 'i').test('https://' + url));
  },
  initProcessor: (req, next) => {

    //parse body 
    if (req === null || typeof req === 'undefined') {
      return next('Invalid or empty request specified');
    }

    if (req.body.name === null || typeof req.body.name === 'undefined') {
      return next('Invalid instruction type specified');
    }

    //load processor
    db.getInstructionType(req.body.name, (err, instructionType) => {

      if (err || !instructionType || instructionType.enabled !== 1) return next('Invalid instruction type or processor disabled');

      //req.ifektri.instructionType = instructionType.name;

      let processorClass = require('./processor/' + instructionType.name);

      processorClass.debug = {
        instructionType: instructionType.name
      };

      if (!processorClass) return next('Failed to load processor');

      return next(null, processorClass);
    });
  },
  validateSchema: (data, schema, next) => {

    let schemaValidation = mschema.validate(data, schema, { strict: true });

    if (schemaValidation && schemaValidation.errors && schemaValidation.errors.length > 0) return next(schemaValidation.errors);

    next(null, schemaValidation.valid);
  },
  base: class InstructionProcessor {

    constructor(req, requestId) {
      this.req = req;
      this.requestId = requestId;
      this.debug = {
        date: new Date()
      }
    }

    HATEOASLink(host, ref) {
      let result = ifektri.HATEOASLink(this.req.headers.host, this.requestId); 

      return result;
    }

    respond(res, status, response) {

      let result = response;

      result = {
        requestId: this.requestId,
        links: this.HATEOASLink(this.req.headers.host, this.requestId),
        result: response,
        status: status
      };

      if (this.req.query.debug === '1') {
        result.debug = this.debug;
      }

      //update response
      db.persistResponse(this.requestId, response, status, (err, dbResult) => {

//         //process callbacks if any
//         db.searchSubscription({ requestId: this.requestId }, (subscriptionErr, subscriptions) => {

//           if (subscriptionErr || subscriptions.callbackURL) {
// console.log('no callback specified... NOT CALLING BACK');
//           } else {
//             subscriptions.forEach((subscription) => {
              
//               console.log('calling back ====>', subscription.callbackURL, JSON.stringify(response));               
//               //do the callback
//               request({
//                 uri: subscription.callbackURL,
//                 method: 'POST',
//                 headers: {
//                   'x-ifektrirequest-id': this.requestId,
//                   'x-ifektrirequest-status': 'status',
//                   'Content-Type': 'application/json; charset="utf-8"'
//                 },
//                 body: JSON.stringify(result)
//               },
//               function (error, response, body) {
//                 //this line needs refactoring
//                 if (error) {
//                   return console.error('callback failed!', error);
//                 }
//               });  
//             });
//           }

//           res.status(status).json(result);
//             return result;

//   //         
//         });
        res.status(status).json(result);
      });

      //res.status(status).json(result);
      //return result;
    }

    describe(innerRequest) {

      var schema = {
        name: this.constructor.name,
        request: {
          required: true,
          type: 'any'
        },
        callbackURL: {
          type: 'string',
          required: false
        }
      };

      if (innerRequest) {
        schema.request = innerRequest;
      }

      return schema;
    }
    
    authenticate(next) {
      this.debug.authenticate = 'ifektri.authenticate TRUE';
      next(null, true);
    }

    validateRequest(next) {
      // was... ifektri.validateSchema(this.req.body.request, 
      ifektri.validateSchema(this.req.body, this.describe(), (err, valid) => {     
        if (err) return next(err);
        this.debug.validateRequest = 'ifektri.validateRequest ' + valid;
        next(null, true);
      });
    }

    authorize(next) {   
      this.debug.authorize = 'ifektri.authenticate TRUE';
      next(null, true);
    }

    processInstruction(next) {
      return next(null, {
        fyi: 'ifektri.processInstruction TRUE'
      });
    }
  }
}
