function showProcessors() {
  api('GET', 'admin/instructionType', null, function(err, processors) {
    if (err || !processors || typeof processors === 'undefined') {
      return alert('sorry that didn\'t work. in a perfect world the endpoint should have returned relevant/expected results.\n\nan error occurred "' + (err || 'No processors found') + '"');
    }

    var $processors = collectionTable(processors);

    //create update description view
    $processors.find('tbody > tr > td:nth-child(3)').click(function() {

      var $td = $(this);
      var processorInfo = $td.parent().data('record');

      $td.makeEditable(function(updatedText) {
        if (updatedText && updatedText.length > 0) {
          var payload = processorInfo;
          payload.description = updatedText;

          api('PUT', 'admin/instructionType/' + processorInfo.name, payload, function(updateErr, data) {
            if (updateErr) {
              $td.html(processorInfo.description)
              return alert('Failed to update "' + (updateErr.Message || 'No processors found') + '"');
            }
          });
        }
      });
    });

    //describe processor
    $processors.find('tbody > tr > td:nth-child(2)').click(function() {
      var $td = $(this);
      var processorInfo = $td.parent().data('record');

      if (processorInfo && $td.children().length === 0) {

        api('GET', 'admin/instructionType/' + processorInfo.name, null, function(describeErr, data) {
          if (describeErr) {       
            return alert('Failed to describe processor "' + (describeErr.Message || 'Processor or source not found') + '"');
          }

          $td.append('<br/><textarea cols="40" rows="8">' + JSON.stringify(data.schema, null, 2) + '</textarea>');
        });
      }
    });

    //update enabled/disabled flag
    $processors.find('tbody > tr > td:nth-child(4)').click(function() {

      var $td = $(this);
      var processorInfo = $td.parent().data('record');

      if (processorInfo) {

        var payload = processorInfo;
        processorInfo.enabled = (payload.enabled || 0) ? 0 : 1;

        //update enabled
        api('PUT', 'admin/instructionType/' + processorInfo.name, payload, function(updateErr, data) {

          if (updateErr) {
            return alert('Failed to update "' + (updateErr.Message || 'No processors found') + '"');
          }

          processorInfo.enabled = (processorInfo.enabled || 0) ? 1 : 0;

          $td.html(processorInfo.enabled);
        });
      }
    });

    $('#main').html($processors)
  })
}

function showInstructions() {
  api('GET', 'admin/instruction', null, function(err, instructions) {

    if (err || !instructions || typeof instructions === 'undefined') {
      return alert('sorry that didn\'t work. in a perfect world the endpoint should have returned relevant/expected results.\n\nan error occurred "' + (err || 'No instructions found') + '"');
    }
    
    /*$('#main')
      .html('<code>' + instructions
      .result.processorTemplate.js
      .replace(/\n/g, '<br />')
      .replace(/  /g, '&nbsp;&nbsp;') + '</code>');
    */

    //console.log('sss', err, instructions);
  });
}

function createProcessor() {

  var $createProcessor = editObjectTable({
    name: '',
    description: '',
    //enabled: 'true'
  });

  var $button = $('<button>CREATE</button>');

  $button.click(function() {
    
    var newProcessor = {
      name: 'ifektri_createInstructionType',
      request: $createProcessor.data('record'),
      callbackUrl: 'https://requestwhore--scalpo.repl.co/ifektri'
    }

    api('POST', 'api/instruction', newProcessor, function(err, processor) {

      if (err || !processor || typeof processor === 'undefined') {
        return alert('sorry that didn\'t work. in a perfect world the endpoint should have returned relevant/expected results.\n\nan error occurred "' + (err.Message || 'Processors not created') + '"');
      }

      if (processor && processor.result.id) {
        $('#main').html('<code>' + processor
                                        .result.processorTemplate.js
                                        .replace(/\n/g, '<br />')
                                        .replace(/  /g, '&nbsp;&nbsp;') + '</code>');
      } else {
        $('#main').html('<textarea>' + JSON.stringify(err, null, 2) + '</textarea>')  
      }

      //$('#availableProcessors').click();
    });
  });

  $('#main').html($createProcessor).append($button);
}

