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
        v: 200,
        d: -1,
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
            clock();
        } else {
            requestAnimationFrame(loading);
        }
    }

    function clock(timeStamp) {
        if (start === undefined) {
            start = timeStamp;
        }
        if (timeStamp != undefined) {
        console.log("timeStamp " + timeStamp);
        let ntime = (timeStamp - start) / 1000;
        console.log("hey " + ntime);
        deltatime = ntime - time;
        time = ntime;
        ctx.clearRect(0, 0, width, height);
        console.log(deltatime);
        console.log(time);

        Player1.a += Player1.d * deltatime;
        Player1.x += rotate_x(Player1.a) * Player1.v * deltatime;
        Player1.y += rotate_y(Player1.a) * Player1.v * deltatime;

        Player1.x = (Player1.x + 10240.0) % 20480 - 10240.0;
        Player1.y = (Player1.y + 10240.0) % 20480 - 10240.0;
        console.log(Player1);
        draw();
        
        }
        requestAnimationFrame(clock);
        ++frameCount;
    }

    function draw() {
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.save();
        ctx.translate(-Player1.x, -Player1.y);
        ctx.rotate(Player1.a);
        const bg_pattern = ctx.createPattern(bg_tile, "repeat");
        ctx.fillStyle = bg_pattern;
        ctx.fillRect(-100000, -100000, 200000, 200000);
        ctx.fillStyle = "rgb(0, 0, 200)";
        ctx.fillRect(-20, -20, 40, 40);
        ctx.restore();
        ctx.fillStyle = "rgb(200, 0, 200)";
        ctx.fillRect(-20, -20, 40, 40);

        ctx.restore();

        ctx.font = "16px monospace";
        ctx.strokeStyle = "#ffffff";
        ctx.strokeText(frameCount, 10, 10+16);
        ctx.font = "16px monospace";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(Math.round(time / 10) / 100, 10, 10+16+16);
    }
    document.body.addEventListener("keyup", () => {
        Player1.d = -Player1.d
    });

    loading();
});

