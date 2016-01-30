var Flipbook = (function () {
    function Flipbook(imageBatch, baseName, frameCount, digits) {
        this.frames = [];
        for (var i = 0; i < frameCount; ++i) {
            var number = i.toString();
            while (number.length < digits) {
                number = "0" + number;
            }
            this.frames.push(imageBatch.load(baseName + number + ".png"));
        }
    }
    
    Flipbook.prototype.setupPlayback = function(frameTime, loop) {
        return {
            elapsed: 0,
            timePerFrame: frameTime,
            fractionComplete: 0,
            loop: loop === true
        };
    };
    
    Flipbook.prototype.updatePlayback = function(elapsed, playback) {
        var totalLength = playback.timePerFrame * this.frames.length;
        playback.elapsed += elapsed;
        if(playback.loop) {
            playback.elapsed = playback.elapsed % totalLength;
        }
        if (playback.elapsed > totalLength) {
            playback.fractionComplete = 0;
            return true;
        } else {
            playback.fractionComplete = playback.elapsed / totalLength;
            return false;
        }
    };
    
    Flipbook.prototype.draw = function(context, playback, x, y, center, width, height) {
        if (!width) {
            width = this.frames[0].width;
        }
        if (!height) {
            height = this.frames[0].height;
        }
        var index = Math.min(this.frames.length - 1, Math.floor(playback.elapsed / playback.timePerFrame));
        context.drawImage(this.frames[index], x - (center ? width * 0.5 : 0), y - (center ? height * 0.5 : 0), width, height);
    };
    
    return Flipbook;
}());
