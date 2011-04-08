var jsr = (function (ns, global) {
    
    var c, Car;
    c = Car= function Car (imgSprites) {
        this.sprites;
        this.bmpSq;
        this.rotation;
        this.velocity;
		this.thrust = 0;
		this.vX = 0;
		this.vY = 0;        
        
        this._initGraphics(imgSprites);
        this._initSettings();
    };
    var p = c.prototype;
    
	Car.MAX_THRUST = 2;
	Car.MAX_VELOCITY = 5;    

    p._initGraphics = function _initGraphics (imgSprites) {
        this.sprites = new global.SpriteSheet(imgSprites, 24, 35, {normal: [0,0,false]});
        this.bmpSq = new global.BitmapSequence(this.sprites);
        
        var halfW = this.bmpSq.spriteSheet.frameWidth/2|0;
        var halfH = this.bmpSq.spriteSheet.frameHeight/2|0;
        
        this.bmpSq.x = halfW;
        this.bmpSq.y = halfH;
        
        this.bmpSq.regX = halfW;
        this.bmpSq.regY = halfH;
        
        this.bmpSq.gotoAndStop('normal');
    };
    
    p._initSettings = function _initSettings () {
        this. rotation = 0;
        this.velocity = 0;
        this.moveInc = 5;        
        this.maxVelocity = 15;        
    };
    
    p.turnRight = function turnRight () {
        this.bmpSq.rotation += 10;
    };
    
    p.turnLeft = function turnLeft () {
        this.bmpSq.rotation -= 10;
    };
    
    p.accelerate = function accelerate () {
        this.thrust += this.thrust + 0.6;
        if(this.thrust >= Car.MAX_THRUST) {
        	this.thrust = Car.MAX_THRUST;
        }
        
        this.vX += Math.sin(this.bmpSq.rotation*(-Math.PI/180))*this.thrust;
        this.vY += Math.cos(this.bmpSq.rotation*(-Math.PI/180))*this.thrust;

        this.vX = Math.min(Car.MAX_VELOCITY, Math.max(-Car.MAX_VELOCITY, this.vX));
        this.vY = Math.min(Car.MAX_VELOCITY, Math.max(-Car.MAX_VELOCITY, this.vY));
    };
    
    p.decelerate = function decelerate () {
        this.thrust -= 0.5;
    };
    
    p.nextCoord = function nextCoord() {
        
    };
    
    p.tick = function tick () {
		this.bmpSq.x += this.vX;
		this.bmpSq.y += this.vY;
				
        if(this.thrust > 0) {
            this.thrust -= 0.3;
        } else {
            this.thrust = 0;
        }
    };
        
    p.getDisplayObject = function () {
        return this.bmpSq;
    };
    
    ns.Car = c;
    
    return ns;
    
})(jsr || {}, window);