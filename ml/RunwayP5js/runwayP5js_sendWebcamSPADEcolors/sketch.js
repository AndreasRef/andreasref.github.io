
let pg;
let img;
let drawRecievedImage = false;

var ColorTable = [{
    name: 'grass',
    hex: '#0000FF', //Blue
    hexSpade: '#1dc331'
  },
  {
    name: 'sky',
    hex: '#FF0000',//Red
    hexSpade: '#5fdbff'
  },
  {
    name: 'clouds',
    hex: '#FFFF00', //Yellow
    hexSpade: '#aaaaaa'
  },
  {
    name: 'sea',
    hex: '#FFFFFF', //White
    hexSpade: '#363ea7'
  },
  {
    name: 'river',
    hex: '#00FF00', //Green
    hexSpade: '#003996'
  },
  {
    name: 'tree',
    hex: '#6600FF', //Purple
    hexSpade: '#8c682f'
  }
];

var downsampleFactor = 16;
var capture;

function setup() {
    createCanvas(640, 360);
    pixelDensity(1);
    pg = createGraphics(640, 360);
    pg.pixelDensity(1);
    pg.noStroke();
    frameRate(1);

    
    /*
    capture = createCapture(VIDEO);
    capture.size(width, height);
    capture.hide();
    //rectMode(CENTER);
    noStroke();
    */

}

function draw() {
    //pg.image(painting, 0, 0, width, height);
    pg.background(color('#1dc331'));

    pg.fill(color('#5fdbff'));
    pg.rect(0,0,width,height/2);

    pg.fill(140,104,47);
    pg.rect(mouseX, mouseY, 50, 200);
    pg.ellipse(mouseX+50, mouseY, 150);
    image(pg, 0, 0);
    sendWebcamToRunway();
}

function sendWebcamToRunway() {

        var data = {
            "semantic_map": canvas.toDataURL('image/jpeg')
        };
        httpPost("http://localhost:8000/query", data, function(response) {

            fetch('http://localhost:8000/data')
                .then(response => response.json())
                .then(outputs => {
                const { output } = outputs;
                console.log(output)
                
                if (drawRecievedImage) {
                //Draw directly on the canvas using tip from julsgud comment https://github.com/processing/p5.js/issues/561
                var c = document.getElementById("defaultCanvas0");
                var ctx = c.getContext("2d");
                var img = new Image();
                img.onload = function() { ctx.drawImage(img, 0, 0, width/2, height/2); };
                img.src = output;
                    }
                                

            })
        })
}
