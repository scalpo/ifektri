const ifektri = require('./ifektri');
const db = require('./db');

module.exports = {
  createInstruction: (req, res) => {

    //init processor
    ifektri.initProcessor(req, (requestErr, requestProcessorClass) => {

      if (requestErr) {
        return res.status(400).json({ reason: requestErr });
      }

      //persist request/return biject requestId
      db.persistRequest(req, (persistErr, requestId) => {

        if (persistErr) return res.status(500).json({ reason: persistErr });

        const requestProcessor = new requestProcessorClass(req, requestId);

        //register callback
        if (req.body.callbackURL && ifektri.isValidURL(req.body.callbackURL)) {

          let newSubscription = {
            requestId: requestId,
            type: req.body.name,
            subscribeDate: +new Date(),
            callbackURL: req.body.callbackURL
          };

          db.insertSubscription(newSubscription, (subscribeErr, subscription) => {
            if (subscribeErr) {
              //do we return? do we retry? i suggest just logging the error
              //return next(subscribeErr);
              console.log('callback failure ', subscribeErr);
            } else {
              console.log('callback registered ', subscription);
            }
          });
        }

        //authenticate
        requestProcessor.authenticate((authenticationErr, authenticated) => {

          if (authenticationErr || !authenticated) {
            return requestProcessor.respond(res, 405, authenticationErr || 'Authentication failed');
          }

          //validate
          requestProcessor.validateRequest((validationErr, validRequest) => {
            if (validationErr || !validRequest) {
              return requestProcessor.respond(res, 400, validationErr || 'Invalid request');
            }

            //authorize
            requestProcessor.authorize((auhtorizationErr, authorized) => {
              if (auhtorizationErr || !authorized) {
                return requestProcessor.respond(res, 401, auhtorizationErr || 'Unauthorized');
              }

              try
              {
                //process instruction
                requestProcessor.processInstruction((processingErr, processResult, status) => {

                  if (processingErr || !processResult) {
                    return requestProcessor.respond(res, 500, processingErr);
                  }

                  status = status || 200;
                  
                  return requestProcessor.respond(res, status, processResult);
                  
                }); //requestProcessor.processInstruction()
              } catch (e) {
                return requestProcessor.respond(res, 500, { processorError : 'Processor or coding error', exception: e });
              }

            });   //requestProcessor.authorize()
          });     //requestProcessor.validateRequest()
        });       //requestProcessor.authenticate()
      });         //db.persistRequest()
    });           //ifektri.parseRequest()
  },
  searchInstruction: (req, res) => {
    db.searchRequest(req.query, (err, instruction) => {
      if (err) return res.status(500).json({ reason: 'Invalid or empty requestId' });

      if (!instruction) return res.status(404).json({ reason: 'Invalid or empty requestId' }); 

      instruction.map((item) => {
        let result = item;

        item.links = ifektri.HATEOASLink(req.headers.host, item.requestId);

        return item;
      });
      
      return res.status(200).json(instruction);
    });
  },
  readInstruction: (req, res) => {
    db.getRequest(req.params.requestId, (err, instruction) => {

      if (err || !instruction.requestId) return res.status(404).json({ reason: 'Invalid or empty requestId specified' });

      const processorClass = require('./processor/' + instruction.type);  
      const processorInstance = new processorClass(req, req.params.requestId); 

      let links = processorInstance ? processorInstance.HATEOASLink() : ifektri.HATEOASLink(req.headers.host, instruction.requestId);

      //REPLAY
      let result = {
        requestId: instruction.requestId,
        links: links,
        result: JSON.parse(instruction.response),
        status: instruction.status
      };

      return res.status(result.status).json(result);
    });
  },
  readInstructionDetail: (req, res) => {
    db.getRequest(req.params.requestId, (err, instruction) => {

      if (err) return res.status(404).json({ reason: 'Invalid or empty requestId specified' });

      instruction.links = [{
        rel: 'self',
        href: 'https://' + req.headers.host + '/api/instruction/' + req.params.requestId
      }];

      //FIX! include audits here

      return res.status(200).json(instruction);
    });
  },
  identifyRequestor: (req, res, next) => {
    /*
    WHEN REQUESTING FROM SELF HOSTED IFEKTRI VIEW
    headers: {
      referer: 'https://ifektri--scalpo.repl.co/portal2/?c=capabilities',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'x-requested-with': 'XMLHttpRequest'
    }

    WHEN REQUESTING FROM EXTERNAL CLIENT/BROWSER
    headers: {    
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'none',
      'sec-fetch-user': '?1',
      'upgrade-insecure-requests': '1',
    }
    */

    req.ifektri = {
      requestor: 'self'
    };

    // process.env === {
    //   NODE_VERSION: '12.16.2',
    //   HOSTNAME: 'ecf306a6866f',
    //   YARN_VERSION: '1.22.4',
    //   HOME: '/home/runner',
    //   TERM: 'xterm-256color',
    //   PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
    //   NODE_PATH: '/usr/local/lib/node_modules:/home/runner/node_modules',
    //   PWD: '/home/runner/ifektri'
    // }
    next();
  },
  readInstructionType: (req, res) => {
    db.getInstructionType(req.params.type, (err, instructionType) => {
      if (err) return res.status(500).json({ reason: 'Invalid or empty type encountered' });

      if (!instructionType) return res.status(404).json({ reason: 'Invalid or empty type specified.' });

      try {
        const processorClass = require('./processor/' + instructionType.name);

        const processorInstance = new processorClass(req); 

        if (!processorInstance) return res.status(404).json({ reason: 'Processor source missing, or compilation error.' });

        instructionType.description = processorInstance.description();

        instructionType.schema = processorInstance.describe() || 'No schema information found';

        if (req.ifektri.requestor == 'self') {
          //https://blog.ostermiller.org/finding-comments-in-source-code-using-regular-expressions/

          instructionType.authenticateChanged = processorInstance.__proto__.authenticate.toString() !== ifektri.base.prototype.authenticate.toString();
          instructionType.authenticate = processorInstance.authenticate.toString();

          instructionType.validateRequestChanged = processorInstance.__proto__.validateRequest.toString() !== ifektri.base.prototype.validateRequest.toString();
          instructionType.validateRequest = processorInstance.validateRequest.toString();

          instructionType.authorizeChanged = processorInstance.__proto__.authorize.toString() !== ifektri.base.prototype.authorize.toString();
          instructionType.authorize = processorInstance.authorize.toString();

          instructionType.processInstructionChanged = processorInstance.__proto__.processInstruction.toString() !== ifektri.base.prototype.processInstruction.toString();
          instructionType.processInstruction = processorInstance.processInstruction.toString();
        }

        return res.status(200).json(instructionType);

      } catch (e) {
        return res.status(404).json({ reason: 'Processor source missing, or compilation error (' + e + ')' });
      }
    });
  },
  updateInstructionType: (req, res) => {
    var payload = {
      enabled: req.body.enabled || undefined,
      description: req.body.description || undefined
    }

    db.updateProcessor(req.params.type, payload, (updateErr, updatedProcessor) => {

      //console.log('aaaa2', updateErr);
      if (updateErr) return res.status(500).json({ reason: 'Invalid processor specified' });

      return res.status(200).json(updatedProcessor);
    });
  },
  searchInstructionType: (req, res) => {

    db.searchProcessor(req.query, (err, instruction) => {
      if (err) return res.status(500).json({ reason: err });
      return res.status(200).json(instruction);
    });
  },
  searchSubscription: (req, res) => {
    db.searchSubscription(req.query, (err, subscriptions) => {
      if (err) return res.status(500).json({ reason: err });
      return res.status(200).json(subscriptions);
    });
  },
  options: (req, res) => {
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200);
  },
  health: (req, res) => {
    //FIX! ifektri.diagnostics(req.query, (err, subscriptions) => {
      //f (err) return res.status(500).json({ reason: err });
      return res.status(200).json({
        status: "healthy"
      });
    //});
  },
}