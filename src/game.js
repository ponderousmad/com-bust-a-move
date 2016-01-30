(function () {
    "use strict";
    
    var loader = new ImageBatch("images/"),
        fire = loader.load("fire.png"),
        p1Images = {
            U: loader.load("up.png"),
            D: loader.load("down.png"),
            L: loader.load("left.png"),
            R: loader.load("right.png")
        },
        p2Images = {
            U: loader.load("w.png"),
            D: loader.load("s.png"),
            L: loader.load("a.png"),
            R: loader.load("d.png")
        },
        keyboardState = new INPUT.KeyboardState(window),
        mouseState = null,
        touchState = null,
        
        KEYS = {
            Up : 38,
            Down : 40,
            Left : 37,
            Right : 39,
            Space : 32,
            Escape : 27,
            LT : 188,
            GT : 190
            
        },
        player1 = new Player([KEYS.Up, KEYS.Down, KEYS.Left, KEYS.Right], p1Images, 1),
        player2 = new Player(["W".charCodeAt(), "S".charCodeAt(), "A".charCodeAt(), "D".charCodeAt()], p2Images, -1),
        twoPlayer = true;
    
    function Sequence() {
        this.notes = [];
    }
    
    loader.commit();
    
    function update() {
        var now = TIMING.now(),
            elapsed = TIMING.updateDelta(now);
        
        player1.update(now, elapsed, keyboardState);
        if (twoPlayer) {
            player2.update(now, elapsed, keyboardState);
        }
        
        keyboardState.postUpdate();
    }
    
    function draw(context, width, height) {
        var centerX = width * 0.5,
            centerY = height * 0.5;
        context.font = "50px serif";
        if (loader.loaded) {
            DRAW.centered(context, fire, centerX, centerY);
            player1.draw(context, centerX, centerY);
            if (twoPlayer) {
                player2.draw(context, centerX, centerY);
            }
        }
        
        // DRAW.centeredText(context, "Com-bust-a-move", centerX, centerY, "black", "white", 2);
    }
    
    function safeWidth() {
        var inner = window.innerWidth,
            client = document.documentElement.clientWidth || inner,
            body = document.getElementsByTagName('body')[0].clientWidth || inner;
            
        return Math.min(inner, client, body);
    }
    
    function safeHeight() {
        var inner = window.innerHeight,
            client = document.documentElement.clientHeight || inner,
            body = document.getElementsByTagName('body')[0].clientHeight || inner;
            
        return Math.min(inner, client, body) - 5;
    }
    
    window.onload = function (e) {
        console.log("window.onload", e, Date.now());
        var canvas = document.getElementById("canvas"),
            context = canvas.getContext("2d");
            
        mouseState = new INPUT.MouseState(canvas);
        touchState = new INPUT.TouchState(canvas);

        function drawFrame() {
            canvas.width  = safeWidth();
            canvas.height = safeHeight();
            requestAnimationFrame(drawFrame);
            draw(context, canvas.width, canvas.height);
        }
        
        window.setInterval(update, 16);
        
        drawFrame();
    };
}());
