
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

  $.get('menu.json', function(menuItems) {

    $.each(menuItems, function(ctr, menuItem) {

      var $menuItem = '';
      var glyphHTML = menuItem.glyph ? '<div class="sb-nav-link-icon"><i class="' + menuItem.glyph + '"></i></div>' : '';

      switch (menuItem.type) {
        case 'divider':
          $menuItem = $('<div class="sb-sidenav-menu-heading">' + menuItem.text + '</div>');
          break;
        case 'link':
          $menuItem = $('<a class="nav-link" id="sidebarLinkDashboard" href="#">' + glyphHTML + menuItem.text + '</a>');
          if (menuItem.content) {
            $menuItem.on('click', function(e) {
              e.preventDefault();
              if(!$(this).data('toggle')) {
                $.get(menuItem.content, function(data) {
                  $('#mainContent').html(data);
                });
              }
            });
          }
          break;
        case 'list':
          var id = menuItem.text.replace(' ', '') + '_' + (new Date()).getTime();

          $menuItem = $('<a class="nav-link collapsed" href="#" data-toggle="collapse" data-target="#collapse' + id + '" aria-expanded="false" aria-controls="collapse' + id + '">' + glyphHTML + menuItem.text + '<div class="sb-sidenav-collapse-arrow"><i class="fas fa-angle-down"></i></div></a><div class="collapse" id="collapse' + id + '" aria-labelledby="headingOne" data-parent="#sidenavAccordion"><nav class="sb-sidenav-menu-nested nav"></nav></div></a>');

          //this allows menu items of type 'list' to also load content
          if (menuItem.content) {
            $menuItem.on('click', function(e) {
              e.preventDefault();
              //if(!$(this).data('toggle')) {
                $.get(menuItem.content, function(data) {
                  $('#mainContent').html(data);
                });
              //}
            });
          }

          $.each(menuItem.items, function(c, subMenuItem) {
            var $subMenuItem = $('<a class="nav-link" href="#">' + subMenuItem.text + '</a>');

            if (subMenuItem.content) {
              $subMenuItem.on('click', function(e) {
                e.preventDefault();
                if(!$(this).data('toggle')) {
                  $.get(subMenuItem.content, function(data) {
                    $('#mainContent').html(data);
                  });
                }
              });
            }
            
            $menuItem.children('.sb-sidenav-menu-nested').append($subMenuItem);
          });
          break;
      }

      $('#menu').append($menuItem);
    });
  });
})(jQuery);
