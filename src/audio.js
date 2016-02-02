var AUDIO = (function (baseURL) {
    "use strict";

    var gAudioContext = null,
        gNoteOn = false;
    try {
        var Constructor = window.AudioContext || window.webkitAudioContext;
        gAudioContext = new Constructor();
    } catch (error) {
        console.log("Error initializing audio:");
        console.log(error);
    }
    
    function audioNoteOn() {
        if (!gNoteOn) {
            gNoteOn = true;
            if (gAudioContext !== null) {
                // Trick to enable audio without downloading a sound from:
                // https://paulbakaus.com/tutorials/html5/web-audio-on-ios/
                // create empty buffer
                var buffer = gAudioContext.createBuffer(1, 1, 22050);
                var source = gAudioContext.createBufferSource();
                source.buffer = buffer;

                // connect to output (your speakers)
                source.connect(gAudioContext.destination);

                // play the file
                source.noteOn(0);
            }
        }
    }
    
    function setup(sound, resource, loop) {
        sound.resource = resource;
        sound.source = null;
        sound.buffer = null;
        sound.loop = loop;
        
        resource = baseURL + resource;
        
        if (gAudioContext !== null) {
            var request = new XMLHttpRequest();
            request.open("GET", resource, true);
            request.responseType = "arraybuffer";
            request.onload = function () {
                var audioData = request.response;
                gAudioContext.decodeAudioData(audioData,
                    function (buffer) {
                        sound.buffer = buffer;
                    },
                    function (e) {
                        console.log("Error with decoding audio data" + e.err);
                    });
            };
            request.send();
        }
    }
    
    function play(sound, enableGain) {
        if (gAudioContext === null || sound.buffer === null) {
            return;
        }
        if (sound.source) {
            sound.source.disconnect(gAudioContext.destination);
        }
        sound.source = gAudioContext.createBufferSource();
        sound.source.buffer = sound.buffer;
        sound.source.loop = sound.loop;
        if (enableGain) {
            sound.gain = gAudioContext.createGain();
            sound.gain.gain.value = sound.volume;
            sound.source.connect(sound.gain);
            sound.gain.connect(gAudioContext.destination);
        } else {
            sound.source.connect(gAudioContext.destination);
        }
        sound.source.start();
    }

    function SoundEffect(resource) {
        setup(this, resource, false);
    }
        
    SoundEffect.prototype.isLoaded = function () {
        return gAudioContext === null || this.buffer !== null;
    };

    SoundEffect.prototype.play = function () {
        play(this, false);
    };
    
    function Music(resource) {
        setup(this, resource, true);
        this.playing = false;
        this.gain = null;
        this.volume = 1;
    }
    
    Music.prototype.isLoaded = function() {
        return gAudioContext === null || this.buffer !== null;
    };

    Music.prototype.play = function () {
        play(this, true);
        this.playing = true;
    };
    
    Music.prototype.setVolume = function (volume) {
        this.volume = volume;
        if (this.playing) {
            this.gain.gain.value = volume;
        }
    }
    
    Music.prototype.stop = function () {
        if (this.source) {
            this.source.stop();
            this.gain.disconnect(gAudioContext.destination);
            this.source.disconnect(this.gain);
            this.gain = null;
            this.source = null;
        }
        this.playing = false;
    }
    
    return {
        SoundEffect: SoundEffect,
        Music: Music,
        noteOn: audioNoteOn
    };
}(rootURL));
