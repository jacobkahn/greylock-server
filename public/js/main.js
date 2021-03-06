/**
 *  Main controller JS file for the webpages.
 */
$(document).ready(function() {
  var diagnostics = 'Screen dimensions: ' + screen.height + ' x ' + screen.width + '<br/>Viewport dimensions: ' + $(document).height() + ' x ' + $(document).width();
  $('#diagnostics').html(diagnostics);

  // lock in screen size to device display size

  $('body').css({
    height: screen.height,
    width: screen.width,
    overlow: 'hidden',
  });
  $('#container').css({
    height: screen.height,
    width: screen.width,
    overlow: 'hidden',
  });

  $('body').on({
    'mousewheel': function(e) {
      if (e.target.id == 'el') return;
      e.preventDefault();
      e.stopPropagation();
    }
  });

  $('#item').css({
    transform: `translate(${window.anchor.x}px, ${window.anchor.y}px)`,
    '-webkit-transform': `translate(${window.anchor.x}px, ${window.anchor.y}px)`,
    '-ms-transform': `translate(${window.anchor.x}px, ${window.anchor.y}px)`
  });

  // add focus to the item
  var item = $('#item');
  item.data('x', window.anchor.x);
  item.data('y', window.anchor.y);
  var x = item.data('x');
  var y = item.data('y');
  // $('.info').text(`Locally anchored at ${x}, ${y}`).focus();

  // ----------------------------- SOCKET ----------------------------------
  window.socket = io();
  // -----------------------------------------------------------------------


  window.socket.on('item_draw', function(data) {
    // TODO: change this to filter only information relevant to this client
    var anchor = data[window.phone_id].anchor;
    console.log(JSON.stringify(anchor));
    $('#item').css({
      display: 'block',
      transform: `translate(${anchor.x}px, ${anchor.y}px)`,
      '-webkit-transform': `translate(${anchor.x}px, ${anchor.y}px)`,
      '-ms-transform': `translate(${anchor.x}px, ${anchor.y}px)`
    });
    $('#item').data('x', anchor.x);
    $('#item').data('y', anchor.y);
    document.getElementById('item').setAttribute('data-x', anchor.x);
    document.getElementById('item').setAttribute('data-y', anchor.y);
    // $('.info').text('Locally anchored at ' + anchor.x + ', ' + anchor.y);
  });

  window.socket.on('reload', function() {
    window.location.reload();
  });

  window.socket.on('resize_image', function(data) {
    $('#item').css({
      width: data.width + 'px',
      height: data.height + 'px',
    });
    $('#picture').css({
      width: (data.width - 20) + 'px',
      height: (data.height - 20) + 'px'
    })
  });

  var ITEM_WIDTH = $('.item').css('width');
  var ITEM_HEIGHT = $('.item').css('height');

  var gestureArea = document.getElementById('item');
  var scaleElement = document.getElementById('picture');

  // target elements with the "draggable" class
  interact('.draggable')
    .draggable({
      // enable inertial throwing
      inertia: true,
      restrict: {
        restriction: 'parent',
        elementRect: {
          top: (-1 * ITEM_HEIGHT),
          left: (-1 * ITEM_WIDTH),
          bottom: 0,
          right: 0
        }
      },
      snap: false,

      // call this function on every dragmove event
      onmove: dragMoveListener,
    })
    .resizable({
      preserveAspectRatio: true,
      edges: {
        left: true,
        right: true,
        bottom: true,
        top: true
      }
    })
    .on('resizemove', function(event) {
      var target = event.target,
        x = (parseFloat(target.getAttribute('data-x')) || 0),
        y = (parseFloat(target.getAttribute('data-y')) || 0);

      // update the element's style
      target.style.width = event.rect.width + 'px';
      target.style.height = event.rect.height + 'px';

      var item = $('#picture');
      item.css({
        width: event.rect.width - 20 + 'px',
        height: event.rect.height - 20 + 'px'
      });

      // translate when resizing from top or left edges
      x += event.deltaRect.left;
      y += event.deltaRect.top;
      if (event.deltaRect.left || event.deltaRect.top) {
        window.socket.emit('item_move', {
          anchor: {
            x: x,
            y: y,
          },
          session_id: window.session_id,
          phone_id: window.phone_id,
        });
      }

      target.style.webkitTransform = target.style.transform =
        'translate(' + x + 'px,' + y + 'px)';

      target.setAttribute('data-x', x);
      target.setAttribute('data-y', y);

      window.socket.emit('resize', {
        width: event.rect.width,
        height: event.rect.height,
      });
    });

  function dragMoveListener(event) {
    var target = event.target,
      // keep the dragged position in the data-x/data-y attributes
      x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
      y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    // translate the element
    target.style.webkitTransform =
      target.style.transform =
      'translate(' + x + 'px, ' + y + 'px)';

    // update the posiion attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);

    $('#item').data('x', x);
    $('#item').data('y', y);


    // ------------------ render diagnostic information ------------------

    var textEl = event.target.querySelector('p');

    // textEl && (textEl.textContent =
    //   'moved a distance of ' + (Math.sqrt(event.dx * event.dx +
    //     event.dy * event.dy) | 0) + 'px');

    var item = interact.getElementRect(event.target);

    textEl && (textEl.textContent = 'Locally anchored at ' + item.left + ', ' + item.top)

    window.socket.emit('item_move', {
      anchor: {
        x: $('#item').data('x'),
        y: $('#item').data('y'),
      },
      session_id: window.session_id,
      phone_id: window.phone_id,
    });

    // draw fancy shit

    for (var i = 0; i < window.magic.touches.length; i++) {

      var touch = window.magic.touches[i];
      var max = Math.round(Math.random() * 4);
      for (var j = 0; j < max; j++) {
        window.magic.spawn(event.pageX, event.pageY - 50);
      };
    }
  }

  // this is used later in the resizing and gesture demos
  window.dragMoveListener = dragMoveListener;
});