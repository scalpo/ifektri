const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

const routes = require('./routes');
const db = require('./db');
const config = require('./config');
 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('view'));

//transactional
app.post('/api/instruction', cors(), routes.createInstruction);
app.get('/api/instruction/:requestId', cors(), routes.readInstruction);
app.get('/api/instruction/:requestId/item', routes.readInstructionDetail);

//admin
app.get('/admin/health', routes.health);
app.get('/admin/instruction', routes.searchInstruction);
app.get('/admin/instructionType', cors(), routes.searchInstructionType);
app.get('/admin/instructionType/:type', cors(), routes.readInstructionType);
app.put('/admin/instructionType/:type', routes.updateInstructionType);
app.get('/admin/subscription', routes.searchSubscription);

db.initDB();

app.listen(config.port, () => {
  console.log(`\n\nifektri serving requests on port ${config.port}\n\nor locally on http://127.0.0.1:${config.port}/`);
});
