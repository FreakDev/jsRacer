(function (jsr, global) {
    
    var l = new jsr.Loader;
    var engine = new jsr.Engine;    
    var c;
    var serverURL = 'ws://127.0.0.1:8000';
    var nt;
    var NetworkCmd = jsr.Network.commands;
    var gameName = '';
    var playerMap = {};
        
    function main () {

        c = document.getElementById('race');

        l.load({
            resources: [{
                name: 'redcar',
                file: 'res/redcar-s.png'
            }],
            onComplete: envReady
        });
        
    };
    
    function envReady () {
        
        var apiListeners = {};
        apiListeners[NetworkCmd.ERROR] = function (obj) {
            alert(obj.message);
        };
        apiListeners[NetworkCmd.REQUEST] = function (obj) {
            var playerId = addPlayer(l.getResource(obj.resName, obj.playerName));
            nt.apiCall(NetworkCmd.REQUEST, {callId: obj.id, gameName: gameName, playerId: playerId});            
        };
        
        var listeners = {};
        listeners[jsr.Network.events.SOCKET_OPEN] = function () {
            showPopUp('form-game-name');

            ooLib.delay(function () {
                var btn = document.querySelector('#popup');
                btn.onclick = function (evt) {
                    if ('button' == evt.target.type) {
                        return popupListeners[evt.target.name]();
                    }
                };
            });
        };
        
        // listeners[jsr.Network.events.SOCKET_ERROR] = function () {}

        // listeners[jsr.Network.events.SOCKET_CLOSE] = function () {}
        
        nt = new jsr.Network({
            url: serverURL,
            apiListeners: apiListeners,
            listeners: listeners
        });        
    }
    
    var popupListeners = {
        'create-game': function () {
            var gameTmpName = document.querySelector('#popup input[type=text]').value;
            nt.apiCall(NetworkCmd.CREATE_GAME, {gameName: gameTmpName}, function () { gameName = gameTmpName; hidePopUp(); startGame(); });
        }
    };
    
    function showPopUp (popupName) {
        
        var domContent = document.querySelector("#" + popupName);
        var domPopup = document.querySelector("#popup");
        var domMask = document.querySelector("#mask");
        
        domPopup.innerHTML = domContent.innerHTML;
        
        //domMask.style.display = 'block';
        domPopup.style.display = 'block';        
    }
    
    function hidePopUp (popupName) {
        
        var domPopup = document.querySelector("#popup");
        var domMask = document.querySelector("#mask");
        
        //domMask.style.display = 'none';
        domPopup.style.display = 'none';
        
    }    
    
    function startGame () {
        engine.init(c);
        engine.run();
        showPopUp('waiting-for-players');
    }
    
    function addPlayer (resource, name) {
        var p = new jsr.Car(resource, name);
        return engine.addPlayer(p);
    }
    
    global.onload = main;
        
})(jsr, window);