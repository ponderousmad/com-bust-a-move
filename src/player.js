var Player = (function () {
    "use strict";
    
    var noteSpacing = 40,
        KEY_DRAW_FOR = 250,
        BASE_OFFSET = 150,
        TOP = -20,
        LONG_PAST = 100000,
        NOTE_LIST = ["U", "D", "L", "R"];
    
    function Player(keys, images, offsetDirection) {
        this.keyMap = {
            U: keys[0],
            D: keys[1],
            L: keys[2],
            R: keys[3]
        };
        this.images = images;
        this.offsetDirection = offsetDirection;
        
        this.resetLastPressed();
    }
    
    Player.prototype.resetLastPressed = function () {
        this.lastPressed = {
            U: LONG_PAST,
            D: LONG_PAST,
            L: LONG_PAST,
            R: LONG_PAST
        };
    };
    
    Player.prototype.drawKey = function(context, centerX, centerY, key, offset) {
        if (this.lastPressed[key] < KEY_DRAW_FOR) {
            DRAW.centered(context, this.images[key], centerX + offset * this.offsetDirection, centerY + TOP);
        }
    };
    
    Player.prototype.draw = function (context, centerX, centerY) {
        var offset = BASE_OFFSET;
        for (var n = 0; n < NOTE_LIST.length; ++n) {
            this.drawKey(context, centerX, centerY, NOTE_LIST[n], offset);
            offset += noteSpacing;
        }
    };
    
    Player.prototype.updateKey = function(key, now, elapsed, keyboard) {
        var keyCode = this.keyMap[key];
        if (keyboard.wasKeyPressed(keyCode)) {
            this.lastPressed[key] = now - keyboard.keyTime(keyCode);
        } else if (this.lastPressed[key] > 0) {
            this.lastPressed[key] += elapsed;
        }
    };
    
    Player.prototype.update = function (now, elapsed, keyboard) {
        for (var n = 0; n < NOTE_LIST.length; ++n) {
            this.updateKey(NOTE_LIST[n], now, elapsed, keyboard);
        }
    };
    
    return Player;
}());