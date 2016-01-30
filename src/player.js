var GAMEPLAY = (function () {
    "use strict";
    
    var loader = new ImageBatch("images/"),
        noteSpacing = 20,
        KEY_DRAW_FOR = 250,
        BASE_OFFSET = 37,
        BASELINE = 19,
        NOTELINE = -25,
        PRESSLINE = 30,
        DROP_TIME = 1000,
        LONG_PAST = 100000,
        MIN_SEQUENCE_LENGTH = 3,
        MAX_SEQUENCE_LENGTH = 6,
        bell = new AUDIO.SoundEffect("audio/sfx/sfxFlare01.ogg"),
        dancers = {
            U: new Dancer(loader, "guy1_"),
            D: new Dancer(loader, "guy2_"),
            L: new Dancer(loader, "guy3_"),
            R: new Dancer(loader, "guy4_")
        },
        NOTE_LIST = ["U", "D", "L", "R"];
    
    loader.commit();
    
    function getRandomNote() {
        return NOTE_LIST[Math.floor(Math.random() * NOTE_LIST.length - 0.00001)];
    }
    
    function Beat() {
        this.note = getRandomNote();
        this.status = false;
        this.dancer = dancers[this.note];
    }
    
    Beat.prototype.draw = function (context, images, x, y) {
        var image = images[this.note],
            width = image.width,
            height = image.height;
        
        this.dancer.draw(context, x, y + BASELINE);
        
        y += NOTELINE;
        
        if (this.status) {
            context.fillStyle = "rgba(0,255,0,0.25)";
            context.fillRect(x - width * 0.5, y - height * 0.5, width, height);
        }
        
        DRAW.centered(context, image, x, y);
    };
    
    Beat.prototype.check = function (note, now, elapsed) {
        if (this.note === note) {
            this.status = true;
            return true;
        }
        return false;
    };
    
    function BeatDrop() {
        this.remaining = DROP_TIME;
    }
    
    BeatDrop.prototype.update = function (elapsed) {
        this.remaining -= elapsed;
        return this.remaining <= 0;
    }
    
    function createSequence(length) {
        var sequence = [];
        for (var c = 0; c < length; ++c) {
            sequence.push(new Beat());
        }
        return sequence;
    }
    
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
        
        this.sequenceLength = MIN_SEQUENCE_LENGTH;
        this.sequence = createSequence(this.sequenceLength);
        this.sequenceOffset = 0;
        this.endSequence = null;
    }
    
    Player.prototype.resetLastPressed = function () {
        this.lastPressed = {
            U: LONG_PAST,
            D: LONG_PAST,
            L: LONG_PAST,
            R: LONG_PAST
        };
    };
    
    Player.prototype.drawPressedNote = function (context, centerX, centerY, note, offset) {
        if (this.lastPressed[note] < KEY_DRAW_FOR) {
            DRAW.centered(context, this.images[note], centerX + offset * this.offsetDirection, centerY + PRESSLINE);
        }
    };
    
    Player.prototype.drawSequence = function (context, centerX, centerY) {
        var offset = BASE_OFFSET;
        for (var i = 0; i < this.sequence.length; ++i) {
            var beat = this.sequence[i];
            beat.draw(context, this.images, centerX + offset * this.offsetDirection, centerY);
            offset += noteSpacing;
        }
    };
    
    Player.prototype.draw = function (context, centerX, centerY) {
        var offset = BASE_OFFSET;
        for (var n = 0; n < NOTE_LIST.length; ++n) {
            this.drawPressedNote(context, centerX, centerY, NOTE_LIST[n], offset);
            offset += noteSpacing;
        }
        this.drawSequence(context, centerX, centerY);
    };
    
    Player.prototype.sequencePressed = function(note, now, elapsed) {
        if (this.sequenceOffset < this.sequence.length) {
            var beat = this.sequence[this.sequenceOffset];
            if (beat.check(note, now, elapsed)) {
                this.sequenceOffset += 1;
                if (this.sequenceOffset == this.sequence.length) {
                    this.endSequence = new BeatDrop();
                    bell.play();
                }
            }
        }
    };
    
    Player.prototype.updateNote = function(note, now, elapsed, keyboard) {
        var keyCode = this.keyMap[note];
        if (keyboard.wasKeyPressed(keyCode)) {
            this.lastPressed[note] = now - keyboard.keyTime(keyCode);
            this.sequencePressed(note);
        } else if (this.lastPressed[note] > 0) {
            this.lastPressed[note] += elapsed;
        }
    };
    
    Player.prototype.update = function (now, elapsed, keyboard) {
        for (var n = 0; n < NOTE_LIST.length; ++n) {
            this.updateNote(NOTE_LIST[n], now, elapsed, keyboard);
        }
        
        if (this.endSequence !== null) {
            if (this.endSequence.update(elapsed)) {
                this.endSequence = null;
                if (this.sequenceLength < MAX_SEQUENCE_LENGTH) {
                    this.sequenceLength += 1;
                }
                this.sequenceOffset = 0;
                this.sequence = createSequence(this.sequenceLength);
            }
        }
    };
        
    function updateDancers(elapsed) {
        for (var n = 0; n < NOTE_LIST.length; ++n) {
            dancers[NOTE_LIST[n]].update(elapsed);
        }
    }
    
    return {
        Player: Player,
        updateDancers: updateDancers
    };
}());