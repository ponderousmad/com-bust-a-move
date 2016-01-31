var GAMEPLAY = (function () {
    "use strict";
    
    var loader = new ImageBatch("images/"),
        flareSound = new AUDIO.SoundEffect("audio/sfx/sfxFlare01.ogg"),
        wrongSound = new AUDIO.SoundEffect("audio/sfx/sfxDingWrong.ogg"),
        dances = [
            new Dance(loader, "dancers/amy_dance_"),
            new Dance(loader, "dancers/betty_dance_"),
            new Dance(loader, "dancers/charlie_dance_"),
            new Dance(loader, "dancers/dave_dance_")
        ],
        DANCER_SPACING = 20,
        KEY_DRAW_FOR = 250,
        BASE_OFFSET = 37,
        BASELINE = 19,
        LETTERLINE = -25,
        PRESSLINE = 30,
        FIRE_JUMP_TIME = 1000,
        BEAT_TOLERANCE = 0.4,
        MIN_SEQUENCE_LENGTH = 3,
        MAX_SEQUENCE_LENGTH = 6;
    
    loader.commit();
    
    function getRandomElement(list) {
        return list[Math.floor(Math.random() * list.length - 0.00001)];
    }
    
    function Dancer(letters) {
        this.letter = getRandomElement(letters);
        this.dancer = getRandomElement(dances);
        this.status = false;
    }
    
    Dancer.prototype.draw = function (context, images, x, y) {
        var image = images[this.letter],
            width = image.width,
            height = image.height;
        
        this.dancer.draw(context, x, y + BASELINE);
        
        y += LETTERLINE;
        
        if (this.status) {
            context.fillStyle = "rgba(0,255,0,0.25)";
            context.fillRect(x - width * 0.5, y - height * 0.5, width, height);
        }
        
        DRAW.centered(context, image, x, y);
    };
    
    Dancer.prototype.check = function (letter) {
        if (this.letter === letter) {
            if (!this.status) {
                this.status = true;
                return true;
            }
        }
        return false;
    };
    
    Dancer.prototype.reset = function () {
        if (this.status) {
            this.status = false;
            return true;
        }
        return false;
    };
    
    function FireJump() {
        this.remaining = FIRE_JUMP_TIME;
    }
    
    FireJump.prototype.update = function (elapsed) {
        this.remaining -= elapsed;
        return this.remaining <= 0;
    };
    
    function letterInSequence(sequence, letter) {
        for (var i = 0; i < sequence.length; ++i) {
            if (sequence[i].letter === letter) {
                return true;
            }
        }
        return false;
    }
    
    function createSequence(letters, length) {
        var sequence = [];
        for (var c = 0; c < length; ++c) {
            var random = null;
            while (random === null) {
                random = new Dancer(letters);
                if (letterInSequence(sequence, random.letter)) {
                    random = null;
                }
            }
            sequence.push(random);
        }
        return sequence;
    }
    
    function Player(beatKeys, letters, rhythm, images, offsetDirection) {
        this.beatKeys = beatKeys;
        this.letters = letters;
        this.rhythm = rhythm;
        
        this.images = images;
        this.offsetDirection = offsetDirection;
        
        this.sequenceLength = MIN_SEQUENCE_LENGTH;
        this.sequence = createSequence(this.letters, this.sequenceLength);
        this.jump = null;
        this.lastBeat = rhythm.beatNumber(TIMING.now(), BEAT_TOLERANCE);
        this.onBeat = false;
        this.pressOnBeat = false;
        this.firstPress = true;
    }
    
    Player.prototype.drawSequence = function (context, centerX, centerY) {
        var offset = BASE_OFFSET;
        for (var i = 0; i < this.sequence.length; ++i) {
            var dancer = this.sequence[i];
            dancer.draw(context, this.images, centerX + offset * this.offsetDirection, centerY);
            offset += DANCER_SPACING;
        }
    };
    
    Player.prototype.draw = function (context, centerX, centerY) {
        this.drawSequence(context, centerX, centerY);
        
        if (this.onBeat) {
            if (this.pressOnBeat) {
                context.fillStyle = "green";
            } else {
                context.fillStyle = "red";
            }
            context.fillRect(centerX + BASE_OFFSET * this.offsetDirection, centerY + PRESSLINE, 100 * this.offsetDirection, 1);
        }
        context.font = "5px serif";
        DRAW.centeredText(context, this.lastBeat.toString(), (BASE_OFFSET + 50) * this.offsetDirection, centerY + PRESSLINE + 10);
    };
    
    Player.prototype.sequencePressed = function(letter) {
        for (var i = 0; i < this.sequence.length; ++i) {
            var dancer = this.sequence[i];
            if (dancer.letter === letter) {
                if(dancer.check(letter)) {
                    return true;
                }
                return false;
            }
        }
        return false;
    };
    
    Player.prototype.updateLetter = function (letter, keyboard) {
        if (keyboard.wasAsciiPressed(letter)) {
            if (this.firstPress) {
                this.rhythm.restart();
                this.firstPress = true;
                this.lastBeat = 0;
            }
            var time = keyboard.keyTime(letter.charCodeAt());
            if (this.rhythm.onBeat(time, BEAT_TOLERANCE)) {
                this.pressOnBeat = true;
                if (this.rhythm.beatNumber(time, BEAT_TOLERANCE) >= this.lastBeat) {
                    return true;
                } else {
                    this.lostBeat();
                }
            } else {
                this.lostBeat();
                return false;
            }
        }
        return false;
    };
    
    Player.prototype.lostBeat = function() {
        var resetCount = 0;
        for (var i = 0; i < this.sequence.length; ++i) {
            var dancer = this.sequence[i];
            if (dancer.reset()) {
                resetCount += 1;
            }
        }
        if (resetCount > 0) {
            wrongSound.play();
        }
    };
    
    Player.prototype.sacrifice = function() {
        this.jump = new FireJump();
    };
    
    Player.prototype.update = function (now, elapsed, keyboard) {
        var pressed = [];
        for (var l = 0; l < this.letters.length; ++l) {
            var letter = this.letters[l];
            if (this.updateLetter(letter, keyboard)) {
                pressed.push(letter);
            }
        }
        var beats = 0;
        for (var b = 0; b < this.beatKeys.length; ++b) {
            if (this.updateLetter(this.beatKeys[b], keyboard, false)) {
                beats += 1;
            }
        }
        if (beats > 0 && pressed.length > 0) {
            this.lostBeat();
        } else if(beats > 2) {
            this.sacrifice();
        } else if(pressed.length === 1) {
            if(this.sequencePressed(pressed[0])) {
                this.lastBeat += 1;
            } else {
                this.lostBeat();
            }
        }
        
        var beat = this.rhythm.beatNumber(now, BEAT_TOLERANCE);
        if (beat > this.lastBeat) {
            this.lostBeat();
            this.lastBeat = beat;
            this.pressOnBeat = false;
        }
        
        this.onBeat = this.rhythm.onBeat(now, BEAT_TOLERANCE);
    
        if (this.jump !== null) {
            if (this.jump.update(elapsed)) {
                this.jump = null;
                if (this.sequenceLength < MAX_SEQUENCE_LENGTH) {
                    this.sequenceLength += 1;
                }
                this.sequence = createSequence(this.letters, this.sequenceLength);
            }
        }
    };

    function updateDances(elapsed) {
        for (var d = 0; d < dances.length; ++d) {
            dances[d].update(elapsed);
        }
    }
    
    return {
        Player: Player,
        updateDances: updateDances
    };
}());