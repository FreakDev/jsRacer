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

        this._initListeners(options.listeners || {});
	    
	    var isPhone = global.navigator.userAgent.match(/iPhone|Android/i) != null;
	    
	    if (isPhone) {
        	this._socket.onopen = this._socketOpenHandler;
        	this._socket.onclose = this._socketCloseHandler;
        	this._socket.onerror = this._socketErrorHandler;
        	this._socket.onmessage = this._socketMessageHandler;
    	} else {
            this._socket.addEventListener('open', ooLib.createDelegate(this._socketOpenHandler, this), true);
            this._socket.addEventListener('error', ooLib.createDelegate(this._socketErrorHandler, this), true);
            this._socket.addEventListener('message', ooLib.createDelegate(this._socketMessageHandler, this), true);
            this._socket.addEventListener('close', ooLib.createDelegate(this._socketCloseHandler, this), true);      
        }
        
    };
    var p = Network.prototype;
    
    Network.commands = {                
        ACCELERATE  : 'accelerate',      // gameId, playerId
        BRAKE       : 'brake',           // gameId, playerId
        TURN        : 'turn',            // gameId, playerId, angle
        REQUEST     : 'request',         // gameId        
        LIST_GAME   : 'listgame',        
                                        
        CREATE_GAME : 'creategame',      // gameName
        PLAYER_ADDED: 'playeradded',        
        KILL_GAME   : 'killgame',        // gameId
        GAME_OVER   : 'gameover',        // gameId, playerId
        GAME_START  : 'gamestart',       // gameId
        CRASH       : 'crash',           // gameId, playerId
        ERROR       : 'error'            
    };

	p._socketConnect  = function _socketConnect (url) {
        this._socket = new WebSocket(this._socketUrl);
	    this._socketOpen = true;
	};
    
	p._socketOpenHandler  = function _socketOpenHandler (e) {
	    this._socketOpen = true;
	};
	
	p._socketCloseHandler = function _socketCloseHandler (e) {
	    this._socketOpen = false;	    
	    alert('connection closed');
	};
	
	p._socketErrorHandler = function _socketErrorHandler (e) {
	    alert('socket error');
	};
	
	p._socketMessageHandler = function _socketMessageHandler (e) {
	    var msg = JSON.parse(e.data);
	    
	    var callback = this._apiCalls[msg.id];
	    var method = msg.method;
        delete msg.id; delete msg.method;
        if (callback) {
	        if (!callback(msg.args)) {
	            return;
	        }
	    }
	    
	    console.log(this._listeners);
	    this._listeners[method](msg.args);
	};
    
    p._initListeners = function _initListeners(listeners) {
        for (var cmd in Network.commands) {
            this._listeners[Network.commands[cmd]] = listeners[Network.commands[cmd]] || function () {};
        }
    };
    
    p.apiCall = function apiCall (method, args, callback) {
        // console.log(Network.commands);
        // if (typeof Network.commands[method] == 'undefined') {
        //     throw new Error(['unknow method (', method, ') in API call'].join(''));
        // }
            
        var callId = [method, Date.now()].join('-');
            
        this._apiCalls[callId] = callback != undefined ? callback : null;
        
        this._send({id: callId, method: method, args: args});
    };
    
    p._send = function _send (params) {
        if (this._socketOpen) {
            this._socket.send(JSON.stringify(params));
        }
    };
    
    ns.Network = Network;
    
    return ns;
        
})(jsr || {}, window);