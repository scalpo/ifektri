const net = require('net');

module.exports = {

  request: (options, message, next) => {

    options.port = options.port ? options.port : 22;
    options.host = options.host ? options.host : '127.0.0.1';

    try {
      
      // let request = translator.js2xml(message, {compact: true, ignoreComment: true, spaces: 0}) + '\n';

      const client = new net.Socket();
      client.connect(options.port, options.host, () => {
      
        console.log(`\n=====================================\n\n${new Date()} TCP REQUEST => \n ${message} \n`);

        client.write(message);      //send message
      });

      client.on('data', (response) => {
        client.destroy(); // kill client after server's response

        console.log(`\n=====================================\n\n${new Date()} TCP RESPONSE <= \n ${response.toString('utf8')} \n`);

        return next(null, response.toString('utf8'));
      });

      client.on('close', function() {
        console.log(`\n=====================================\n\n${new Date()} CONNECTION CLOSED \n`);
      });
    }
    catch (e) {
      return next(e.Message);
    }  
  }
}