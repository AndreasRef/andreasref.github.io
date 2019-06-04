
let pg;
let video;

function setup() {
    createCanvas(640, 480);
    pixelDensity(1);
    pg = createGraphics(640, 480);
    video = createCapture(VIDEO);
    video.hide();
    frameRate(1);
}


function draw() {
    pg.image(video, 0, 0);
    sendWebcamToRunway();
}

function sendWebcamToRunway() {
    var data = {
        "image": pg.canvas.toDataURL('image/jpeg')
    };
    //Pay attention to the localhost port in Runway!
    sketch.httpPost("http://localhost:8000/query", data, function(response) {

        fetch('http://localhost:8000/data')
            .then(response => response.json())
            .then(output => {
            const { results } = output;
            
            var c = document.getElementById("defaultCanvas0");
            var ctx = c.getContext("2d");
            var img = new Image();
            img.onload = function() { ctx.drawImage(img, 0, 0, width, height); };
            img.src = output.depth_image;


        })
    })
}