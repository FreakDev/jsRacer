var sys = require("util"), ws = require('./lib/ws');

var server = ws.createServer();

server.addListener("listening", function() {
    sys.log("Listening for connections.");
});

var Network = {};

Network.commands = {
    ACCELERATE  : 'accelerate',    // gameId, playerId
    BRAKE       : 'brake',         // gameId, playerId
    TURN        : 'turn',          // gameId, playerId, angle
    REQUEST     : 'request',       // gameId
    LIST_GAME   : 'listgame',
    
    CREATE_GAME : 'creategame',    // gameName
    KILL_GAME   : 'killgame',      // gameId
    GAME_OVER   : 'gameover',      // gameId, playerId
    GAME_START  : 'gamestart',     // gameId
    CRASH       : 'crash'          // gameId, playerId
};

var games = {};

var Game = function Games (name, connId) {
    this._playersId = [];
    this._started = false;
    this.hostId = connId;
    this.gameName = name;
};

var p = Game.prototype;

p.getGameId = function getGameId () {
    return this.gameId;
};

p.isStarted = function isStarted () {
    return this._started;
};

var onMessage = function (conn, data) {
    var msg = JSON.parse(data);
    
    var callId = msg.id;
    var method = msg.method;
    delete msg.id; delete msg.method;
    
    server.emit(method, conn.id, msg);
};

// Handle WebSocket Requests
server.addListener("connection", function(conn) {
    sys.log("Connection: " + conn.id);
	    
    conn.addListener("message", function (data) {
        onMessage(conn, data);
    });
});

server.addListener("close", function(conn) {
    sys.log("Connection: " + conn.id + " closed");

    // server.broadcast("<"+conn.id+"> disconnected");
});

server.addListener("error", function(conn) {
    sys.log("Connection: " + conn.id + " error");
    // server.broadcast("<"+conn.id+"> disconnected");
});


// handle game specific request
server.addListener(Network.CREATE_GAME, function (conn, opt) {
    if (!opt.gameName) {
        sys.log("Error : no name given");
    }
    
    if (games[opt.gameName]) {
        sys.log("Error : a game with the same name already exists");
    }
    
    games[opt.gameName] = new Game (gameName, conn.id);
    sys.log(opt.gameName);
    
});

server.listen(8000);