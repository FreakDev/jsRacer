var sys = require("util"), ws = require('./lib/ws');

var server = ws.createServer();

var Network = {};

Network.commands = {
    ACCELERATE  : 'accelerate',    // gameId, playerId
    BRAKE       : 'brake',         // gameId, playerId
    TURN        : 'turn',          // gameId, playerId, angle
    REQUEST     : 'request',       // gameId
    LIST_GAME   : 'listgame',
    
    CREATE_GAME : 'creategame',    // gameName
    PLAYER_ADDED: 'playeradded',   //     
    KILL_GAME   : 'killgame',      // gameId
    GAME_OVER   : 'gameover',      // gameId, playerId
    GAME_START  : 'gamestart',     // gameId
    CRASH       : 'crash',         // gameId, playerId
    ERROR       : 'error'    
};


var games = {};

/**
 * class Game
 */
var Game = function Games (name, connId) {
    this._started = false;
    this.hostId = connId;
    this.gameName = name;
};

var p = Game.prototype;

p.getGameId = function getGameId () {
    return this.gameId;
};

p.getPlayersId = function getGameId () {
    return this._playersId;
};

p.isStarted = function isStarted () {
    return this._started;
};
/** End Class Game **/


var onMessage = function (conn, data) {
    var msg = JSON.parse(data);
        
    var method = msg.method;
        
    server.emit(method, conn, msg);
};

var forwardToHost = function (gameName, message) {
    if (games[gameName]) {
        var connId = games[gameName].getGameId();
        server.send(connId, message);
        return true;
    }
    return false;    
};

// var forwardToPlayer = function (conn, message) {
//     if (games[gameName] && games[gameName].getPlayersId()[playerId]) {
//         var connId = games[gameName].getPlayersId()[playerId];
//         server.send(connId, message);
//         return true;
//     }
//     return false;
// };

// Handle WebSocket Requests
server.addListener("listening", function() {
    sys.log("Listening for connections.");
});

server.addListener("connection", function(conn) {
    sys.log("Connection: " + conn.id);
	    
    conn.addListener("message", function (data) {
        onMessage(conn, data);
    });
});

server.addListener("close", function(conn) {
    sys.log("Connection: " + conn.id + " closed");
});

server.addListener("error", function(conn) {
    sys.log("Connection: " + conn.id + " error");
});


// handle game specific request
server.addListener(Network.commands.CREATE_GAME, function (conn, opt) {
    
    callId = opt.id;
    method = opt.method;    
    opt = opt.args;
    
    var msg;
    
    if (!opt.gameName) {
        sys.log("Error : no name given");
        msg = {id: -1, method: Network.commands.ERROR, args: {message: "no name given"}};
        server.send(conn.id, JSON.stringify(msg));
        return;
    }
    
    if (games[opt.gameName]) {
        sys.log("Error : a game with the same name already exists");
        msg = {id: -1, method: Network.commands.ERROR, args: {message: "a game with the same name already exists"}};
        server.send(conn.id, JSON.stringify(msg));
        return;
    }
    
    games[opt.gameName] = new Game (opt.gameName, conn.id);

    server.send(conn.id, JSON.stringify({id: callId, method: method, args: {}}));
});

server.addListener(Network.commands.LIST_GAME, function (conn, opt) {

    var gamesList = [];
    for (var name in games) {
        gamesList.push(games[name]);
    }
    
    msg = {id: opt.id, method: opt.method, args: gamesList};
    server.send(conn.id, JSON.stringify(msg));    
    
});

server.addListener(Network.commands.REQUEST, function (conn, opt) {
    
    callId = opt.id;
    method = opt.method;
    opt = opt.args;

    var msg;
    
    if (!opt.gameName) {
        sys.log("Error : no game name given");
        msg = {id: -1, method: Network.commands.ERROR, args: {message: "no game name given"}};
        server.send(conn.id, JSON.stringify(msg));
        return;
    }

    msg = {id: callId, method: method, args: opt.args};
    forwardToHost(gameName, JSON.stringify(msg));
});

server.listen(8000);