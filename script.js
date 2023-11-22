
// quelques fonctions utiles pour fair des calculs (faire* gro ogr)

function rotate_x(a) {
    return Math.sin(a * Math.PI)
}

function rotate_y(a) {
    return -Math.cos(a * Math.PI)
}

// algorithme permettant de rendre les mouvement de la caméra plus "smooth"

function ease(number, target, fact, limit=0.002) {
    if (Math.abs(target - number) < limit) {
        return target;
    } else {
        return number + (target - number) * fact;
    }
}


window.addEventListener("load", (event) => { // ne commencer le programme que lorseque tout sera loadé
    
    console.log("has been called");

    var Player1 = {  // objet joueur1, contient les attributs de joueur 1 
        x: 0.0,                 // position X
        y: 0.0,                 // position Y
        a: 0.0,                 // angle
        sa: 0.0,                // angle de l'écran
        v: 300,                 // vitesse du joueur
        av: 1,                  // vitesse de rotation du joueur
        kright: 0,              // status de la touche "->" du clavier
        kleft: 0,               // status de la touche "<-" du clavier
        e: 0.10,                // facteur de smooth sur la caméra
        last: [0,0],            // position de la frame précédente
        trace: [[[0,0], [0,0]]],// données du tracé
        color: "#f0f"           // couleure du joueur
    };
    // hauteur, largeur du rendu
    var width = 1600;
    var height = 900;

    var mapsize = 1280; // distance entre le centre et le coté de la map
    var canvas = document.querySelector("canvas#render"); // canvas de rendu principal
    var mapcanvas = new OffscreenCanvas(width, height);   // canvas de rendu pour les tracés
    var frameCount = 0;
    var time = 0;
    var deltatime;
    var start;
    var map_bitmap;
    var pause = 0;

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
    var mapctx = null;
    if (canvas.getContext) {
        ctx = canvas.getContext("2d");
        mapctx = mapcanvas.getContext("2d", {willReadFrequently: true});
    } else {
        alert("Canvas Graphics are not supported");
    }


    function draw_at_r(x, y, a, func) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(a * Math.PI);
        func();
        ctx.restore();
    }
    function draw_at(x, y, func) {
        ctx.save();
        ctx.translate(x, y);
        func();
        ctx.restore();
    }

    function windowResizeEvent() {
        let w = window.innerWidth;
        let h = window.innerHeight;
        ctx.canvas.width = w;
        ctx.canvas.height = h;
        mapctx.canvas.width = w;
        mapctx.canvas.height = h;
        width = w;
        height = h;
    }
    window.onresize = windowResizeEvent;
    windowResizeEvent();

    function loading(timeStamp) {
        if (images.every(Boolean)) {
            ctx.save();
            clock();
        } else {
            requestAnimationFrame(loading);
        }
    }

    function clock(timeStamp) {
        if (timeStamp) {
            if (start === undefined) {
                start = timeStamp;
            }

            let ntime = (timeStamp - start) / 1000;
            deltatime = ntime - time;
            time = ntime;
            ctx.clearRect(0, 0, width, height);

            
            

            Player1.a += (Player1.kleft + Player1.kright) * Player1.av * deltatime;
            Player1.sa = ease(Player1.sa, Player1.a, Player1.e);
            Player1.x += rotate_x(Player1.a) * Player1.v * deltatime;
            Player1.y += rotate_y(Player1.a) * Player1.v * deltatime;
            if (Player1.kleft + Player1.kright === 0) {
                Player1.trace[0].pop()
            }
            Player1.trace[0].push([Player1.x, Player1.y]);
            Player1.last = [Player1.x, Player1.y];

            if (frameCount > 1) {
                map_bitmap = mapctx.getImageData(0, 0, width, height);

                let hitX = Math.round(width*0.5) + Math.round(Player1.a - Player1.sa) * 80;
                let hitY = Math.round(height*0.7) - 10;
                let hitR = map_bitmap.data[hitY * map_bitmap.width * 4 + hitX * 4 + 0];
                let hitG = map_bitmap.data[hitY * map_bitmap.width * 4 + hitX * 4 + 1];
                let hitB = map_bitmap.data[hitY * map_bitmap.width * 4 + hitX * 4 + 2];
                let hitA = map_bitmap.data[hitY * map_bitmap.width * 4 + hitX * 4 + 3];
                console.log([hitR, hitG, hitB, hitA]);
                if (hitB > 10) {
                    Player1.color = "#555";
                }
            }

            mapctx.clearRect(0, 0, width, height);


            // if (Player1.x > mapsize) {
            //     Player1.x = Player1.x - 2 * mapsize;
            // } else if (Player1.x < -mapsize) {
            //     Player1.x = Player1.x + 2 * mapsize;
            // }
            // if (Player1.y > mapsize) {
            //     Player1.y = Player1.y - 2 * mapsize;
            // } else if (Player1.y < -mapsize) {
            //     Player1.y = Player1.y + 2 * mapsize;
            // }

            
            draw();
            ++frameCount;
            if (pause === 0) {
                requestAnimationFrame(next_frame);
            }
        } else {
            requestAnimationFrame(clock);
        }
    }

    function next_frame(timeStamp) {
        clock(timeStamp);
    }

    function draw() {

        mapctx.save();
        mapctx.translate(width*0.5, height*0.7)
        mapctx.rotate(-Player1.sa * Math.PI);
        mapctx.translate(-Player1.x, -Player1.y)
        
        mapctx.fillStyle = "#000";
        mapctx.fillRect(-mapsize, -mapsize, mapsize*2, mapsize*2);
        mapctx.strokeStyle = "#fff";
        mapctx.lineWidth = 8;
        mapctx.strokeRect(-mapsize, -mapsize, mapsize * 2, mapsize * 2);
        mapctx.lineWidth = 12;
        mapctx.lineCap = "round";
        mapctx.lineJoin = "round";
        mapctx.strokeStyle = "#fff";
        for (i = 0; i < Player1.trace.length; i++) {
            mapctx.beginPath();
            for (j = 0; j < Player1.trace[i].length; j++) {
                mapctx.lineTo(Player1.trace[i][j][0], Player1.trace[i][j][1]);
            }
            mapctx.stroke();
        }
        mapctx.save();
        mapctx.translate(Player1.x, Player1.y)
        mapctx.scale(1.03, 1.03)
        mapctx.translate(-Player1.x, -Player1.y)
        mapctx.strokeStyle = Player1.color;
        mapctx.lineWidth = 12;
        for (i = 0; i < Player1.trace.length; i++) {
            mapctx.beginPath();
            for (j = 0; j < Player1.trace[i].length; j++) {
                mapctx.lineTo(Player1.trace[i][j][0], Player1.trace[i][j][1]);
            }
            mapctx.stroke();
        }
        mapctx.restore();
        mapctx.save();
        mapctx.translate(Player1.x, Player1.y)
        mapctx.scale(1.05, 1.05)
        mapctx.translate(-Player1.x, -Player1.y)
        mapctx.strokeStyle = "#fff";
        mapctx.lineWidth = 8;
        mapctx.strokeRect(-mapsize, -mapsize, mapsize * 2, mapsize * 2);
        mapctx.restore();
        mapctx.restore();
        


        ctx.drawImage(mapcanvas, 0, 0);

        ctx.save();
        ctx.translate(width*0.5, height*0.7)
        ctx.rotate(-Player1.sa * Math.PI);
        ctx.translate(-Player1.x, -Player1.y)

        // elements
        
        // let bg_pattern = ctx.createPattern(bg_tile, "repeat");
        
        
        
        // let map_pattern = ctx.createPattern(mapcanvas, "repeat");
        // ctx.fillStyle = map_pattern;
        // ctx.fillRect(-7000, -7000, 14000, 14000);
        

        draw_at_r(Player1.x, Player1.y, Player1.a, () => {
            ctx.fillStyle = Player1.color;
            ctx.beginPath();
            ctx.moveTo(-16, 20);
            ctx.quadraticCurveTo(-16, 0, 0, -20);
            ctx.quadraticCurveTo(16, 0, 16, 20);
            ctx.closePath();
            ctx.fill();
        });
        ctx.restore();
        
        
        ctx.save();
        ctx.font = "16px monospace";
        ctx.strokeStyle = "#ffffff";
        ctx.strokeText(frameCount, 10, 10+16);
        ctx.font = "16px monospace";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(Math.round(time * 100) / 100, 10, 10+16+16);
        ctx.font = "16px monospace";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(Math.round(Player1.x * 100) / 100, 10, 10+16+16+16);
        ctx.fillText(Math.round(Player1.y * 100) / 100, 100, 10+16+16+16);
        ctx.fillText(Math.round((Player1.a-Player1.sa) * 100) / 100, 200, 10+16+16+16);
        ctx.restore();
    }
    document.body.addEventListener("keyup", (event) => {
        if (event.code === "ArrowLeft") {Player1.kleft = 0}
        else if (event.code === "ArrowRight") {Player1.kright = 0}
    });
    document.body.addEventListener("keydown", (event) => {
        // console.log(event);
        if (event.code === "ArrowLeft") {Player1.kleft = -1}
        else if (event.code === "ArrowRight") {Player1.kright = 1}
        else if (event.code === "Space") {if (pause === 0) {pause = 1;} else {pause = 0; start = undefined; next_frame();}}
    });

    loading();
});

