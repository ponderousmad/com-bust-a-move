var Dancer = (function () {
    "use strict";
    
    var DANCE_FRAME_TIME = 80;
    
    function Dancer(loader, baseName) {
        this.idle = new Flipbook(loader, baseName + "", 1, 2);
        this.idlePlay = this.idle.setupPlayback(DANCE_FRAME_TIME, true);
    }
    
    Dancer.prototype.update = function(elapsed) {
        this.idle.updatePlayback(elapsed, this.idlePlay);
    };
    
    Dancer.prototype.draw = function(context, x, y) {
        this.idle.draw(context, this.idlePlay, x, y, ALIGN.Bottom);
    };
    
    return Dancer;
}());
