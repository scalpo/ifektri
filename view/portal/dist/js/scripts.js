/*!
* Start Bootstrap - SB Admin v6.0.0 (https://startbootstrap.com/templates/sb-admin)
* Copyright 2013-2020 Start Bootstrap
* Licensed under MIT (https://github.com/BlackrockDigital/startbootstrap-sb-admin/blob/master/LICENSE)
*/
(function($) {
  'use strict';

  // Add active state to sidbar nav links
  var path = window.location.href; // because the 'href' property of the DOM element is the absolute path
  $('#layoutSidenav_nav .sb-sidenav a.nav-link').each(function() {
    if (this.href === path) {
      $(this).addClass('active');
    }
  });

  // Toggle the side navigation
  $('#sidebarToggle').on('click', function(e) {
    e.preventDefault();
    $('body').toggleClass('sb-sidenav-toggled');
  });

  api('GET', '/admin/instructionType', null, function(a, b) {
    console.log(b);
  });

  api('GET', 'https://ifektri-1--ifektriifu.repl.co/admin/instructionType', {}, function(a, b) {
    console.log(b);
  });

  $('a.nav-link').on('click', function(e) {
    e.preventDefault();
    if(!$(this).data('toggle')) {
      console.log('replace content');

      var $content = $('<div class="text-muted">' + new Date() + '</div>');

      $('#mainContent').append($content);
    }
  });

})(jQuery);
