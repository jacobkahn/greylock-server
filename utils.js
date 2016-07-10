module.exports = {
  calculateGlobalCanvasDimensions: function (session) {
    console.log(JSON.stringify(session));
    var firstPhoneID = session['sortedDeviceIDs'][0];
    var globalVerticalOffset = Number(session['devices'][firstPhoneID]['screenHeight']);
    var globalHorizontalOffset = Number(session['devices'][firstPhoneID]['screenWidth']);
    console.log(firstPhoneID, globalHorizontalOffset);
    var phoneBelow = session['devices'][firstPhoneID]['neighbors']['down'];
    while (phoneBelow) {
      globalVerticalOffset += Number(session['devices'][phoneBelow]['screenHeight']);
      phoneBelow = session['devices'][phoneBelow]['neighbors']['down'];
    }
    var phoneRight = session['devices'][firstPhoneID]['neighbors']['right'];
    while (phoneRight) {
      console.log(phoneRight, globalHorizontalOffset);
      globalHorizontalOffset += Number(session['devices'][phoneRight]['screenWidth']);
      phoneRight = session['devices'][phoneRight]['neighbors']['right'];
    }
    return {
      horizontal: globalHorizontalOffset,
      vertical: globalVerticalOffset,
    };
  },

  calculateGlobalOffsetFromInitialAnchor: function (x, y, session, phoneID) {
    var globalVerticalOffset = y;
    var globalHorizontalOffset = x;
    var phoneAbove = session['devices'][phoneID]['neighbors']['up'];
    while (phoneAbove) {
      globalVerticalOffset += Number(session['devices'][phoneAbove]['screenHeight']);
      phoneAbove = session['devices'][phoneAbove]['neighbors']['up'];
    }
    var phoneLeft = session['devices'][phoneID]['neighbors']['left'];
    while (phoneLeft) {
      globalHorizontalOffset += Number(session['devices'][phoneLeft]['screenWidth']);
      phoneLeft = session['devices'][phoneLeft]['neighbors']['left'];
    }
    return {globalVerticalOffset: globalVerticalOffset, globalHorizontalOffset: globalHorizontalOffset};
  },
};
