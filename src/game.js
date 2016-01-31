(function () {
    "use strict";
    
    var KEYS = {
            Up : 38,
            Down : 40,
            Left : 37,
            Right : 39,
            Space : 32,
            Escape : 27,
            LT : 188,
            GT : 190
        },
        BACKGROUND_PIXEL_WIDTH = 300,
        BASE_RHYTHM = 572,
        FIRE_FRAMES = 16,
        FIRE_WIDTH = 106,
        FIRE_HEIGHT = FIRE_WIDTH,
        DRUM_FRAMES = 12,
        DRUM_WIDTH = 160,
        DRUM_HEIGHT = 40,
        CROWD_FRAMES = 8,
        CROWD_WIDTH = BACKGROUND_PIXEL_WIDTH,
        CROWD_HEIGHT = 150,
        
        PLAYER1_LETTERS = ["Q", "W", "E", "R", "A", "S", "D", "F"],
        PLAYER2_LETTERS = ["O", "I", "U", "Y", "K", "J", "H", "G"],
        
        PLAYER1_TINTS = [
            [1.8, 0, 0],
            [1.8, 0.9, 0],
            [1.8, 1.8, 0]
        ],
        PLAYER2_TINTS = [
            [0, 0, 1.8],
            [0, 0.9, 1.8],
            [1.8, 0, 1.8]
        ],
        TRACKS = 6,

        loader = new ImageBatch("images/"),
        fire = new Flipbook(loader, "fire1/fire_", FIRE_FRAMES, 2),
        drum = new Flipbook(loader, "drumbeat_", DRUM_FRAMES, 2),
        crowd = new Flipbook(loader, "crowd_bounce_", CROWD_FRAMES, 2),
        avatar = {
            leftSlap: new Flipbook(loader, "bongo/slap_l_", 6, 2),
            rightSlap: new Flipbook(loader, "bongo/slap_r_", 6, 2),
            idle: new Flipbook(loader, "avatar_idle_", 4, 2),
            bongo: loader.load("bongo/bongo.png"),
            bongoLetters: {
                Z: loader.load("bongo/bongo_z.png"),
                X: loader.load("bongo/bongo_x.png"),
                M: loader.load("bongo/bongo_n.png"),
                N: loader.load("bongo/bongo_m.png")
            }
        },
        background = loader.load("bg.png"),
        letterImages = {},
        keyboardState = new INPUT.KeyboardState(window),
        mouseState = null,
        touchState = null,
        ryhthm = new Rhythm(572),
        speedFactor = 1,
        inSync = false,
        
        player1 = new GAMEPLAY.Player(["X", "Z"], "C", PLAYER1_LETTERS, PLAYER1_TINTS, ryhthm, avatar, letterImages, -1),
        player2 = new GAMEPLAY.Player(["N", "M"], "B", PLAYER2_LETTERS, PLAYER2_TINTS, ryhthm, avatar, letterImages, 1),
        twoPlayer = true,
        musicTracks = [],
        music = null,
        menu = null,
        fireDraw = fire.setupPlayback(2 * BASE_RHYTHM / FIRE_FRAMES, true),
        drumDraw = null,
        crowdDraw = null;
    
    function resetRhythm() {
        var rate = BASE_RHYTHM * speedFactor;
        drumDraw = drum.setupPlayback(rate / DRUM_FRAMES, true),
        crowdDraw = crowd.setupPlayback(rate / CROWD_FRAMES, true);
        ryhthm.restart(BASE_RHYTHM * speedFactor);
        player1.sync();
        player2.sync();
    }
    
    (function () {
        for (var letter = "A"; letter <= "Z"; letter = String.fromCharCode(letter.charCodeAt() + 1)) {
             letterImages[letter] = loader.load("font/" + letter.toLowerCase() + ".png");
        }
        for (var track = 1; track <= TRACKS; ++track) {
            musicTracks.push(new AUDIO.Music("audio/mus/musLoop0" + track + ".ogg"));
        }
        music = GAMEPLAY.randomElement(musicTracks);
        loader.commit();
        resetRhythm();
    }());
    
    function update() {
        var now = TIMING.now(),
            elapsed = TIMING.updateDelta(now);
        
        if (menu !== null) {
            menu.update(elapsed);
        } else {
            if (!inSync) {
                if (keyboardState.keysDown() > 0) {
                    resetRhythm();
                    inSync = true;
                }
            }

            player1.update(now, elapsed, keyboardState, player2);
            if (twoPlayer) {
                player2.update(now, elapsed, keyboardState, player1);
            }

            fire.updatePlayback(elapsed, fireDraw);
            drum.updatePlayback(elapsed, drumDraw);
            crowd.updatePlayback(elapsed, crowdDraw);

            if (music.isLoaded() && !music.playing) {
                music.play();
                ryhthm.restart();
            }
            GAMEPLAY.updateDances(elapsed);
        }
        
        keyboardState.postUpdate();
    }
    
    function pixelated(context, drawPixels) {
        var smooth = !drawPixels;
        context.mozImageSmoothingEnabled = smooth;
        context.webkitImageSmoothingEnabled = smooth;
        context.msImageSmoothingEnabled = smooth;
        context.imageSmoothingEnabled = smooth;
    }
    
    function draw(context, width, height) {
        var centerX = 0,
            centerY = 0,
            aspect = background.height / background.width,
            pixelSize = width / BACKGROUND_PIXEL_WIDTH;
        
        context.save();        
        pixelated(context, true);
        context.scale(pixelSize, pixelSize);
        context.translate(BACKGROUND_PIXEL_WIDTH * 0.5, (height * 0.5) / pixelSize);

        if (loader.loaded) {
            DRAW.centeredScaled(context, background, centerX, centerY, BACKGROUND_PIXEL_WIDTH, BACKGROUND_PIXEL_WIDTH * aspect);
            if (menu !== null) {
                menu.draw(context, width, height);
            } else {
                crowd.draw(context, crowdDraw, centerX, centerY + 2, ALIGN.Center, CROWD_WIDTH, CROWD_HEIGHT);
                fire.draw(context, fireDraw, centerX, centerY - 15, ALIGN.Center, FIRE_WIDTH, FIRE_HEIGHT);
                drum.draw(context, drumDraw, centerX, centerY + 40, ALIGN.Center, DRUM_WIDTH, DRUM_HEIGHT);
                player1.draw(context, centerX, centerY);
                if (twoPlayer) {
                    player2.draw(context, centerX, centerY);
                }
            }
        }
        context.restore();
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
