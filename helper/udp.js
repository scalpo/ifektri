const client = require('dgram').createSocket('udp4');

module.exports = (options, message, next) => {

  options.port = options.port ? options.port : 8089;
  options.host = options.host ? options.host : '127.0.0.1';

  try {
    let payload = new Buffer(message);

    client.send(payload, 0, payload.length, options.port, options.host);

    next(null, true);     //fire and forget

  } catch (e) {
    return next(e.Message);
  }
}