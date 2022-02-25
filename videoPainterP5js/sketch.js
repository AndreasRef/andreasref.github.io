//Blending from https://discourse.processing.org/t/masking-shader-with-alpha-blending/35132/2 by Kumu-Paul
//Based on example from https://github.com/b2renger/p5js-shaders/tree/master/shader-mask-several-sources

// a shader variable
let mask;

let source1, source2, source3;
let drawing;
let drawingGradient;
let g1, g2, g3;
let canvas;

let img1;
let img2;

let vid1;
let vid2;

function preload() {
  mask = loadShader('mask.vert', 'mask.frag');
  img1 = loadImage("img1.jpg");
  img2 = loadImage("img2.jpg")
}

function setup() {
  canvas = createCanvas(1440, 808, WEBGL);

  vid1 = createVideo("Andreas2s.mp4");
  vid1.hide();
  vid1.size(width, height);
  vid1.volume(0);
  vid1.loop();

  vid2 = createVideo("Torben2s.mp4");
  vid2.hide();
  vid2.size(width, height);
  vid2.volume(0);
  vid2.loop();


  source1 = createGraphics(width*1.0, height*1.0, WEBGL);
  source2 = createGraphics(width*1.0, height*1.0, WEBGL);
  source3 = createGraphics(width*1.0, height*1.0, WEBGL);
  drawing = createGraphics(width, height);
  // drawing.noSmooth()
  drawing.noStroke()
  
  img1.resize(width, height);
  img2.resize(width, height);
  
  source1.image(img1, -width * 0.5, -height * 0.5, width, height)
  source1.noStroke() 
  
  source2.image(img2, -width * 0.5, -height * 0.5, width, height)
  source2.noStroke() 

  source3.background(255,0,255)
  source3.noStroke()     
  source3.fill(255, 255, 0)
  source3.ellipse(0, 0, height * 0.3, height * 0.3)
  
  g1 = drawing.drawingContext.createRadialGradient(0, 0, 5, 0, 0, 200);
  g1.addColorStop(0, 'rgba(255, 0, 0, 0.05)');
  g1.addColorStop(0.5, 'rgba(255, 0, 0, 0.01)');
  g1.addColorStop(1, 'rgba(255, 0, 0, 0.0)');
  
  g2 = drawing.drawingContext.createRadialGradient(0, 0, 5, 0, 0, 200);
  g2.addColorStop(0, 'rgba(0, 255, 0, 0.05)');
  g2.addColorStop(0.5, 'rgba(0, 255, 0, 0.01)');
  g2.addColorStop(1, 'rgba(0, 255, 0, 0.0)');
  
  g3 = drawing.drawingContext.createRadialGradient(0, 0, 5, 0, 0, 150);
  g3.addColorStop(0, 'rgba(0, 0, 255, 0.05)');
  g3.addColorStop(0.5, 'rgba(0, 0, 255, 0.01)');
  g3.addColorStop(1, 'rgba(0, 0, 255, 0.0)');
  
  drawingGradient = g1;
}

function mouseDragged() {
  drawing.push();
  drawing.translate(mouseX, mouseY);
  drawing.drawingContext.fillStyle = drawingGradient;
  drawing.ellipse(0, 0, 200);
  drawing.pop();
}

function draw() {
  background(0);


  let theVideo1 = vid1.get();
  source1.image(theVideo1, -width * 0.5, -height * 0.5, width, height);

  let theVideo2 = vid2.get();
  source2.image(theVideo2, -width * 0.5, -height * 0.5, width, height);


  mask.setUniform("source1", source1);
  mask.setUniform("source2", source2);
  mask.setUniform("source3", source3);
  mask.setUniform("drawing", drawing);

  shader(mask);
  // Draw the output of the shader onto a rectangle that covers the whole viewport
  // fill(0)
  rect(-width * 0.5, -height * 0.5, width, height);
  // image(drawing, -width * 0.5, -height * 0.5)
}

function keyPressed() {
  if (key == '1') drawingGradient = g1;
  if (key == '2') drawingGradient = g2;
  // if (key == '3') drawingGradient = g3;
}

function windowResized() {
  //resizeCanvas(windowWidth, windowHeight)
}