
// quelques fonctions utiles pour fair des calculs

function rotate_x(a) {
    return Math.sin(a * Math.PI)
}

function rotate_y(a) {
    return -Math.cos(a * Math.PI)
}

// algorithme permettant de rendre les mouvement de la caméra plus "smooth"

function do_ease(number, target, fact, limit=0.002) {
    if (Math.abs(target - number) < limit) {
        return target;
    } else {
        return number + (target - number) * fact;
    }
}


window.addEventListener("load", (event) => { // ne commencer le programme que lorseque tout sera loadé
    
    console.log("has been called");

    
    // hauteur, largeur du rendu
    var true_width = 800;
    var width = 800;
    var height = 900;
    var audioElement0 = document.createElement('audio');
    audioElement0.setAttribute('src', 'loop.wav');
    audioElement0.setAttribute('autoplay', 'autoplay');
    audioElement0.loop = true;

    var mapsize = 1280; // distance entre le centre et le coté de la map
    var canvas = document.querySelector("canvas#render"); // canvas de rendu principal
    var mapcanvas1 = new OffscreenCanvas(width, height);   // canvas de rendu pour les tracés
    var mapcanvas2 = new OffscreenCanvas(width, height);   // canvas de rendu pour les tracés
    var canvas1 = new OffscreenCanvas(width, height);   // canvas pour joueur 1
    var canvas2 = new OffscreenCanvas(width, height);   // canvas pour joueur 1
    var frameCount = 0;
    var time = 0;
    var deltatime;
    var start;
    var map_bitmap1;
    var map_bitmap2;

    // permet de s'assurer que les images sont loadées
    var images = [];
    function image_validator() {
        let n = images.length;
        images.push(false);
        return (event) => {
            console.log(`image ${n} has been loaded`);
            images[n] = true;
        }
    }

    const bg_tile = new Image(100, 200);
    bg_tile.onload = image_validator();
    bg_tile.src = "bg_tile.png";


    // initialise les contextes de dessins pour canvas
    var ctx = null;
    var ctx1 = null;
    var ctx2 = null;
    var mapctx1 = null;
    var mapctx2 = null;
    if (canvas.getContext) {
        ctx = canvas.getContext("2d");
        ctx1 = canvas1.getContext("2d");
        ctx2 = canvas2.getContext("2d");
        mapctx1 = mapcanvas1.getContext("2d", {willReadFrequently: true});
        mapctx2 = mapcanvas2.getContext("2d", {willReadFrequently: true});
    } else {
        alert("Canvas Graphics are not supported");
    }


    function draw_at_r(context, Pcenter, x, y, a, scale, func) {
        if (scale) {
            context.translate(Pcenter.x, Pcenter.y)
            context.scale(1.03, 1.03)
            context.translate(-Pcenter.x, -Pcenter.y)
        }
        context.save();
        context.translate(x, y);
        context.rotate(a * Math.PI);
        func();
        context.restore();
    }

    function windowResizeEvent() {
        let w = window.innerWidth;
        let w2 = Math.round(w / 2);
        let h = window.innerHeight;
        ctx1.canvas.width = w2;
        ctx1.canvas.height = h;
        ctx2.canvas.width = w2;
        ctx2.canvas.height = h;
        ctx.canvas.width = w;
        ctx.canvas.height = h;
        mapctx1.canvas.width = w2;
        mapctx1.canvas.height = h;
        mapctx2.canvas.width = w2;
        mapctx2.canvas.height = h;
        true_width = w;
        width = w2;
        height = h;
    }
    window.onresize = windowResizeEvent;
    windowResizeEvent();

    function loading(timeStamp) {
        if (images.every(Boolean)) {
            ctx1.save();
            ctx2.save();
            frame();
        } else {
            requestAnimationFrame(loading);
        }
    }

    var ease = 0.08;

    var Player1 = {  // objet joueur1, contient les attributs de joueur 1 
        x: 0.0,                 // position X
        y: -40.0,                 // position Y
        a: 0.0,                 // angle
        sa: 0.5,                // angle de l'écran
        v: 300,                 // vitesse du joueur
        av: 1,                  // vitesse de rotation du joueur
        kl: 0,                  // indique si le joueur a tourné durant cette frame
        kr: 0,                  // indique si le joueur a tourné durant cette frame
        k: false,               // indique si le joueur a tourné durant cette frame
        e: ease,                // facteur de smooth sur la caméra
        last: [0,-40],            // position de la frame précédente
        trace: [[[0,-40], [0,-40]]],// données du tracé
        color: "#f0f",          // couleure du joueur
        state: 0                // -1:dead, 0:playing, 1:jumping, 2:rushing, 3:breaking
    };

    var Player2 = {  // objet joueur1, contient les attributs de joueur 1 
        x: 0.0,                 // position X
        y: 40.0,                 // position Y
        a: 1.0,                 // angle
        sa: 0.5,                // angle de l'écran
        v: 300,                 // vitesse du joueur
        av: 1,                  // vitesse de rotation du joueur
        kl: 0,                  // indique si le joueur a tourné durant cette frame
        kr: 0,                  // indique si le joueur a tourné durant cette frame
        k: false,               // indique si le joueur a tourné durant cette frame
        e: ease,                // facteur de smooth sur la caméra
        last: [0,40],            // position de la frame précédente
        trace: [[[0,40], [0,40]]],// données du tracé
        color: "#0ff",          // couleure du joueur
        state: 0                // -1:dead, 0:playing, 1:jumping, 2:rushing, 3:breaking
    };

    function clock(timeStamp) {
            ctx.clearRect(0, 0, true_width, height);
            ctx1.clearRect(0, 0, width, height);
            ctx2.clearRect(0, 0, width, height);

            Player1.sa = do_ease(Player1.sa, Player1.a, Player1.e);
            Player1.x += rotate_x(Player1.a) * Player1.v * deltatime;
            Player1.y += rotate_y(Player1.a) * Player1.v * deltatime;
            if      (Player1.x >  mapsize - 6) {Player1.x =  mapsize - 6; Player1.state = -1} 
            else if (Player1.x < -mapsize + 6) {Player1.x = -mapsize + 6; Player1.state = -1}
            if      (Player1.y >  mapsize - 6) {Player1.y =  mapsize - 6; Player1.state = -1} 
            else if (Player1.y < -mapsize + 6) {Player1.y = -mapsize + 6; Player1.state = -1}

            Player2.sa = do_ease(Player2.sa, Player2.a, Player2.e);
            Player2.x += rotate_x(Player2.a) * Player2.v * deltatime;
            Player2.y += rotate_y(Player2.a) * Player2.v * deltatime;
            if      (Player2.x >  mapsize - 6) {Player2.x =  mapsize - 6; Player2.state = -1} 
            else if (Player2.x < -mapsize + 6) {Player2.x = -mapsize + 6; Player2.state = -1}
            if      (Player2.y >  mapsize - 6) {Player2.y =  mapsize - 6; Player2.state = -1} 
            else if (Player2.y < -mapsize + 6) {Player2.y = -mapsize + 6; Player2.state = -1}

            if (!Player1.k) {
                Player1.trace[0].pop(); 
                Player1.k = false;
            }
            Player1.trace[0].push(Player1.last);
            Player1.last = [Player1.x, Player1.y];

            if (!Player2.k) {
                Player2.trace[0].pop(); 
                Player2.k = false;
            }
            Player2.trace[0].push(Player2.last);
            Player2.last = [Player2.x, Player2.y];

            
            map_bitmap1 = mapctx1.getImageData(0, 0, width, height);
            map_bitmap2 = mapctx2.getImageData(0, 0, width, height);

            {
                let cam_a = Player1.a - Player1.sa;
                let dx = Math.round(rotate_x(cam_a) * 8);
                let dy = Math.round(rotate_y(cam_a) * 8);
                let hitX = Math.round(width*0.5) + dx;
                let hitY = Math.round(height*0.7) + dy;
                let hitR = map_bitmap1.data[hitY * map_bitmap1.width * 4 + hitX * 4 + 0];
                let hitG = map_bitmap1.data[hitY * map_bitmap1.width * 4 + hitX * 4 + 1];
                let hitB = map_bitmap1.data[hitY * map_bitmap1.width * 4 + hitX * 4 + 2];
                let hitA = map_bitmap1.data[hitY * map_bitmap1.width * 4 + hitX * 4 + 3];
                // console.log([hitR, hitG, hitB, hitA]);
                hitR = hitR > 10;
                hitG = hitG > 10;
                hitB = hitB > 10;
                hitA = hitA > 10;
                if (
                        ( hitR && !hitG &&  hitB) || 
                        ( hitR &&  hitG &&  hitB) ||
                        (!hitR &&  hitG &&  hitB)
                    ) {
                        Player1.state = -1;
                }
            }
            {
                let cam_a = Player2.a - Player2.sa;
                let dx = Math.round(rotate_x(cam_a) * 8);
                let dy = Math.round(rotate_y(cam_a) * 8);
                let hitX = Math.round(width*0.5) + dx;
                let hitY = Math.round(height*0.7) + dy;
                let hitR = map_bitmap2.data[hitY * map_bitmap2.width * 4 + hitX * 4 + 0];
                let hitG = map_bitmap2.data[hitY * map_bitmap2.width * 4 + hitX * 4 + 1];
                let hitB = map_bitmap2.data[hitY * map_bitmap2.width * 4 + hitX * 4 + 2];
                let hitA = map_bitmap2.data[hitY * map_bitmap2.width * 4 + hitX * 4 + 3];
                // console.log([hitR, hitG, hitB, hitA]);
                hitR = hitR > 10;
                hitG = hitG > 10;
                hitB = hitB > 10;
                hitA = hitA > 10;
                if (
                        ( hitR && !hitG &&  hitB) ||
                        ( hitR &&  hitG &&  hitB) || 
                        (!hitR &&  hitG &&  hitB)
                    ) {
                        Player2.state = -1;
                }
            }
            

            mapctx1.clearRect(0, 0, width, height);
            mapctx2.clearRect(0, 0, width, height);

            if (Player1.state == -1) {
                Player1.color = "#555";
            }
            if (Player2.state == -1) {
                Player2.color = "#555";
            }

            draw();
            ctx.drawImage(canvas1, 0, 0);
            ctx.save();
            ctx.translate(width, 0);
            ctx.drawImage(canvas2, 0, 0);
            ctx.restore();
            ctx.strokeStyle = "#fff"
            ctx.beginPath();
            ctx.moveTo(width, 0);
            ctx.lineTo(width, height);
            ctx.stroke();
    }

    function frame(timeStamp) {
        if (timeStamp) {
            if (start === undefined) {
                start = timeStamp;
            }

            let ntime = (timeStamp - start) / 1000;
            deltatime = ntime - time;
            time = ntime;
            clock(timeStamp);
            ++frameCount;
        }
        requestAnimationFrame(frame);
    }

    function draw_trace(mapctx, Player) {
        mapctx.lineCap = "round";
        mapctx.lineJoin = "round";
        mapctx.lineWidth = 12;
        mapctx.save();
        mapctx.translate(width*0.5, height*0.7);
        mapctx.rotate(-Player.sa * Math.PI);
        mapctx.translate(-Player.x, -Player.y);
        mapctx.strokeStyle = "#fff";
        mapctx.strokeRect(-mapsize, -mapsize, mapsize * 2, mapsize * 2);
        mapctx.strokeStyle = "#fff";
        for (i = 0; i < Player1.trace.length; i++) {
            mapctx.beginPath();
            for (j = 0; j < Player1.trace[i].length; j++) {
                mapctx.lineTo(Player1.trace[i][j][0], Player1.trace[i][j][1]);
            }
            mapctx.stroke();
        }

        for (i = 0; i < Player2.trace.length; i++) {
            mapctx.beginPath();
            for (j = 0; j < Player2.trace[i].length; j++) {
                mapctx.lineTo(Player2.trace[i][j][0], Player2.trace[i][j][1]);
            }
            mapctx.stroke();
        }
        mapctx.save();
        mapctx.translate(Player.x, Player.y);
        mapctx.scale(1.03, 1.03);
        mapctx.translate(-Player.x, -Player.y);
        mapctx.strokeStyle = Player1.color;
        for (i = 0; i < Player1.trace.length; i++) {
            mapctx.beginPath();
            for (j = 0; j < Player1.trace[i].length; j++) {
                mapctx.lineTo(Player1.trace[i][j][0], Player1.trace[i][j][1]);
            }
            mapctx.stroke();
        }
        mapctx.strokeStyle = Player2.color;
        for (i = 0; i < Player2.trace.length; i++) {
            mapctx.beginPath();
            for (j = 0; j < Player2.trace[i].length; j++) {
                mapctx.lineTo(Player2.trace[i][j][0], Player2.trace[i][j][1]);
            }
            mapctx.stroke();
        }
        mapctx.restore();
        
        mapctx.restore();
    }

    function draw() {

        draw_trace(mapctx1, Player1);
        draw_trace(mapctx2, Player2);
        
        function shadow(context, player, other) {
            context.save();
            context.translate(width*0.5, height*0.7)
            context.rotate(-player.sa * Math.PI);
            context.translate(-player.x, -player.y)
            context.fillStyle = "#000";
            context.fillRect(-mapsize, -mapsize, mapsize*2, mapsize*2);
            draw_at_r(context, player, other.x, other.y, other.a, false, () => {
                context.fillStyle = "#fff";
                context.beginPath();
                context.moveTo(-16, 20);
                context.quadraticCurveTo(-16, 0, 0, -20);
                context.quadraticCurveTo(16, 0, 16, 20);
                context.closePath();
                context.fill();
            });
            context.restore();
        }

        
        shadow(ctx1, Player1, Player2);
        shadow(ctx2, Player2, Player1);
        


        ctx1.drawImage(mapcanvas1, 0, 0);
        ctx2.drawImage(mapcanvas2, 0, 0);


        function draw_player(context, player, other) {
            context.save();
            context.translate(width*0.5, height*0.7)
            context.rotate(-player.sa * Math.PI);
            context.translate(-player.x, -player.y)
            draw_at_r(context, player, other.x, other.y, other.a, true, () => {
                context.fillStyle = other.color;
                context.beginPath();
                context.moveTo(-16, 20);
                context.quadraticCurveTo(-16, 0, 0, -20);
                context.quadraticCurveTo(16, 0, 16, 20);
                context.closePath();
                context.fill();
            });
            
            draw_at_r(context, player, player.x, player.y, player.a, true, () => {
                context.fillStyle = player.color;
                context.beginPath();
                context.moveTo(-16, 20);
                context.quadraticCurveTo(-16, 0, 0, -20);
                context.quadraticCurveTo(16, 0, 16, 20);
                context.closePath();
                context.fill();
            });
            context.save();
            context.translate(player.x, player.y)
            context.scale(1.05, 1.05)
            context.translate(-player.x, -player.y)
            
            context.lineCap = "round";
            context.lineJoin = "round";
            context.lineWidth = 12;
            context.strokeStyle = "#fff";
            context.strokeRect(-mapsize, -mapsize, mapsize * 2, mapsize * 2);
            context.restore();
            context.restore();
        }

        draw_player(ctx1, Player1, Player2);
        draw_player(ctx2, Player2, Player1);
        
        
        
        ctx1.save();
        ctx1.font = "16px monospace";
        ctx1.strokeStyle = "#ffffff";
        ctx1.strokeText(frameCount, 10, 10+16);
        ctx1.font = "16px monospace";
        ctx1.fillStyle = "#ffffff";
        ctx1.fillText(Math.round(time * 100) / 100, 10, 10+16+16);
        ctx1.font = "16px monospace";
        ctx1.fillStyle = "#ffffff";
        ctx1.fillText(Math.round(Player1.x * 100) / 100, 10, 10+16+16+16);
        ctx1.fillText(Math.round(Player1.y * 100) / 100, 100, 10+16+16+16);
        ctx1.fillText(Math.round((Player1.a-Player1.sa) * 100) / 100, 200, 10+16+16+16);
        ctx1.restore();
        ctx2.save();
        ctx2.font = "16px monospace";
        ctx2.strokeStyle = "#ffffff";
        ctx2.strokeText(frameCount, 10, 10+16);
        ctx2.font = "16px monospace";
        ctx2.fillStyle = "#ffffff";
        ctx2.fillText(Math.round(time * 100) / 100, 10, 10+16+16);
        ctx2.font = "16px monospace";
        ctx2.fillStyle = "#ffffff";
        ctx2.fillText(Math.round(Player2.x * 100) / 100, 10, 10+16+16+16);
        ctx2.fillText(Math.round(Player2.y * 100) / 100, 100, 10+16+16+16);
        ctx2.fillText(Math.round((Player2.a-Player2.sa) * 100) / 100, 200, 10+16+16+16);
        ctx2.restore();
    }

    document.body.addEventListener("keyup", (event) => {
        if (event.code === "KeyA") {Player1.kl = 0}
        else if (event.code === "KeyD") {Player1.kr = 0}
        else if (event.code === "ArrowLeft") {Player2.kl = 0}
        else if (event.code === "ArrowRight") {Player2.kr = 0}
    });

    document.body.addEventListener("keydown", (event) => {
        console.log(event);
        if (event.code === "KeyA") {if (!Player1.kl) {Player1.a -= 0.5; Player1.kl = 1; Player1.k = true}}
        else if (event.code === "KeyD") {if (!Player1.kr) {Player1.a += 0.5; Player1.kr = 1; Player1.k = true}}
        else if (event.code === "ArrowLeft") {if (!Player2.kl) {Player2.a -= 0.5; Player2.kl = 1; Player2.k = true}}
        else if (event.code === "ArrowRight") {if (!Player2.kr) {Player2.a += 0.5; Player2.kr = 1; Player2.k = true}}
    });
    
    window.addEventListener("click", (event) => {
        audioElement0.play();
        loading();
    });
});

