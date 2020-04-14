const ifektri = require('../ifektri');
const db = require('../db');
const fs = require('fs');

const getHTML = (name) => {
  name = name || 'instructionProcessor22';

  return `<!DOCTYPE html><html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <title>${name} page</title>
  </head>
  <body>

    <h1>${name}</h1>
    
    <div id="main" />
    
    <script src="https://code.jquery.com/jquery-2.2.4.js"></script>
    <script>
    $(document).ready(function() {
      console.log('your page is ready...');
    });
    </script>
  </body>
</html>`
}

const getJS = (name, description) => {
  name = name || 'instructionProcessor22';

  return `// processors/${name}.js



////////////////////////
// SEARCH AND REPLACE "\\n", "\n" (click the regex button) 
////////////////////////

const ifektri = require('../ifektri');
  
module.exports = class ${name} extends ifektri.base {

  describe() {
    return super.describe({
      //ifektri capability
      // - ${description}
      //
      //"${name}" request schema...
      property1: {
        type: 'string',
        required: true
      },
      property2: {
        type: 'boolean',
        required: false
      } //, etc
    });
  }

  description() {
    return '${description}';
  }

  authenticate(next) {
    this.debug.authenticate = '${name}.authenticate TRUE';
    next(null, true);
  }

  validateRequest(next) {
    ifektri.validateSchema(this.req.body, this.describe(), (validationErr, validationResult) => {
      this.debug.validateRequest = '${name}.validateRequest ' + (validationResult ? 'TRUE' : 'FALSE');
      next(null, validationResult);
    });
  }

  authorize(next) {
    this.debug.authorize = '${name}.authorize TRUE';
    next(null, true);
  }

  processInstruction(next) {
    this.debug.processInstruction = '${name}.processInstruction TRUE';

    let request = this.req.body.request;

    next(null, '${name}.js performed magnificently...  [PROPERTY1=' + (request.property1 || 'n\\a') + ', PROPERTY2=' + (request.property2 || 'n\\a') + ']');
  }
}`;
}

module.exports = class ifektri_createInstructionType extends ifektri.base {

  describe() {
    return super.describe({
      //"ifektri_createInstructionType" request schema...
      name: {
        type: 'string',
        required: true,
        minLength: 6,
        maxLength: 50
      },
      description: {
        type: 'string',
        required: true,
        maxLength: 200
      },
      enabled: {
        type: 'boolean',
        default: false
      }
    });
  }

  description() {
    return 'ifektri capability registration';
  }

  authenticate(next) {
    this.debug.authenticate = 'ifektri_createInstructionType.authenticate TRUE';
    next(null, true);
  }

  validateRequest(next) {
    //check if exists
    db.processorExists(this.req.body.request.name, (getProcessorErr, processorExists) => {
      if (getProcessorErr || processorExists) return next('Instruction type already exists');

      this.debug.validateRequest = 'ifektri_createInstructionType.validateRequest TRUE';
      next(null, true);      
    });
  }

  authorize(next) {
    this.debug.authorize = 'ifektri_createInstructionType.validateRequest TRUE';
    next(null, true);
  }

  processInstruction(next) {
    //create
    db.insertProcessor(this.req.body.request, (insertProcessorErr, processor) => {

      let processorName = this.req.body.request.name;
      let processorDescription = this.req.body.request.description;

      if (insertProcessorErr || !processor) return next('Processor type already exists');
      this.debug.processInstruction = 'ifektri_createInstructionType.processInstruction TRUE';

      //pass URL
      //poo

      processor.processorTemplate = {
        js: getJS(processorName, processorDescription).toString()
      };

      if (false) {
        //generate source
        fs.writeFile('./processors/' + processorName + '.js', getJS(processorName).toString(), (err) => {
          if (err) return next(err);
        });

        //create view
        if (!fs.existsSync('./web/' + processorName)) {
          fs.mkdirSync('./web/' + processorName);
          fs.writeFile('./web/' + processorName + '/index.html', getHTML(processorName).toString(), (err) => {
            if (err) return next(err);
          });
        }
      }

      next(null, processor);
    });
  }
}