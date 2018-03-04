
// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain

// Clock
// Video: https://youtu.be/E4RyStef-gY


//FaceTracker
var capture;
var tracker
var w = 640,
    h = 480;

var normalized = [];
var mouthOpenness = 0;
var eyeBrowHeight = 0;

var clockSpeed;
var scInc = 0;

var cnv;

let hr, mn, sc, prevTime;

function centerCanvas() {
  var x = (windowWidth - width) / 2;
  var y = 2 * (windowHeight - height) / 3;
  cnv.position(x, y);
}

function setup() {
  cnv = createCanvas(w, h);
  centerCanvas();
	angleMode(DEGREES);
  background(255, 0, 200);

	 hr = 0;
	 mn = 0;
	 sc = 0;
	 prevTime = sc;


capture = createCapture(VIDEO);
 createCanvas(w, h);
 capture.size(w, h);
 capture.hide();

 tracker = new clm.tracker();
 tracker.init(pModel);
 tracker.start(capture.elt);


}

function windowResized() {
  centerCanvas();
}

 function draw() {
   background(0);

	 //FaceTracker

    var positions = tracker.getCurrentPosition();
		image(capture, 0, 0, w, h);
		filter(INVERT);

    noFill();
    stroke(0);
    beginShape();
    for (var i = 0; i < positions.length; i++) {
        //vertex(positions[i][0], positions[i][1]);
    }
    endShape();

		if (positions.length > 1) {
		//normalize values
		//get the bounding box
	 var minX = width;
	 var minY = height;
	 var maxX = 0;
	 var maxY = 0;

	 for (var i = 0; i < positions.length; i++) {
		if (positions[i][0] < minX) {
			minX = positions[i][0];
		} if (positions[i][1] < minY) {
			minY = positions[i][1];
		} if (positions[i][0] > maxX) {
			maxX = positions[i][0];
		} if (positions[i][1] > maxY) {
			maxY = positions[i][1];
		}
	 }

	 //rect(minX,minY, maxX-minX, maxY-minY);

	 normalized=[];

	 for (var i = 0; i < positions.length; i++) {
		 normalized.push((positions[i][0] - minX) / (maxX-minX));
		 normalized.push((positions[i][1] - minY) / (maxY-minY));
		 //text("x: " + nf(normalized[i],1,2) + "\n" + "y: " + nf(normalized[i],1,2), positions[i][0], positions[i][1]);
	 }


	 //Calculate rough mouthOpenness and eyeBrowHeight

	 mouthOpenness = dist(normalized[45*2], normalized[45*2+1], normalized[50*2], normalized[50*2+1] + dist( normalized[47*2], normalized[47*2+1], normalized[53*2], normalized[53*2+1]));
	 eyeBrowHeight = dist(normalized[21*2], normalized[21*2+1], normalized[24*2], normalized[24*2+1]) + dist(normalized[17*2], normalized[17*2+1], normalized[29*2], normalized[29*2+1]);;

	 console.log("mouthOpenness: " + mouthOpenness);
	 console.log("eyeBrowHeight: " + eyeBrowHeight);

			//Outer mouth
    beginShape();
    curveVertex(positions[44][0], positions[44][1]);
    for (var i = 44; i < 56; i++) {
      curveVertex(positions[i][0], positions[i][1]);
    }
    endShape(CLOSE);

    //Inner mouth
    beginShape();
    curveVertex(positions[56][0], positions[56][1]);
    for (var i = 56; i < 62; i++) {
      curveVertex(positions[i][0], positions[i][1]);
    }
    endShape(CLOSE);


		//Right eyebrow curves
    beginShape();
    curveVertex(positions[15][0], positions[15][1]);
    for (var i = 15; i < 19; i++) {
      curveVertex(positions[i][0], positions[i][1]);
      //vertex(positions[i][0], positions[i][1]);
    }
    curveVertex(positions[18][0], positions[18][1]);
    endShape();


    //Left eyebrow curves
    beginShape();
    curveVertex(positions[19][0], positions[19][1]);
    for (var i = 19; i < 23; i++) {
      curveVertex(positions[i][0], positions[i][1]);
      //vertex(positions[i][0], positions[i][1]);
    }
    curveVertex(positions[22][0], positions[22][1]);
    endShape();


	}


    noStroke();
    // for (var i = 0; i < positions.length; i++) {
    //     fill(map(i, 0, positions.length, 0, 360), 50, 100);
    //     ellipse(positions[i][0], positions[i][1], 4, 4);
    //     text(i, positions[i][0], positions[i][1]);
    // }

    if (positions.length > 0) {
        var mouthLeft = createVector(positions[44][0], positions[44][1]);
        var mouthRight = createVector(positions[50][0], positions[50][1]);
        var smile = mouthLeft.dist(mouthRight);
        // uncomment the line below to show an estimate of amount "smiling"
        rect(20, 20, smile * 3, 20);

//        noStroke();
//        fill(0, 255, 255);
//        ellipse(positions[62][0], positions[62][1], 50, 50);
    }


	 push();
   translate(width/2, height/2);
   rotate(-90);


	   //let sc = round(millis()/1000)%60;

	 // let time = floor(millis()/1000.0);
	 //
	 //
	 // if (time !== prevTime) {
		//  sc = (sc + 1)%60;
	 //
		//  if (sc === 0) {
		// 	 mn = (mn + 1)%60;
		//  }
	 //
		//  if (mn === 0) {
		// 	 hr = (hr + 1)%12;
		//  }
	 // }
	 //
	 // if (sc === 0 && time !== prevTime) {
		//  mn = (mn + 1)%60;
	 // }
	 //
	 // prevTime = time;

	 //var mySpeed = ceil(map(mouthOpenness,0.3, 0.5, 80, 1));
	 var mySpeed = 60;
	 //console.log("mySpeed: " + mySpeed);
	 let inc = map(mouthOpenness,0.3, 0.5, 0.0, 3)*map(eyeBrowHeight,0.16, 0.33, -1, 3);



	 //if ((frameCount)%mySpeed === 0) {
		 scInc+=inc;
	 //}

	 if ((frameCount)%(mySpeed*60) === 0) {
		 mn++;
	 }

	 if ((frameCount)%(mySpeed*60*12) === 0) {
		 hr++;
	 }


	 sc = lerp(sc, scInc, 0.05);
	 mn = lerp(mn, scInc/60, mouthOpenness*0.05);
	 hr = lerp(hr, scInc/(60*12), mouthOpenness*0.05);


   strokeWeight(16);
   stroke(255, 100, 150);
   noFill();
   let secondAngle = map(sc, 0, 60, 0, 360);
   //arc(0, 0, 300, 300, 0, secondAngle);

   stroke(150, 100, 255);
   let minuteAngle = map(mn, 0, 60, 0, 360);
   //arc(0, 0, 280, 280, 0, minuteAngle);

   stroke(150, 255, 100);
   let hourAngle = map(hr % 12, 0, 12, 0, 360);
   //arc(0, 0, 260, 260, 0, hourAngle);

   push();
   rotate(secondAngle);
   stroke(255, 100, 150);
   line(0, 0, 100*2, 0);
   pop();

   push();
   rotate(minuteAngle);
   stroke(150, 100, 255);
   line(0, 0, 75*2, 0);
   pop();

   push();
   rotate(hourAngle);
   stroke(150, 255, 100);
   line(0, 0, 50*2, 0);
   pop();

   stroke(255);
   point(0, 0);
	 pop();

    fill(255);
    noStroke();
    text(hr + ':' + mn + ':' + sc, 10, 200);






 }
