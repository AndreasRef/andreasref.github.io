var dim;
function setup(){
	createCanvas(windowWidth,windowHeight);
	dim = width/2;
 	background(0);
 	colorMode(HSB, 100, 100, 100);
	noStroke();
 	ellipseMode(RADIUS);
 	//frameRate(1);
}

function draw(){
	background(0);
  //for (var x = dim/2; x <= width; x+=dim*1.5) {
    drawGradient(width/2, height/2);
	// 	drawGradient(x, 3*height/4);
  // }
}

function drawGradient(x, y) {
	var radius = dim/2; //+sin(frameCount/100.0)*100;
  var h = frameCount; //random(0, 360);
  //for (var r = radius; r > 0; --r) {

	var strokeCount = 0;

	for (var r = radius; r > 0; r=r-8) {
		noStroke();
		if (strokeCount%10 == 0) strokeWeight(3);
		stroke(100-h, 90, 90);
		//stroke(100);
    fill(h, 90, 90);
    ellipse(x, y, r, r);
    h = (h + map(mouseX, 0, width, 0, 10)) % 100;
		strokeCount++;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
