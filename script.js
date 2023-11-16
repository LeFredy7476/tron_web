function rotate(a) {
    let x = Math.cos(a);
    let y = Math.sin(a);
    return [x, y]
}

window.addEventListener("load", (event) => {
    
    console.log("has been called");

    var Player1 = {
        x: 0.0,
        y: 0.0,
        a: 0,
        screena: 0
    };
    
    var canvas = document.querySelector("canvas#render");
    var width = 1600;
    var height = 900;
    var frameCount = 0;
    var time = 0;
    var start = undefined;
    var ctx = null;
    var images = [false];
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
        if (start === undefined) {
            start = timeStamp;
        }
        time = timeStamp - start;
        ctx.clearRect(0, 0, width, height);

        if (images.every(Boolean)) {
            start = undefined;
            frameCount = 0;
            init();
            clock();
        } else {
            requestAnimationFrame(loading);
            ++frameCount;
        }
    }

    function init() {
        ctx.save();
    }

    function clock(timeStamp) {
        if (start === undefined) {
            start = timeStamp;
        }
        time = timeStamp - start;
        ctx.clearRect(0, 0, width, height);

        
        Player1.a += 0.01;
        let vel = rotate(Player1.a);
        Player1.x += vel[0];
        Player1.y += vel[1];

        Player1.x = (Player1.x + 10240.0) % 20480 - 10240.0;
        Player1.y = (Player1.y + 10240.0) % 20480 - 10240.0;
        console.log(Player1);
        draw();
        
        requestAnimationFrame(clock);
        ++frameCount;
    }

    function draw() {
        ctx.save();
        ctx.rotate(-Player1.a);
        ctx.translate(Player1.x, Player1.y);
        ctx.translate(width / 2, height / 2);
        const bg_pattern = ctx.createPattern(bg_tile, "repeat");
        
        ctx.fillStyle = bg_pattern;
        ctx.fillRect(-100000, -100000, 200000, 200000);
        ctx.fillStyle = "rgb(0, 0, 200)";
        ctx.fillRect(-20, -20, 40, 40);
        ctx.fillStyle = "rgb(200, 0, 200)";
        ctx.fillRect(Player1.x - 20, Player1.y - 20, 40, 40);
        ctx.restore();

        ctx.font = "16px monospace";
        ctx.strokeStyle = "#ffffff";
        ctx.strokeText(frameCount, 10, 10+16);
        ctx.font = "16px monospace";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(Math.round(time / 10) / 100, 10, 10+16+16);
    }

    clock();
});