const translator = require('xml-js');

module.exports = (xml) => { 
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

  let result = translator.xml2js(xml, {
    compact: true,
    trim: true,
    ignoreDeclaration: true,
    ignoreInstruction: true,
    ignoreAttributes: true,
    ignoreComment: true,
    ignoreCdata: true,
    ignoreDoctype: true,
    textFn: (value, parentElement) => {
      try {
        let keyNo = Object.keys(parentElement._parent).length;
        let keyName = Object.keys(parentElement._parent)[keyNo - 1];
        parentElement._parent[keyName] = nativeType(value);
      } catch (e) {
        //FIX!
      }
    }
  });
  
  return result;
}