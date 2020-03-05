const request = require('request');

const api = (verb, url, payload, options, next) => {

  let startTime = +new Date();
  let endTime;
  let timeElapsed;

  let req = {
    uri: url,
    // auth: {
    //   user: options.username,
    //   pass: options.password,
    //   sendImmediately: true
    // },
    method: verb,
    headers: options.headers,
    body: payload
  };

  request(req, (error, response, body) => {

    if (error) {
      endTime = +new Date();
      timeElapsed = endTime - startTime;
      console.log('API\n\t' + verb.toUpperCase() + ' ' + req.uri + '\n\t*** FAILURE [after ' + timeElapsed + 'ms]', JSON.stringify(err, null, 2), '\n\t request:', JSON.stringify(payload, null, 2));
      return next(err, null);
    }

    apiTime = new Date();
    endTime = +new Date();
    timeElapsed = endTime - startTime;

    if (options.debug) {
      if (verb.toUpperCase() == 'GET') {
        console.log('API\n\t' + verb.toUpperCase() + ' ' + path + '\n\t<<< response [after ' + timeElapsed + 'ms] :', JSON.stringify(response, null, 2));
      } else {
        console.log('API\n\t' + verb.toUpperCase() + ' ' + path + '\n\t>>> request:', JSON.stringify(payload, null, 2), '\n\t<<< response [after ' + timeElapsed + 'ms] :', JSON.stringify(response, null, 2));
      }
    } else {
      if (verb.toUpperCase() == 'GET') {
        console.log('API\n\t' + verb.toUpperCase() + ' ' + req.uri + '\n\t<<< response [after ' + timeElapsed + 'ms] (' + (JSON.stringify(response.body) || '').length + ' bytes)');
      } else {
        console.log('API\n\t' + verb.toUpperCase() + ' ' + path + '\n\t>>> request (size ' + (JSON.stringify(payload) || '').length + ' bytes)\n\t<<< response  [after ' + timeElapsed + 'ms] (size ' + (JSON.stringify(response.body) || '').length + ' bytes)');
      }
    }

    apiTime = new Date();

    next(null, response.body);
  });
}

module.exports = {
  api: api,
  get: (path, payload, next) => {
    api('GET', path, payload, {}, next);
  },
  post: (path, payload, next) => {
    api('POST', path, payload, {}, next);
  },
  put: (path, payload, next) => {
    api('PUT', path, payload, {}, next);
  }
};
