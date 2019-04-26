let img;

var output;

function setup() {
    createCanvas(640, 480);
    pixelDensity(1);
    
    whatever();
}


function draw() {
    img.position(0, 0);
    img.size(256, 256);
}

function whatever() {

    fetch('http://localhost:8002/data')
  .then(response => response.json())
  .then(output => {
    var { output } = output;
    // use the output in your project
        img = createImg(output.result);
  })
}

//