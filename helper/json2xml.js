const translator = require('xml-js');

module.exports = (json) => {
  //function nativeType... https://github.com/nashwaan/xml-js/issues/53
  let nativeType = (value) => {
    let nValue = Number(value);
    if (!isNaN(nValue)) {
      return nValue;
    }
    let bValue = value.toLowerCase();
    if (bValue === 'true') {
      return true;
    } else if (bValue === 'false') {
      return false;
    }
    return value;
  }

  let result = translator.js2xml(json, {
    compact: true,
    ignoreComment: true,
    spaces: 0
  });
  
  //console.log('converted from JSON to XML', result);
  return result;
}