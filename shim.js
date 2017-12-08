var ws;

if (typeof WebSocket !== 'undefined') {
  ws = WebSocket;
} else if (typeof MozWebSocket !== 'undefined') {
  ws = MozWebSocket;
} else {
  ws = window.WebSocket || window.MozWebSocket;
}

ws.prototype.on = function(event, handler) {
  switch (event) {
    case 'message':
      return this.addEventListener('message', function(messageEvent) {
        handler(messageEvent.data);
      });
    default:
      return this.addEventListener(event, handler);
  }
};

module.exports = ws;