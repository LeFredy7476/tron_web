function rotate_x(a) {
    return Math.sin(a)
}
function rotate_y(a) {
    return -Math.cos(a)
}



window.addEventListener("load", (event) => {
    
    console.log("has been called");

    var Player1 = {
        x: 0.0,
        y: 0.0,
        a: 0.0,
        screena: 0.0,
        v: 300,
        av: 3,
        kright: 0,
        kleft: 0,
        camera_ease: 0.20
    };
    
    var canvas = document.querySelector("canvas#render");
    var width = 1600;
    var height = 900;
    var frameCount = 0;
    var time = 0;
    var start = undefined;
    var ctx = null;
    var images = [false];
    var deltatime = 0;
    var start;
    var first = true;
    function image_pointer(n) {
        return (event) => {
            console.log(`image ${n} has been loaded`)
            images[n] = true;
        }
    }
    const bg_tile = new Image(100, 200);
    bg_tile.onload = image_pointer(0)
    bg_tile.src = "bg_tile.png";

    if (canvas.getContext) {
        ctx = canvas.getContext("2d");
    } else {
        alert("Canvas Graphics are not supported");
    }

    function draw_at_r(x, y, a, func) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(a);
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
            if (first) {
                first = false;
            }

            let ntime = (timeStamp - start) / 1000;
            deltatime = ntime - time;
            time = ntime;
            ctx.clearRect(0, 0, width, height);

            Player1.a += (Player1.kleft + Player1.kright) * Player1.av * deltatime;
            Player1.screena += (Player1.a - Player1.screena) * Player1.camera_ease;
            Player1.x += rotate_x(Player1.a) * Player1.v * deltatime;
            Player1.y += rotate_y(Player1.a) * Player1.v * deltatime;

            if (Player1.x > 5120) {
                Player1.x = Player1.x - 10240
            } else if (Player1.x < -5120) {
                Player1.x = Player1.x + 10240
            }
            if (Player1.y > 5120) {
                Player1.y = Player1.y - 10240
            } else if (Player1.y < -5120) {
                Player1.y = Player1.y + 10240
            }
            // Player1.x = (Player1.x - 5120) % 10240 + 5120;
            // Player1.y = (Player1.y - 5120) % 10240 + 5120;
            draw();
            ++frameCount;
            requestAnimationFrame(next_frame);
        } else {
            requestAnimationFrame(clock);
        }
    }

    function next_frame(timeStamp) {
        clock(timeStamp);
    }

    function draw() {
        ctx.save();
        ctx.translate(width*0.5, height*0.5)
        ctx.rotate(-Player1.screena);
        ctx.translate(-Player1.x, -Player1.y)
        // elements
        draw_at(0, 0, () => {
            let bg_pattern = ctx.createPattern(bg_tile, "repeat");
            ctx.fillStyle = bg_pattern;
            ctx.fillRect(-7000, -7000, 14000, 14000);
        });
        draw_at(0, 0, () => {
            ctx.fillStyle = "rgb(0, 0, 200)";
            ctx.fillRect(-20, -20, 40, 40);
        });
        draw_at_r(Player1.x, Player1.y, Player1.a, () => {
            ctx.fillStyle = "rgb(200, 0, 200)";
            ctx.fillRect(-10, -20, 20, 40);
            ctx.fillRect(-20, 0, 40, 20);
        });

        
        ctx.restore();
        ctx.font = "16px monospace";
        ctx.strokeStyle = "#ffffff";
        ctx.strokeText(frameCount, 10, 10+16);
        ctx.font = "16px monospace";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(Math.round(time * 100) / 100, 10, 10+16+16);
        ctx.font = "16px monospace";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(Math.round(Player1.x * 100) / 100, 10, 10+16+16+16);
        ctx.font = "16px monospace";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(Math.round(Player1.y * 100) / 100, 100, 10+16+16+16);
    }
    document.body.addEventListener("keyup", (event) => {
        if (event.code === "ArrowLeft") {Player1.kleft = 0}
        else if (event.code === "ArrowRight") {Player1.kright = 0}
    });
    document.body.addEventListener("keydown", (event) => {
        if (event.code === "ArrowLeft") {Player1.kleft = -1}
        else if (event.code === "ArrowRight") {Player1.kright = 1}
    });

    loading();
});

