const ifektri = require('../ifektri');
const net = require('net');

const hostName = '196.35.114.100';
const port = '7896';
const userPin = '011234';
const deviceId = '49310';
const deviceSerialNo = 'NEDTEST1!';

let previousHandler = () => {}

const parseResponse = (response, next) => {
  response = response ? ifektri.xml2json(response).response : null;

  if (response && response.event.EventCode === 0) {
    return next(null, response);
  } else {
    return next(response.data || 'Unknown error');
  }
}

const openClient = (options, next) => {

  options.port = options.port ? options.port : 22;
  options.host = options.host ? options.host : '127.0.0.1';
  options.timeout = options.timeout ? options.timeout : 5000;

  try {
    const client = new net.Socket();
      
    client.connect(options.port, options.host, () => {
      console.log(`\n=====================================\n\n${new Date()} TCP CONNECTION OPEN => \n\n`);

      next(null, client);
    });
  }
  catch (e) {
    return next(e.Message);
  }  
}

const closeClient = (client) => {
  console.log(`\n=====================================\n\n${new Date()} TCP CONNECTION CLOSED => \n\n`);
  client.destroy();  
}

const sendMessage = (client, message, next) => {

  client.removeListener('data', previousHandler);

  previousHandler = (response) => {
    console.log(`\n=====================================\n\n${new Date()} TCP RESPONSE <= \n ${response.toString('utf8')} \n`);

    console.log(response.toString('utf8'));

    //try {
      response = response ? ifektri.xml2json(response).response : null;

      if (response && response.event.EventCode === 0) {
        return next(null, response);
      } else {
        return next(response.data || 'Unknown error');
      }

    //} catch (e) {
    //  return next('Unknown error :(');
    //}
  }

  client.on('data', previousHandler);
  
  console.log(`\n=====================================\n\n${new Date()} TCP REQUEST => \n ${message} \n`);
  client.write(message);      //send message
}

module.exports = {
  buyAirtime: (options, next) => {

    options.mno = !options.mno ? 'Vodacom' : options.mno;

    let sessionRequest = ifektri.json2xml({
      request: {
        EventType: 'Authentication',
        event: {
          UserPin: userPin,
          DeviceId: deviceId,
          DeviceSer: deviceSerialNo,
          TransType: options.mno,
          Reference: 'reference'
        }
      }
    }) + '\n';

    openClient({ host: hostName, port: port }, (clientErr, client) => {      
      if (clientErr) return next(clientErr);

      sendMessage(client, sessionRequest, (sessionErr, session) => {
        if (sessionErr) {
          closeClient(client);
          return next(sessionErr);
        }

        if (!session.SessionId) {
          closeClient(client);
          return next('Failed to authenticate!');
        }

        let mnoValidationRequest = ifektri.json2xml({
          request: {
            SessionId: session.SessionId,
            EventType: 'MNOValidation',
            event: {
              Reference: 'reference',
              PhoneNumber: options.cellNo,
              Amount: '10.0',
              ProductCode: 0
            }
          }
        }) + '\n';

        sendMessage(client, mnoValidationRequest, (mnoValidationErr, mnoValidation) => {
          if (mnoValidationErr) {
            closeClient(client);
            return next(mnoValidationErr);
          }

          console.log('mno', mnoValidation);
            
          next(null, mnoValidation);
        });
      });
    });
  },
  productList: (options, next) => {

    options.mno = !options.mno ? 'Vodacom' : options.mno;

    let sessionRequest = ifektri.json2xml({
      request: {
        EventType: 'Authentication',
        event: {
          UserPin: userPin,
          DeviceId: deviceId,
          DeviceSer: deviceSerialNo,
          TransType: 'VodacomBundles',
          Reference: 'reference'
        }
      }
    }) + '\n';

    openClient({ host: hostName, port: port }, (clientErr, client) => {      
      if (clientErr) return next(clientErr);

      sendMessage(client, sessionRequest, (sessionErr, session) => {
        if (sessionErr) {
          closeClient(client);
          return next(sessionErr);
        }

        if (!session.SessionId) {
          closeClient(client);
          return next('Failed to authenticate!');
        }

        let getProductListRequest = ifektri.json2xml({
          request: {
            SessionId: session.SessionId,
            EventType: 'GetProductList',
            event: ''
          }
        }) + '\n';

        sendMessage(client, getProductListRequest, (mnoValidationErr, mnoValidation) => {
          if (mnoValidationErr) {
            closeClient(client);
            return next(mnoValidationErr);
          }

          console.log('mproductno', mnoValidation);
            
          next(null, mnoValidation);
        });
      });
    });
  },
  validateMNO: (options, next) => {

    //options.mno = !options.mno ? 'Vodacom' : options.mno;

    let sessionRequest = ifektri.json2xml({
      request: {
        EventType: 'Authentication',
        event: {
          UserPin: userPin,
          DeviceId: deviceId,
          DeviceSer: deviceSerialNo,
          TransType: options.mno,
          Reference: 'reference'
        }
      }
    }) + '\n';

    openClient({ host: hostName, port: port }, (clientErr, client) => {      
      if (clientErr) return next(clientErr);

      sendMessage(client, sessionRequest, (sessionErr, session) => {
        if (sessionErr) {
          closeClient(client);
          return next(sessionErr);
        }

        if (!session.SessionId) {
          closeClient(client);
          return next('Failed to authenticate!');
        }

        let mnoValidationRequest = ifektri.json2xml({
          request: {
            SessionId: session.SessionId,
            EventType: 'MNOValidation',
            event: {
              Reference: 'reference',
              PhoneNumber: options.cellNo,
              Amount: '10.0',
              ProductCode: 0
            }
          }
        }) + '\n';

        sendMessage(client, mnoValidationRequest, (mnoValidationErr, mnoValidation) => {
          if (mnoValidationErr) {
            closeClient(client);
            return next(mnoValidationErr);
          }

          console.log('mno', mnoValidation);

          next(null, mnoValidation);
        });
      });
    });
  }
}