function createRequest() {

  var $table = $('<table class="table table-hover table-sm table-striped"><thead><tr><th><strong>name</strong></th><th><strong>request/payload</strong></th></tr></thead><tbody><tr valign="top"><td><div id="processor" /><br /><pre id="schema" /><td><div id="request" /><div id="requestOptions" /></td></tbody></table>');

  //get available instruction types
  api('GET', 'admin/instructionType', null, function(err, processors) {

    if (err || !processors || typeof processors === 'undefined') {
      return alert('sorry that didn\'t work. in a perfect world the endpoint should have returned relevant/expected results.\n\nan error occurred "' + (err || 'No processors found') + '"');
    }

    var $selectProcessor = $('<select id="availableProcessors"><option value="-1">-- select --</option></select>');

    $selectProcessor.change(function() {

      var selectedProcessorName = this.value;
      if (selectedProcessorName === '-1') {
        $table.find('#schema').html('');
        $table.find('#request').html('');
        return;
      }

      //get the selected processor details
      api('GET', 'admin/instructionType/' + selectedProcessorName, null, function(describeErr, data) {
        if (describeErr) {       
          return alert('Failed to describe processor "' + (describeErr.Message || 'Processor or source not found') + '"');
        }

        $table
          .find('#schema')
          .html('<p><strong>input schema</strong></p>' + JSON.stringify(data.schema, null, 2));


        $table
          .find('#request')
          .html('<textarea cols="80" rows="15">' + JSON.stringify(data.schema, null, 2) + '</textarea><br />');

        var $submitButton = $('<button>SUBMIT</button>');
        var $includeDebug = $('<div><input type="checkbox" id="debug">Include debug info<br/></div>');
        var $retryButton = $('<button>RETRY</button>');

        $submitButton.click(function() {

          var $requestTextArea = $('#request textarea');
          var newRequest = $requestTextArea.val();

          //attach request to retry button
          $retryButton.data('newRequest', newRequest);

          try {
            var json = JSON.parse(newRequest);
            if (!json || !newRequest || newRequest === '') {
              $requestTextArea.focusField();
              return;
            }
          } 
          catch {
            $requestTextArea.focusField();
            return;
          }

          var url = 'api/instruction?debug=' + ($('#debug').prop('checked') ? '1' : '');

          api('POST', url, JSON.parse(newRequest), function(submitErr, result) {

            if (!submitErr && !result) {
              return alert('sorry that didn\'t work. in a perfect world the endpoint should have returned relevant/expected results.\n\nan error occurred...');
            }

            var instructionResult = '<div><h2>REQUEST</h2><pre>' + newRequest + '</pre><h2>RESPONSE</h2><pre>' + (JSON.stringify((result || submitErr.responseJSON), null, 2) || 'darn it :(') + '</pre></div>';

            $('#request')
              .html(instructionResult);

            $retryButton.show();
            $submitButton.hide();
            $includeDebug.hide();
          });
        });

        $retryButton.click(function() {
          $table
            .find('#request')
            .html('<textarea cols="80" rows="15">' + JSON.stringify(JSON.parse($retryButton.data('newRequest')), null, 2) + '</textarea><br />');

          $retryButton.hide();
          $includeDebug.show();
          $submitButton.show();
        });

        $table
          .find('#request')
          .html('<textarea cols="80" rows="15">' + JSON.stringify(data.schema, null, 2) + '</textarea><br />');

        //ddd;

        $retryButton.hide();
      
        $('#requestOptions')
          .html($submitButton)
          .append('<br/>')
          .append($includeDebug)
          .append($retryButton);
      });
    });

    if ($.isArray(processors) && processors.length > 0) {
      $.each(processors, function(index, processor) {
        if (processor.enabled === 1) {
          $selectProcessor.append('<option value="' + processor.name + '">' + processor.name + ' (' + processor.description + ')</option>');
        }
      });
    }
    
    $table
      .find('#processor')
      .html($selectProcessor);
    
    $('#main').html($table);
  });
}

function excuteTests() {

  var $table = $('<table border="1" width="100%"><thead><tr><td><strong>name</strong></td><td><strong>request/payload</strong></td></tr></thead><tr valign="top"><td><div id="processor" /><br /><pre id="schema" /><td id="request" /></table>');

  //get available instruction types
  api('GET', 'admin/instructionType', null, function(err, processors) {
    alert('k')
  });
}

$(document).ready(function() {
  $('#submitRequest').click(createRequest);
  $('#listTypes').click(showProcessors);
  $('#listInstructions').click(showInstructions);
  $('#createType').click(createProcessor);
  $('#executeTests').click(excuteTests);
});
