(function (jsr, global) {
    
    var l = new jsr.Loader;
    var e = new jsr.Engine;    
    var c;
    var serverURL = 'ws://127.0.0.1:8000';
    var nt;
    var NetworkCmd = jsr.Network.commands;
        
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
        
        var listeners = {};
        listeners[NetworkCmd.ERROR] = function (obj) {
            console.warn(obj);
            alert(obj.message);
        };
        
        nt = new jsr.Network({
            url: serverURL, 
            listeners: listeners
        });
        
        showPopUp('form-game-name');
        
        ooLib.delay(function () {
            var btn = document.querySelector('#popup');
            //var input = document.querySelector('#popup input[type=text]');
            btn.onclick = function (evt) {
                if ('button' == evt.target.type) {
                    return popupListeners[evt.target.name]();
                }
            };
        });
        
        
    }
    
    var popupListeners = {
        'create-game': function () {
            nt.apiCall(NetworkCmd.CREATE_GAME, {gameName: document.querySelector('#popup input[type=text]').value}, function () { alert('toto') });
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
        e.init(c);
        
        var p = new jsr.Car(l.getResource('redcar'));
        e.addPlayer(p);
        
        p.turnLeft();
        p.accelerate();

        e.run();        
    }
    
    global.onload = main;
        
})(jsr, window);