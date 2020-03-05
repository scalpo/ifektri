const ifektri = require('../ifektri');
const api = require('../helper/api');

const getCountryCode = (cellNo) => {

  let result = 'ZA';

  //see http://mcc-mnc.com/
  switch ((cellNo || '27').substring(0, 2)) {
    case '+91':
      result = 'IN';
    case '':
    default:
      result = 'ZA';
      break;
  }

  return result;
}

module.exports = {
  validateCellNo: (cellNo, next) => {
    //FIX! templating
    api.get('http://apilayer.net/api/validate?access_key=a42efd5cb201e25fb6515568b5bb306c&format=1&country_code=ZA&number=834790743', null, (err, result) => {
      next(err, result);
    });
  }
}
