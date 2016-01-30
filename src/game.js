(function () {
    "use strict";
    
    var loader = new ImageBatch("images/"),
        fire = loader.load("fire.png"),
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
            GT : 190,
            A : "A".charCodeAt(),
            S : "S".charCodeAt(),
            D : "D".charCodeAt(),
            F : "F".charCodeAt()
        };
    
    
    loader.commit();
    
    function update() {
    }
    
    function draw(context, width, height) {
        context.font = "50px serif";
        DRAW.centered(context, fire, width * 0.5, height * 0.5);
        
        DRAW.centeredText(context, "Com-bust-a-move", width * 0.5, height * 0.5, "black", "white", 2);
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
