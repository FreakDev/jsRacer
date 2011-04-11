(function (jsr, global) {

    var l = new jsr.Loader;
    var e = new jsr.Engine;    
    var c;
    var serverURL = 'ws://127.0.0.1:8000';
    var nt;
        
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
        
        nt = new jsr.Network({url: serverURL});
        
        showPopUp('form-game-name');
        
        ooLib.delay(function () {
            var btn = document.querySelector('#popup input[type=button]');
            var input = document.querySelector('#popup input[type=text]');
            btn.onclick = function () {
                
            };
        });
        
        
    }
    
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