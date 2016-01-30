var ImageBatch = (function (baseURL) {
    "use strict";

    function ImageBatch(basePath, onComplete) {
        this._toLoad = 0;
        this._commited = false;
        this._basePath = basePath;
        this._onComplete = onComplete;
        this.loaded = false;
    }

    ImageBatch.prototype.setPath = function (path) {
        this._basePath = path;
    };

    ImageBatch.prototype._checkComplete = function () {
        if (this._commited) {
            if (this._toLoad === 0) {
                this.loaded = true;
                if (this._onComplete) {
                    this._onComplete();
                }
            }
        }
    };

    ImageBatch.prototype.load = function (resource, onLoad) {
        this._toLoad += 1;
        var image = new Image();
        var self =  this;
        image.onload = function () {
            if (onLoad) {
                onLoad(image);
            }
            self._toLoad -= 1;
            self._checkComplete();
        };

        var path = baseURL + (this._basePath || "") + resource;

        image.src = path;
        return image;
    };

    ImageBatch.prototype.commit = function () {
        this._commited = true;
        this._checkComplete();
    };
    
    return ImageBatch;
}(rootURL));

var DRAW = (function () {
    "use strict";
    
    function drawCentered(context, image, pos, y) {
        var x = pos;
        if (typeof x !== "number") {
            y = pos.y;
            x = pos.x;
        }
        context.drawImage(image, x - image.width * 0.5, y - image.height * 0.5);
    }
    
    function drawTextCentered(context, text, x, y, fill, shadow, offset) {
        context.textAlign = "center";
        if (shadow) {
            context.fillStyle = shadow;
            if (!offset) {
                offset = 2;
            }
            context.fillText(text, x + offset, y + offset);
        }
        if (fill) {
            context.fillStyle = fill;
        }
        context.fillText(text, x, y);
    }
    
    return {
        centered: drawCentered,
        centeredText: drawTextCentered
    };
}());