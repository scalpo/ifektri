const request = require('request');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db.sqlite3');
const dateFormat = 'dd/MM/yyyy HH:mm:ss fff';

const rowIdOffSet = 99999999;
const biject = require('bijective-link-shortener');
biject.setAlphabet('scalpoWqIHFRe!.-01928U7465');

module.exports = {
  initDB: () => {
    db.run('CREATE TABLE IF NOT EXISTS instructionType (id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE, description TEXT NOT NULL, enabled INTEGER NOT NULL DEFAULT 1)');

    db.run('CREATE TABLE IF NOT EXISTS instruction (id INTEGER PRIMARY KEY, type TEXT NOT NULL, requestDate TEXT, request TEXT NOT NULL, responseDate TEXT, response TEXT, status INTEGER)');
    
    db.run('CREATE TABLE IF NOT EXISTS subscription (id INTEGER PRIMARY KEY, requestId TEXT NOT NULL, type TEXT NOT NULL, subscribeDate TEXT NOT NULL, callbackURL TEXT NOT NULL)');

    db.get('SELECT * FROM instructionType WHERE name = "ifektri_createInstructionType" OR name = "demo_test"', [], function(err, row) {

      if (err) return console.log('DB doesn\'t exist yet. restart this server to create it...');

      if (!row) {

        db.run('INSERT INTO instructionType (name, description, enabled) VALUES ("ifektri_createInstructionType", "Registers a new instruction type", 1), ("demo", "Demo processor", 1), ("buyAirtime_BL", "buy airtime BLUE LABEL", 0), ("carLicenseQuote", "Quaote for vehicle license renewal", 0)');

        return console.log('\nifektri processors registered, restart server until this message disappears :)');
      }
    });    
  },
  getInstructionType: (type, next) => {
    db.get('SELECT * FROM instructionType WHERE name = ?', [type], function(err, row) {
      if (err) return next(err);
      return next(null, row);
    });
  },
  searchProcessor: (options, next) => {
    //FIX! WHERE name = ?
    db.all('SELECT * FROM instructionType', [], function(err, rows) {
      return next(err, rows);
    });
  },
  processorExists: (type, next) => {

    let data = {
      $name: type
    };

    db.get('SELECT * FROM instructionType WHERE name = $name', data, function(err, row) {
      if (err) return next(err);
      return next(null, !(row == null || typeof row === 'undefined'));
    });
  },
  insertProcessor: (processor, next) => {

    let data = {
      $name: processor.name,
      $description: processor.description,
      $enabled: false  //processor.enabled
    };

    db.run('INSERT INTO instructionType (name, description, enabled) VALUES ($name, $description, $enabled)', data, function(err) {
      if (err) return next(err);

      processor.id = this.lastID;
      next(null, processor);
    });
  },
  updateProcessor: (name, processor, next) => {

    let data = {
      $name: name || processor.name,
      $description: processor.description || undefined,
      $enabled: processor.enabled || 0
    };

    db.run('UPDATE instructionType SET description = $description, enabled = $enabled WHERE name = $name', data, function(err) {
      if (err) return next(err);

      next(null, {
        name: name || processor.name,
        description: processor.description || undefined,
        enabled: processor.enabled || 0
      });
    });
  },
  insertSubscription: (subscription, next) => {
    let data = {
      $requestId: subscription.requestId || 'requestId',
      $type: subscription.type || 'requestType',
      $subscribeDate: subscription.subscribeDate || 'requestDate',
      $callbackURL: subscription.callbackURL || 'callbackURL'
    };

    db.run('INSERT INTO subscription (requestId, type, subscribeDate, callbackURL) VALUES ($requestId, $type, $subscribeDate, $callbackURL)', data, function(err) {
      if (err) return next(err);

      next(null, subscription);
    });
  },
  searchSubscription: (options, next) => {

    let data = {
      $requestId: options.requestId,
      $type: options.type
    }

    db.all('SELECT * FROM subscription WHERE ( ($requestId is null and 0=0) || ($requestId is not null and requestId = $requestId) ) and ( ($type is null and 0=0) || ($type is not null and type = $type) )', data, function(err, rows) {
    
      let result = rows.map(row => {
        row.requestId = biject.encode(row.id + rowIdOffSet);
        row.subscribeDate = new Date(parseInt(row.subscribeDate)).toString(dateFormat);
        row.requestDate = new Date(parseInt(row.requestDate)).toString(dateFormat);
        row.responseDate = new Date(parseInt(row.responseDate)).toString(dateFormat);
        delete row.id;
        return row;
      });
      
      return next(err, result);
    });
  },
  persistRequest: (req, next) => {

    let data = {
      $type: req.body.name || 'a',
      $date: +new Date(),
      $body: JSON.stringify(req.body) || 'b'
    };

    let callbackURL = req.body.callbackURL;

    db.run('INSERT INTO instruction (type, requestDate, request) VALUES ($type, $date, $body)', data, function(err) {

      if (err) return next(err);

      let requestId = biject.encode(this.lastID + rowIdOffSet);

    // //register callback
    // if (callbackURL && require('./ifektri').isValidURL(callbackURL)) {

    //   let newSubscription = {
    //     requestId: requestId,
    //     type: req.body.name,
    //     subscribeDate: +new Date(), //.toString(dateFormat),
    //     callbackURL: callbackURL
    //   };

//         module.exports.insertSubscription(newSubscription, (subscribeErr, subscription) => {
// console.log('yes callback and persisted ', subscribeErr, subscription);
//           if (subscribeErr) {
//             //do we return? do we retry? i suggest just logging the error
//             return next(subscribeErr);
//           }
//         });
      
//       } else {
// console.log('not calling back !!! ', callbackURL);         
//       }

      next(null, requestId);
    });
  },
  persistResponse: (requestId, response, status, next) => {

    let data = {
      $id: biject.decode(requestId) - rowIdOffSet,
      $date: +new Date(),
      $response: JSON.stringify(response),
      $status: status
    };

    db.run('UPDATE instruction SET response = $response, responseDate = $date, status = $status WHERE id = $id', data, function(err) {
      if (err) return next(err);

      //process callbacks if any
        module.exports.searchSubscription({ requestId: requestId }, (subscriptionErr, subscriptions) => {

          if (subscriptionErr || subscriptions.callbackURL) {
console.log('no callback specified... NOT CALLING BACK');
          } else {
            subscriptions.forEach((subscription) => {
              
              console.log('calling back ====>', subscription.callbackURL, JSON.stringify(response));               
              //do the callback
              request({
                uri: subscription.callbackURL,
                method: 'POST',
                headers: {
                  'x-ifektrirequest-id': requestId,
                  'x-ifektrirequest-status': 'status',
                  'Content-Type': 'application/json; charset="utf-8"'
                },
                body: JSON.stringify({
                  requestId: requestId,
                  links: this.req && this.req.headers ? this.HATEOASLink(this.req.headers.host, requestId) : [],
                  result: response,
                  status: status
                })
              },
              function (error, response, body) {
                //this line needs refactoring
                if (error) {
                  return console.error('callback failed!', error);
                }
              });  
            });
          }

          //res.status(status).json(result);
            //return result;
     
        });

      return next(null, response);    
    });
  },
  getRequest: (requestId, next) => {

    let recordId = -1;

    try
    {
      recordId = biject.decode(requestId) - rowIdOffSet;
    }
    catch (e) {
      recordId = 0;
    }

    db.get('SELECT * FROM instruction WHERE id = ?', [recordId], function(err, row) {
      if (row && recordId > 0) {       
        
        delete row.id;
        row.requestDate = new Date(parseInt(row.requestDate)).toString(dateFormat);
        row.responseDate = new Date(parseInt(row.responseDate)).toString(dateFormat);
        row.requestId = requestId;

      } else {

        row = {
          requestDate: new Date().toString(dateFormat),
          request: null,
          responseDate: new Date().toString(dateFormat),
          response: null,
          status: 404,
          requestId: null
        }
      }

      return next(err, row);
    });
  },
  updateRequest: (requestId, response, status, next) => {

    module.exports.persistResponse(requestId, response, status, next);

    // next = next || function(e, d) {};

    // let data = {
    //   $id: biject.decode(requestId) - rowIdOffSet,
    //   $status: status,
    //   $response: response,
    //   $responseDate: +new Date()
    // };

    // db.run('UPDATE instruction SET status = $status, response = $response, responseDate = $responseDate WHERE name = $name WHERE id = $id', data, function(err) {
    //   if (err) return next(err);

    //   next(null, {
    //     name: name || processor.name,
    //     description: processor.description || undefined,
    //     enabled: processor.enabled || 0
    //   });
    // });
  },
  searchRequest: (options, next) => {

    let data = {
      $type: options.type
    }

    db.all('SELECT * FROM instruction WHERE ( ($type is null and 0=0) || ($type is not null and type = $type) )', data, function(err, rows) {
  
      let result = rows.map(row => {
        row.requestId = biject.encode(row.id + rowIdOffSet);
        row.requestDate = new Date(parseInt(row.requestDate)).toString(dateFormat);
        row.responseDate = new Date(parseInt(row.responseDate)).toString(dateFormat);
        delete row.id;
        return row;
      });
      
      return next(err, result);
    });
  }
};