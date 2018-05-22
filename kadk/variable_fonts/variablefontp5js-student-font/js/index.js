var weightControl = 0;
var paragraph;

function setup() { 
  noCanvas();
  paragraph = createP("FIRE");
}

function draw() { 
  background(220);
  //paragraph.style("font-size", sin(frameCount/100.0)*50+75 + "px");
  
  weightControl = sin(frameCount/10.0)*100+150;
  paragraph.elt.style['font-variation-settings'] = `"wght" ${weightControl}`;
}