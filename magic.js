var server = require('./bin/www');
var client = require('./db/db');
var utils = require('./utils');

server.listen(3000);

var io = require('socket.io')(server);

io.on('connection', function(socket) {
  console.log('new phone connected');
  socket.on('start', function(data) {
    // need to check for the ROOM id or whatever here
  });

  socket.on('item_move', function(data) {
    // item has moved on the page 
    // calculate new_data
    var sessionID = data.session_id;
    client.get('session-' + sessionID, function (err, result) {
      var session = JSON.parse(result);

      var globalVerticalOffset = data.anchor.y;
      var globalHorizontalOffset = data.anchor.x;
      var phoneAbove = session['devices'][data.phone_id]['neighbors']['up'];
      while (phoneAbove) {
        verticalOffset += session['devices'][phoneAbove]['screenHeight'];
        phoneAbove = session['devices'][phoneAbove]['neighbors']['up'];
      }
      var phoneLeft = session['devices'][data.phone_id]['neighbors']['left'];
      while (phoneLeft) {
        horizontalOffset += session['devices'][phoneLeft]['screenHeight'];
        phoneLeft = session['devices'][phoneLeft]['neighbors']['left'];
      }
      var responseObj = {};
      Object.keys(session['devices']).forEach(function (deviceID) {
        responseObj[deviceID] = {
          anchor: {
            y: globalVerticalOffset - session['devices'][data.phone_id]['virtualVerticalOffset'],
            x: globalHorizontalOffset - session['devices'][data.phone_id]['virtualHorizontalOffset'],
          }
        };
      });
      socket.broadcast.emit('item_draw', responseObj);
    });
  });
});
