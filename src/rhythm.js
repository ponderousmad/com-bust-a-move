var Rhythm = (function () {
    "use strict";
    
    function Rhythm(period, start) {
        this.period = period;
        this.start = 0;
    }
    
    Rhythm.prototype.onBeat = function (time, tolerance) {
        time -= this.start;
        var proximity = time % this.period;
        if (proximity > this.period * 0.5) {
            proximity = this.period - proximity;
        }
        
        return (proximity / this.period) < tolerance;
    };
    
    Rhythm.prototype.beatNumber = function (time, tolerance) {
        return Math.floor(((time - this.start) / this.period) + tolerance);
    };
    
    return Rhythm;
}());
