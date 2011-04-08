(function (global) {

    var l = new jsr.Loader;
    var e = new jsr.Engine;    
    var c;
        
    function main () {

        c = document.getElementById('race');

        l.load({
            resources: [{
                name: 'redcar',
                file: 'res/redcar-s.png'
            }],
            onComplete: startGame
        });
        
    };
    
    function startGame () {
        e.init(c);
        
        var p = new jsr.Car(l.getResource('redcar'));
        e.addPlayer(p);
        
        p.turnLeft();
        p.accelerate();

        e.run();        
    }
    
    global.onload = main;
        
})(window);