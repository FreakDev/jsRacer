var jsr = (function(ns, global) {
    
    var Network = function Network(options) {
        this._listeners = {};
        this._apiCalls = {};
        this._socket = null;
        
        if (!options.url) {
            throw new Error('can’t connect to server, no url provided');
        }
        
        this._socket = new Websocket(options.url);
        
        this._initListeners(options.listeners || {});
    };
    var p = Network.prototype;
    
    Network.commands = {
        ACCELERATE  : 'accelerate',     // game_id, player_id
        BRAKE       : 'brake',          // game_id, player_id
        TURN        : 'turn',           // game_id, player_id, angle
        REQUEST     : 'request',        // game_id
        
        CREATE_GAME : 'create_game',    // game_name
        KILL_GAME   : 'kill_game',      // game_id
        GAME_OVER   : 'game_over',      // game_id, player_id
        GAME_START  : 'game_start',     // game_id
        CRASH       : 'crash'           // game_id, player_id
    };
    
    p._initListeners = function _initListeners(listeners) {
        for (cmd in Network.commands) {
            this._listerners[cmd] = listeners[cmd] || function () {};
        }
    };
    
    p.apiCall = function apiCall (method, args, callback) {
        if (!(method in Network.commands)) {
            throw new Error('unknow method in API call');
        }
            
        var callId = [method, Date.toTime()].join('-');
            
        this.apiCalls[callId] = callback;
        
        this._send({id: callId, method: method, args: args});
    };
    
    p._send = function _send (params) {
        this._socket.send(this._serialize(params));
    };
    
})(jsr || {}, window);