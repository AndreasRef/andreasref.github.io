let img;

function setup() {
    noCanvas();
}

function draw() {
    if (img) {
        img.position(0, 0);
        img.size(256, 256);
    }
}

function mousePressed() {
    
    fetch('http://localhost:8000/data')
  .then(response => response.json())
  .then(output => {
    const { depth_image } = output;
    // use the output in your project
    
    console.log(output.depth_image);
    img = createImg(output.depth_image);
  })
    
}

