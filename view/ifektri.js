$.fn.focusField = function($el) {
  $(this)
    .css('background-color', 'red')
    .fadeTo(100, 0.5, function() { 
      $(this)
        .fadeTo(500, 0.8)
        .css('background-color', 'white');
    })
    .focus();
}

$.fn.makeEditable = function(next) {
  //https://stackoverflow.com/questions/1224729/using-jquery-to-edit-individual-table-cells
  $(this).on('click', function() {
    if($(this).find('textarea').is(':focus')) return this;
    var cell = $(this);
    var content = $(this).html();
    $(this).html('<textarea cols="40" rows="8">' + $(this).html() + '</textarea>')
      .find('textarea')
      .trigger('focus')
      .on({
        'blur': function(){
          $(this).trigger('closeEditable');
        },
        'keyup': function(e) {
          if(e.which == '13'){ // enter
            $(this).trigger('saveEditable');
          } else if(e.which == '27'){ // escape
            $(this).trigger('closeEditable');
          }
        },
        'closeEditable': function() {
          cell.html(content);
        },
        'saveEditable':function(){
          content = $(this).val();
          $(this).trigger('closeEditable');
          if (next && typeof next === 'function')
            next(content);
        }
    });
  });
  return this;
}

function api(verb, path, payload, callback) {

  var showPayloadInConsole = false;
  var startTime = +new Date();
  var endTime;
  var timeElapsed;
  
  //FIX! auto serialize querystring if payload is specified...
  /*if (verb.toUpperCase() == 'GET' && payload) {
    url += '?' + $.param(payload);
    payload = null;
  }*/

  var ajaxOptions = {
    url: path.startsWith('http') ? path : window.location.protocol + '//' + window.location.host + '//' + path, //'../' + path,
    type: verb,
    //cache: (payload.$cache || false),
    data: payload,
    success: function (response) {
      apiTime = new Date();
      endTime = +new Date();
      timeElapsed = endTime - startTime;

      if (showPayloadInConsole) {
        if (verb.toUpperCase() == 'GET') {
          console.log('API\n\t' + verb.toUpperCase() + ' ' + path + '\n\t<<< response [after ' + timeElapsed + 'ms] :', JSON.stringify(response, null, 2));
        } else {
          console.log('API\n\t' + verb.toUpperCase() + ' ' + path + '\n\t>>> request:', JSON.stringify(payload, null, 2), '\n\t<<< response [after ' + timeElapsed + 'ms] :', JSON.stringify(response, null, 2));
        }
      } else {
        if (verb.toUpperCase() == 'GET') {
          console.log('API\n\t' + verb.toUpperCase() + ' ' + path + '\n\t<<< response [after ' + timeElapsed + 'ms] (' + (JSON.stringify(response) || '').length + ' bytes)');
        } else {
          console.log('API\n\t' + verb.toUpperCase() + ' ' + path + '\n\t>>> request (size ' + (JSON.stringify(payload) || '').length + ' bytes)\n\t<<< response  [after ' + timeElapsed + 'ms] (size ' + (JSON.stringify(response) || '').length + ' bytes)');
        }
      }

      apiTime = new Date();
  
      callback(null, response);
    },
    error: function (err) {
      endTime = +new Date();
      timeElapsed = endTime - startTime;
      //FIX! hide busy
      console.log('API\n\t' + verb.toUpperCase() + ' ' + path + '\n\t*** FAILURE [after ' + timeElapsed + 'ms]', JSON.stringify(err, null, 2), '\n\t request:', JSON.stringify(payload, null, 2));
      callback(err, null);
    }
  };
  
  $.ajax(ajaxOptions);
}

function collectionTable(collection) {
  var $table = $('<table border="1" width="100%"></table>');

  if (collection && ($.isArray(collection) && collection.length > 0)) {
    
    //header it hard
    var headerHTML = '<thead><tr>';
    for (var property in collection[0]) {
      headerHTML += '<td><strong>' + property + '</strong></td>';
    }
    headerHTML += '</tr></thead>';
    $table.append(headerHTML);

    //row it harder
    var $body = $('<tbody></tbody>');
    $.each(collection, function(index, collectionItem) {
      var tr = '<tr valign="top">';
      for (var collectioName in collectionItem) {    
        tr += '<td>' + collectionItem[collectioName] + '</td>';
      }
      tr += '</tr>';
      var $tr = $(tr).data('record', collectionItem);
      $($body).append($tr);
    });
  }
  $table.append($body);

  return $table;
}

function editObjectTable(object) {
  var $table = $('<table border="1" width="100%"><thead><tr /></thead><tbody><tr /></tbody></table>');

  $table.data('record', object);
  
  var $headingTR = $table.find('thead > tr');
  for(var key in object) {
    $headingTR.append('<td><strong>' + key + '</strong></td>');
  }

  var $bodyTR = $table.find('tbody > tr');
  for(var key in object) {
    $bodyTR.append('<td><textarea type="text" id="' + key + '">' + object[key] + '</textarea></td>');
  }

  $bodyTR.find('textarea').blur(function() {
    object[$(this).attr('id')] = $(this).val();
    $table.data('record', object);
  });

  return $table;
}
