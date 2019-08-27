function setup() {
  createCanvas(640,480);
}

function draw() {
  getImageFromRunway();
}

function getImageFromRunway() {
  
  return new Promise(resolve => {    
  fetch('http://localhost:8000/data')
  .then(response => response.json())
  .then(outputs => {
    const { output } = outputs;
    // use the output in your project
    
    console.log(output); //be aware of what is after the "." and change accordingly
    //img = createImg(output);
    //Draw directly on the canvas using tip from julsgud comment https://github.com/processing/p5.js/issues/561
    var c = document.getElementById("defaultCanvas0");
    var ctx = c.getContext("2d");
    var img = new Image();
    img.onload = function() { ctx.drawImage(img, 0, 0, width, height); };
    img.src = output;

  })
});
}

