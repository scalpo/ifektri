const request = require('request');

module.exports = (options, payload, next) => {

  let soapRequest = {
    uri: options.url,
    auth: {
      user: options.username,
      pass: options.password,
      sendImmediately: true
    },
    method: 'POST',
    headers: {
      'SOAPAction': '"' + options.soapAction + '"',
      'Content-Type': 'text/xml; charset="utf-8"'
    },
    body: payload
  };

  request(soapRequest, function(error, response, body) {
		if (error) {
			console.log('REQUEST ERROR::\n\n', JSON.stringify(error));
			console.log('RESPONSE FROM SERVER::\n\n', JSON.stringify(response));
		}

		console.log('RESPONSE::' + body + '\n');
		
		//if (error || response.statusCode !== 200)
		//	return next(nseError('AIF NSE Error' || error || body));

		// var parsedResult = xml2json.parser(body, true);
		// var nseResponse = parsedResult['s%3aenvelope']['s%3abody']['nseresponse'] || {};
		// var nseFaultReason = 'unknown';
  });
}