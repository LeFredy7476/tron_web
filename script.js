window.addEventListener("load", (event) => {
    
    console.log("has been called");
    
    var canvas = document.querySelector("canvas#render");
    var width = 1600;
    var height = 900;
    var frameCount = 0;
    var time = 0;
    var start = undefined;
    var ctx;
    if (canvas.getContext) {
        ctx = canvas.getContext("2d");
    } else {
        alert("Canvas Graphics are not supported");
        ctx = null;
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

    function clock(timeStamp) {
        if (start === undefined) {
            start = timeStamp;
        }
        time = timeStamp - start;

        ctx.clearRect(0, 0, width, height);

        ctx.fillStyle = "rgb(200, 0, 0)";
        ctx.fillRect(10, 10 + time/100, 50 + time/80, 50);

        ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
        ctx.fillRect(30 + time/50, 30 + time/100, 50, 50);
        requestAnimationFrame(clock);
        ++frameCount;
    }

    clock();
});