var sys = require("util"), ws = require('./lib/ws');

var server = ws.createServer();

server.addListener("listening", function() {
    sys.log("Listening for connections.");
});

var MESSAGE_DRAWING = 'drawing';
var MESSAGE_SYSTEM = 'system';
var MESSAGE_CHAT = 'chat';
  
var restoreMessage = function (string) 
{
	eval(['var obj = ', string].join(''));
	
	return obj;
};

var onMessage = function (message) {
    sys.log(message);
    
    var msg = restoreMessage(message)
    if (MESSAGE_SYSTEM == msg.type) {
        sendClientID(this);
    } else {
        this.broadcast(message);
    }
};

var sendClientID = function (conn) {
    conn.send("{'type': '" + MESSAGE_SYSTEM + "', 'content': {'clientID': '_" + conn.id + "'}}");
};

// Handle WebSocket Requests
server.addListener("connection", function(conn) {
	sendClientID(conn);
    sys.log("Connection: " + conn.id);
	    
    conn.addListener("message", onMessage);
});

server.addListener("close", function(conn) {
    sys.log("Connection: " + conn.id + " closed");

    // server.broadcast("<"+conn.id+"> disconnected");
});

server.addListener("error", function(conn) {
    sys.log("Connection: " + conn.id + " error");
    // server.broadcast("<"+conn.id+"> disconnected");
});

server.listen(8000);