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

              //process instruction
              requestProcessor.processInstruction((processingErr, processResult, status) => {

                if (processingErr || !processResult) {
                  return requestProcessor.respond(res, 500, processingErr);
                }

                status = status || 200;
                
                return requestProcessor.respond(res, status, processResult);
                
              }); //requestProcessor.processInstruction()
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
  readInstructionType: (req, res) => {
    db.getInstructionType(req.params.type, (err, instructionType) => {
      if (err) return res.status(500).json({ reason: 'Invalid or empty type encountered' });

      if (!instructionType) return res.status(404).json({ reason: 'Invalid or empty type specified.' });

      try {
        const processorClass = require('./processor/' + instructionType.name);

        const processorInstance = new processorClass(req); 

        if (!processorInstance) return res.status(404).json({ reason: 'Processor source missing, or compilation error.' });

        instructionType.schema = processorInstance.describe() || 'No schema information found';

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
}