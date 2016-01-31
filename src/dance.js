var Dance = (function () {
    "use strict";
    
    var DANCE_FRAME_TIME = 80;
    
    function Dance(loader, idleBase, danceBase, jumpBase) {
        this.idle = new Flipbook(loader, idleBase, 4, 2);
        this.dance = new Flipbook(loader, danceBase, 4, 2);
        this.jump = new Flipbook(loader, jumpBase, 4, 2);
        this.idlePlay = this.idle.setupPlayback(DANCE_FRAME_TIME, true);
        this.dancePlay = this.dance.setupPlayback(DANCE_FRAME_TIME, true);
    }
    
    Dance.prototype.update = function(elapsed, jump) {
        this.idle.updatePlayback(elapsed, this.idlePlay);
        this.dance.updatePlayback(elapsed, this.dancePlay);
        
        if (jump) {
            return this.jump.updatePlayback(elapsed, jump);
        }
        return false;
    };
    
    Dance.prototype.draw = function(context, x, y, dancing, jump) {
        if (jump) {
            this.jump.draw(context, jump, x, y, ALIGN.Bottom);
        } else if (dancing) {
            this.dance.draw(context, this.dancePlay, x, y, ALIGN.Bottom);
        } else {
            this.idle.draw(context, this.idlePlay, x, y, ALIGN.Bottom);
        }
    };
    
    return Dance;
}());
