var Dance = (function () {
    "use strict";
    
    var DANCE_FRAME_TIME = 71.5;
    
    function Dance(loader, idleBase, danceBase, jumpBase, stunBase) {
        this.idle = new Flipbook(loader, idleBase, 4, 2);
        this.dance = new Flipbook(loader, danceBase, 4, 2);
        this.jump = new Flipbook(loader, jumpBase, 11, 2);
        this.stun = new Flipbook(loader, stunBase, 4, 2);
        this.idlePlay = this.idle.setupPlayback(DANCE_FRAME_TIME, true);
        this.dancePlay = this.dance.setupPlayback(DANCE_FRAME_TIME, true);
        this.stunPlay = this.stun.setupPlayback(DANCE_FRAME_TIME, true);
    }
    
    Dance.prototype.update = function (elapsed, jump) {
        this.idle.updatePlayback(elapsed, this.idlePlay);
        this.dance.updatePlayback(elapsed, this.dancePlay);
        this.stun.updatePlayback(elapsed, this.stunPlay);
    };
    
    Dance.prototype.startJump = function () {
        return this.jump.setupPlayback(DANCE_FRAME_TIME, false);
    };
    
    Dance.prototype.updateJump = function(elapsed, jump) {
        if (jump) {
            return this.jump.updatePlayback(elapsed, jump);
        }
        return false;
    };
    
    Dance.prototype.draw = function (context, x, y, stunned, dancing, jump, tint) {
        if (jump) {
            this.jump.draw(context, jump, x, y, ALIGN.Bottom, null, null, tint);
        } else if (stunned) {
            this.stun.draw(context, this.stunPlay, x, y, ALIGN.Bottom, null, null, tint);
        } else if (dancing) {
            this.dance.draw(context, this.dancePlay, x, y, ALIGN.Bottom, null, null, tint);
        } else {
            this.idle.draw(context, this.idlePlay, x, y, ALIGN.Bottom, null, null, tint);
        }
    };
    
    return Dance;
}());
