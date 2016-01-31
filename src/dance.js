var Dance = (function () {
    "use strict";
    
    var DANCE_FRAME_TIME = 80;
    
    function Dance(loader, baseName) {
        this.idle = new Flipbook(loader, baseName + "", 1, 2);
        this.idlePlay = this.idle.setupPlayback(DANCE_FRAME_TIME, true);
    }
    
    Dance.prototype.update = function(elapsed) {
        this.idle.updatePlayback(elapsed, this.idlePlay);
    };
    
    Dance.prototype.draw = function(context, x, y) {
        this.idle.draw(context, this.idlePlay, x, y, ALIGN.Bottom);
    };
    
    return Dance;
}());
