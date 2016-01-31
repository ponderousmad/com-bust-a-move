var GAMEPLAY = (function () {
    "use strict";
    
    var loader = new ImageBatch("images/"),
        flareSound = new AUDIO.SoundEffect("audio/sfx/sfxFlare01.ogg"),
        wrongSound = new AUDIO.SoundEffect("audio/sfx/sfxDingWrong.ogg"),
        dings = [],
        dances = [
            new Dance(loader, "dancers/amy_idle_", "dancers/amy_dance_", "dancers/amy_jump_"),
            new Dance(loader, "dancers/amy_idle_", "dancers/betty_dance_", "dancers/amy_jump_"),
            new Dance(loader, "dancers/amy_idle_", "dancers/charlie_dance_", "dancers/amy_jump_"),
            new Dance(loader, "dancers/amy_idle_", "dancers/dave_dance_", "dancers/amy_jump_")
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
    
    for (var d = 1; d <= MAX_SEQUENCE_LENGTH; ++d) {
        dings.push(new AUDIO.SoundEffect("audio/sfx/sfxDing0" + d + ".ogg"))
    }
    loader.commit();
    
    function getRandomElement(list) {
        return list[Math.floor(Math.random() * list.length - 0.00001)];
    }
    
    function Dancer(letters, tints) {
        this.letter = getRandomElement(letters);
        this.dance = getRandomElement(dances);
        this.tint = getRandomElement(tints);
        this.status = false;
    }
    
    Dancer.prototype.draw = function (context, images, x, y, flip, jump) {
        var image = images[this.letter],
            width = image.width,
            height = image.height;
        
        context.save();
        context.translate(x, 0);
        if (!flip) {
            context.scale(-1, 1);
        }
        this.dance.draw(context, 0, y + BASELINE, this.status, jump, this.tint);
        context.restore();
        
        y += LETTERLINE;
        
        if (this.status) {
            context.fillStyle = "rgba(0,255,0,0.25)";
            context.fillRect(x - width * 0.5, y - height * 0.5, width, height);
        }
        
        DRAW.centered(context, image, x, y);
    };
    
    Dancer.prototype.isLetter = function (letter) {
        return letter === this.letter;
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
    
    Dancer.prototype.isActive = function () {
        return this.status;
    };
    
    Dancer.prototype.reset = function () {
        if (this.status) {
            this.status = false;
            return true;
        }
        return false;
    };
    
    Dancer.prototype.jump = function () {
        flareSound.play();
        return this.dance.startJump();
    };
    
    Dancer.prototype.updateJump = function (elapsed, jump) {
        return this.dance.updateJump(elapsed, jump);
    };
    
    function letterInSequence(sequence, letter) {
        for (var i = 0; i < sequence.length; ++i) {
            if (sequence[i].isLetter(letter)) {
                return true;
            }
        }
        return false;
    }
    
    Player.prototype.createSequence = function (length) {
        var sequence = [];
        for (var c = 0; c < length; ++c) {
            var random = null;
            while (random === null) {
                random = new Dancer(this.letters, this.tints);
                if (letterInSequence(sequence, random.letter)) {
                    random = null;
                }
            }
            sequence.push(random);
        }
        return sequence;
    };
    
    function Player(beatKeys, letters, tints, rhythm, images, offsetDirection) {
        this.beatKeys = beatKeys;
        this.letters = letters;
        this.rhythm = rhythm;
        this.tints = tints;
        
        this.images = images;
        this.offsetDirection = offsetDirection;
        
        this.sequenceLength = MIN_SEQUENCE_LENGTH;
        this.sequence = this.createSequence(this.sequenceLength);
        this.jump = null;
        this.onBeat = false;
        this.pressOnBeat = false;
        this.beatTolerance = BEAT_TOLERANCE;
        this.score = 0;
        this.activeBeats = [];
        this.sync();
    }
    
    Player.prototype.sync = function() {
        this.lastBeat = this.rhythm.beatNumber(TIMING.now(), this.beatTolerance);
        this.sequenceBeat = null;
    };
    
    Player.prototype.drawSequence = function (context, centerX, centerY) {
        var offset = BASE_OFFSET;
        for (var i = 0; i < this.sequence.length; ++i) {
            var dancer = this.sequence[i],
                xOffset = centerX + offset * this.offsetDirection;
            dancer.draw(context, this.images, xOffset, centerY, this.offsetDirection < 0, i == 0 ? this.jump : null);
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
        context.fillStyle = "white";
        context.font = "5px serif";
        DRAW.centeredText(context, this.score.toString(), (BASE_OFFSET + 50) * this.offsetDirection, centerY + PRESSLINE + 10);
    };
    
    Player.prototype.activeDancers = function() {
        var count = 0;
        for (var i = 0; i < this.sequence.length; ++i) {
            if (this.sequence[i].isActive()) {
                ++count;
            }
        }
        return count;
    };
    
    Player.prototype.sequencePressed = function(letter) {        
        for (var i = 0; i < this.sequence.length; ++i) {
            var dancer = this.sequence[i];
            if (dancer.isLetter(letter)) {
                if(dancer.check(letter)) {
                    return this.activeDancers();
                }
                return null;
            }
        }
        return null;
    };
    
    Player.prototype.updateLetter = function (letter, keyboard) {
        if (keyboard.wasAsciiPressed(letter)) {
            console.log("Pressed this frame: " + letter);
            var time = keyboard.keyTime(letter.charCodeAt());
            if (this.rhythm.onBeat(time, this.beatTolerance)) {
                this.pressOnBeat = true;
                if (this.rhythm.beatNumber(time, this.beatTolerance) > this.sequenceBeat) {
                    console.log("Sequence on beat");
                    return true;
                } else {
                    this.lostBeat("Beat repeat");
                }
            } else {
                this.lostBeat("Off beat");
                return false;
            }
        }
        return false;
    };
    
    Player.prototype.lostBeat = function(context) {
        if (context) {
            console.log("Lost beat: " + context);
        }
        this.sequenceBeat = null;
        if (this.jump !== null) {
            return;
        }
        var resetCount = 0;
        for (var i = 0; i < this.sequence.length; ++i) {
            var dancer = this.sequence[i];
            if (dancer.reset()) {
                resetCount += 1;
            }
        }
        if (resetCount > 0) {
            wrongSound.play();
            if (!context) {
                console.log("Lost beat: Dropped a beat");
            }
            console.log("Reset letters");
        }
    };
    
    Player.prototype.sacrifice = function() {
        console.log("attempt sacrifice");
        this.activeBeats = [];
        for (var i = 0; i < this.sequence.length; ++i) {
            if (this.sequence[i].isActive()) {
                this.jump = this.sequence[i].jump();
                var active = this.activeDancers();
                this.score += active > 1 ? Math.pow(2, active) : active;
                break;
            }
        }
    };
    
    Player.prototype.update = function (now, elapsed, keyboard, otherPlayer) {
        var pressed = [];
        for (var l = 0; l < this.letters.length; ++l) {
            var letter = this.letters[l];
            if (this.updateLetter(letter, keyboard)) {
                pressed.push(letter);
            }
        }
        for (var b = 0; b < this.beatKeys.length; ++b) {
            if (this.updateLetter(this.beatKeys[b], keyboard, false)) {
                this.activeBeats.push(b);
            }
        }
        
        var beat = this.rhythm.beatNumber(now, this.beatTolerance);
        
        if (this.activeBeats.length > 0 && pressed.length > 0) {
            this.lostBeat("Too many letters");
        } else if(this.activeBeats.length > 1) {
            this.sacrifice();
        } else if(pressed.length === 1) {
            var activated = this.sequencePressed(pressed[0]);
            if (activated === null) {
                this.lostBeat("letter repeat");
            } else {
                this.sequenceBeat = beat;
                dings[activated-1].play();
            }
        } else if(this.activeBeats.length > 0) {
            this.sequenceBeat = beat;
        }
        
        this.onBeat = this.rhythm.onBeat(now, this.beatTolerance);
        
        var beat = this.rhythm.beatNumber(now, this.beatTolerance);
        if (!this.onBeat && beat > this.lastBeat) {
            this.lastBeat = beat;
            this.pressOnBeat = false;
            this.activeBeats = [];
        }
        
        if (this.onBeat && this.lastBeat > this.sequenceBeat) {
            this.lostBeat();
        }
    
        if (this.jump !== null) {
            if (this.sequence[0].updateJump(elapsed, this.jump)) {
                this.jump = null;
                if (this.sequenceLength < MAX_SEQUENCE_LENGTH) {
                    this.sequenceLength += 1;
                }
                this.sequence = this.createSequence(this.sequenceLength);
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
        updateDances: updateDances,
        randomElement: getRandomElement
    };
}());