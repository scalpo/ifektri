
/*!
* Start Bootstrap - SB Admin v6.0.0 (https://startbootstrap.com/templates/sb-admin)
* Copyright 2013-2020 Start Bootstrap
* Licensed under MIT (https://github.com/BlackrockDigital/startbootstrap-sb-admin/blob/master/LICENSE)
*/



  
(function($) {
  'use strict';

  //loads and sets the content into main div
  var loadContent = function(menuItem, forceLoad, onpopstate) {

    //check if state set and not the same
    var currentStateContent = window.history.state ? window.history.state.content : 'nothingSelectedYet';

    var content = typeof menuItem === 'string' ? (menuItem || '') : menuItem.content;

    if (forceLoad || currentStateContent != content) {

      //load content
      $.get(content, function(data) {

        if (!onpopstate) {   
          window.history.pushState(menuItem, menuItem.text, "?c=" + content.replace('.html', ''));
        }

        $('#mainContent').html(data);
      });
    }
  }

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

  //get queryString param by name
  var urlParam = function(name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results == null) {
      return 0;
    }
    return results[1] || 0;
  }

  //load content from qs  
  var qsContent = urlParam('c');

  //event for state change
  window.onpopstate = function(event) {
    if (event && event.state) {
      loadContent(event.state, true, true);
    }
  };

  //load and populate menu item
  $.get('menu.json', function(menuItems) {

    var loaded = false;

    $.each(menuItems, function(ctr, menuItem) {

      var $menuItem = '';
      var glyphHTML = menuItem.glyph ? '<div class="sb-nav-link-icon"><i class="' + menuItem.glyph + '"></i></div>' : '';

      switch (menuItem.type) {

        case 'divider':
          $menuItem = $('<div class="sb-sidenav-menu-heading">' + menuItem.text + '</div>');
          break;
        case 'list':
          var id = menuItem.text.replace(' ', '') + '_' + (new Date()).getTime();

          $menuItem = $('<a class="nav-link collapsed" href="#" data-toggle="collapse" data-target="#collapse' + id + '" aria-expanded="false" aria-controls="collapse' + id + '">' + glyphHTML + menuItem.text + '<div class="sb-sidenav-collapse-arrow"><i class="fas fa-angle-down"></i></div></a><div class="collapse" id="collapse' + id + '" aria-labelledby="headingOne" data-parent="#sidenavAccordion"><nav class="sb-sidenav-menu-nested nav"></nav></div></a>');

          $.each(menuItem.items, function(c, subMenuItem) {
            var $subMenuItem = $('<a class="nav-link" href="#">' + subMenuItem.text + '</a>');
            $subMenuItem.data('menu', subMenuItem);
            $menuItem.children('.sb-sidenav-menu-nested').append($subMenuItem);

            if (subMenuItem.content && !loaded) {
              if (subMenuItem.content.replace('.html', '') === qsContent) {
                loaded = true;
                loadContent(subMenuItem, true, true);
              } else if (subMenuItem.default && !qsContent) {
                loaded = true;
                loadContent(subMenuItem, true, false);
              }
            }
          });

          break;
        case 'link':
        default:
          $menuItem = $('<a class="nav-link" href="#">' + glyphHTML + menuItem.text + '</a>');
          break;
      }

      $menuItem.data('menu', menuItem);
      $('#menu').append($menuItem);

      if (menuItem.content) {
        if (menuItem.content.replace('.html', '') === qsContent && !loaded) {
          loaded = true;
          loadContent(menuItem, true, true);
        } else if (menuItem.default && !loaded) {
          loaded = true;
          loadContent(menuItem, true, false);
        }
      }

    });   //foreach

    if (!loaded) {
      loadContent(qsContent + '.html', true, true);
    }

    $('a.nav-link').on('click', function(e) {
      
      var $this = $(this);
      var menuItem = $this.data('menu') || {};

      e.preventDefault();
      if (!$this.data('toggle') && menuItem.content) {
        loadContent(menuItem);
      }
    });
  });

})(jQuery);


