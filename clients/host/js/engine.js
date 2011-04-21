var jsr = (function (ns, global) {
    
    var e = function Engine (canvas) {
        this.stage;
        
        this.players = [];
        
        if (typeof canvas != 'undefined') {
            this.init(canvas);
        }
    };
    var p = e.prototype;
    
    p.init = function (canvas) {
        this.stage = new global.Stage(canvas);
    };
    
    p.addPlayer = function (car) {
        if (!(car instanceof jsr.Car)) { throw Error('Wrong parameter type !'); }
        
        this.players.push(car);
        this.stage.addChild(car.getDisplayObject());
        
        return this.players.indexOf(car);
    };

    p.tick = function () {
        var players = this.players;
        for (var i=0, len=players.length; i<len; i++) {
            players[i].tick();
        }
        
        this.stage.update();
    };

    p.run = function () {
        global.Ticker.addListener(this);        
    };

    ns.Engine = e;
    
    return ns;
    
})(jsr || {}, window);