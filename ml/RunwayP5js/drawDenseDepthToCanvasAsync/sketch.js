let img;

function setup() {
    createCanvas(640,360)
    background(255,0,0);
}

function draw() {
    getImageFromRunway();
    ellipse(mouseX, mouseY, 100)
}

function getImageFromRunway() {

    return new Promise(resolve => {    
        fetch('http://localhost:8000/data')
            .then(response => response.json())
            .then(output => {
            const { depth_image } = output;

            //Draw directly on the canvas using tip from julsgud comment https://github.com/processing/p5.js/issues/561
            var c = document.getElementById("defaultCanvas0");
            var ctx = c.getContext("2d");
            var img = new Image();
            img.onload = function() { ctx.drawImage(img, 0, 0, width, height); };
            img.src = output.depth_image;
        })
        //getImageFromRunway()
    });
}
