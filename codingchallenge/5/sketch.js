// an array with some values
var values = [ 0, 35, 38];

var gaps = 13.5;
// the angle of the hachure in degrees
var angles = 315;
// set the thikness of our hachure lines
//var strokes[];



function setup(){
	createCanvas(windowWidth,windowHeight);
	//var canvas = createCanvas( windowWidth*0.98, windowHeight*0.97 );
	textAlign(CENTER);
	textSize(32);
}

function draw(){
	background( 255 );
	stroke( 0 );
	strokeWeight( 5 );



	// calculate a few sizes
	var width      = ( windowWidth * 0.7 * 0.98 ) / values.length;
	var spacer     = ( windowWidth * 0.3 * 0.98 ) / ( values.length + 1 );
	var halfHeight = windowHeight *0.8;

	// create an instance of scribble and set a few parameters
	var scribble       = new Scribble();
	scribble.bowing    = 0.1;
	scribble.roughness = 1.5;

	// draw a horizontal line across the center of the screen
	scribble.scribbleLine( 0, halfHeight, windowWidth, halfHeight );

	// draw every value as a filled rect in a bar graph
	for ( var i = 0; i < values.length; i++ ) {
		// calculate the x and y coordinates of the center of the rect and the height
		var h = halfHeight * 0.01 * values[i];
		var x = ( spacer + width ) * ( i + 1 ) - ( width / 2 );
		var y = halfHeight - h / 2;


		if (i==0) {
			strokeWeight(1);
			fill(0);
			text("Time on this site", x,halfHeight+40);
			scribble.bowing    = 0.0;
			scribble.roughness = 0.0;
		} else if (i==1) {
			strokeWeight(1);
			fill(0);
			text("Your happiness", x,halfHeight+40);
			scribble.bowing    = 0.6;
			scribble.roughness = 1.5;
		} else if (i==2) {
			strokeWeight(1);
			fill(0);
			text("Bitcoin price", x,halfHeight+40);
			scribble.bowing    = 1.6+mouseY/100;
			scribble.roughness = 1.5+mouseX/100;
		}

		// set the thikness of the rect lines
		strokeWeight( 5 );
		// set the color of the rect lines to black
		stroke( 0 );

		// draw a rect for the value
		scribble.scribbleRect( x, y, width, h );

		// calculate the x and y coordinates for the border points of the hachure
		var xleft   = x - width / 2 + 5;
		var xright  = x + width / 2 - 5;
		var ytop    = y - ( halfHeight *  0.01 * values[i] / 2 );
		var ybottom = y + ( halfHeight *  0.01 * values[i] / 2 );
		// reduce the sizes to fit in the rect
		if ( ytop > ybottom ) {
			ytop    -= 5;
			ybottom += 5;
		} else {
			ytop    += 5;
			ybottom -= 5;
		}
		// the x coordinates of the border points of the hachure
		var xCoords = [ xleft, xright, xright, xleft ];
		// the y coordinates of the border points of the hachure
		var yCoords = [ ytop, ytop, ybottom, ybottom ];
		// the gap between two hachure lines
		var gap = 13.5;
		// the angle of the hachure in degrees
		var angle = 315;

		if (i==1) {
			angle = 315+frameCount/2;
			strokeWeight( 3 );
			stroke( 255, 0, 0 );
			scribble.scribbleFilling( xCoords, yCoords , gap, angle-90 );
		}

		// set the thikness of our hachure lines
		strokeWeight( 3 );
		//set the color of the hachure to a nice blue
		stroke( 0, 0, 0 );
		if (i==2) {
			stroke('#FF9900');
		}

		// fill the rect with a hachure

		scribble.scribbleFilling( xCoords, yCoords , gap, angle );
	}

	values[0]+=0.02;

	values[2]+=random(-1,1);
	values[2] = constrain(values[2],-height/4,height/4);

}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
