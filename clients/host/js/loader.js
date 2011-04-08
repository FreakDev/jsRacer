var jsr = (function (ns) {
    
    var l = function Loader (config) {
        
        this.nbLoaded = 0;
        this.nbToLoad = 0;
        this.percentLoaded = 0;
        this.progressListener;
        this.completeListener;
        this.resources = [];
        
        if (typeof config != 'undefined') {
            this.load(config);
        }
        
    };
    var p = l.prototype;
    
    p.load = function (config) {
        if (typeof config.resources.length == 'undefined') { throw Error('resources is not defined'); }
        
        this.progressListener = config.onProgress || function () {};
        this.completeListener = config.onComplete || function () {};
        
        this.nbToLoad = config.resources.length;
        
        for (var i=0, len=config.resources.length; i<len; i++) {
            var img = new Image();
            this.resources[config.resources[i].name] = img;
            img.addEventListener('load', ooLib.createDelegate(this.loadHandler, this));
            img.src = config.resources[i].file;
        }        
    };
    
    p.loadHandler = function loadHandler (e) {
        this.nbLoaded++;
        
        this.progressListener();
        
        if (this.nbLoaded == this.nbToLoad) {
            this.completeHandler(e);
        }
    };
    
    p.completeHandler = function completeHandler (e) {
        this.completeListener();
    };
    
    p.getResource = function getResource (name) {
        return this.resources[name];
    };
    
    ns.Loader = l;
    
    return ns;
    
})(jsr || {});