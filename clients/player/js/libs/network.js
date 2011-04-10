var jsr = (function(ns, global) {
    
    var Network = function Network(options) {
        this._listeners = {};
        this._apiCalls = {};
        this._socket = null;
        
        if (!options.url) {
            throw new Error('can’t connect to server, no url provided');
        }
        
	    this._socketOpen = false;
	    this._socketUrl = options.url;
	    this._socketConnect();
    	this._socket.onopen = this._socketOpenHandler;
    	this._socket.onclose = this._socketCloseHandler;
    	this._socket.onerror = this._socketErrorHandler;
    	this._socket.onmessage = this._socketMessageHandler;

        
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

	p._socketConnect  = function _socketConnect (url) {
        this._socket = new Websocket(this._socketUrl);
	};
    
	p._socketOpenHandler  = function _socketOpenHandler (e) {
	    this._socketOpen = true;
	};
	
	p._socketCloseHandler = function _socketCloseHandler (e) {
	    alert('connection closed');
	};
	
	p._socketErrorHandler = function _socketErrorHandler (e) {
	    alert('socket error');
	};
	
	this._socketMessageHandler = function _socketMessageHandler (e) {
	    var msg = JSON.parse(e.data);
	    
	    var callback = this._apiCalls[msg.id];
	    var method = msg.method;
        delete msg.id; delete msg.method;
	    if (callback) {
	        if (!callback(msg)) {
	            return;
	        }
	    }
	    
	    (this._listerners[method])(msg);
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
            
        var callId = [method, Date.now()].join('-');
            
        this._apiCalls[callId] = callback != undefined ? callback : null;
        
        this._send({id: callId, method: method, args: args});
    };
    
    p._send = function _send (params) {
        if (this._socketOpen) {
            this._socket.send(JSON.stringify(params));
        }
    };
        
})(jsr || {}, window);