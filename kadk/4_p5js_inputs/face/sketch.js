//FaceTracker
var capture;
var tracker
var w = 640,
    h = 480;

var normalized = [];
var mouthOpenness = 0;
var eyeBrowHeight = 0;
var smile = 0;
var happy = 0;

var faceCenterX = 0;
var faceCenterY = 0;
var faceSize = 0;

var cnv;


function setup() {
    createCanvas(w, h);

    capture = createCapture(VIDEO);
    createCanvas(w, h);
    capture.size(w, h);
    capture.hide();

    tracker = new clm.tracker();
    tracker.init(pModel);
    tracker.start(capture.elt);
}


function draw() {
    background(0);

    //FaceTracker
    var positions = tracker.getCurrentPosition();
    image(capture, 0, 0, w, h);

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
        noFill();
        stroke(255);
        rect(minX,minY, maxX-minX, maxY-minY);
        
        normalized=[];

        for (var i = 0; i < positions.length; i++) {
            normalized.push((positions[i][0] - minX) / (maxX-minX));
            normalized.push((positions[i][1] - minY) / (maxY-minY));
        }


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
        }
        curveVertex(positions[22][0], positions[22][1]);
        endShape();

        //Calculate rough mouthOpenness, smile and eyeBrowHeight
        mouthOpenness = dist(normalized[45*2], normalized[45*2+1], normalized[50*2], normalized[50*2+1] + dist( normalized[47*2], normalized[47*2+1], normalized[53*2], normalized[53*2+1]));

        eyeBrowHeight = dist(normalized[21*2], normalized[21*2+1], normalized[24*2], normalized[24*2+1]) + dist(normalized[17*2], normalized[17*2+1], normalized[29*2], normalized[29*2+1]);

        smile = dist(normalized[44*2], normalized[44*2+1], normalized[50*2], normalized[50*2+1]);

        //Crappy indicator for happiness
        happy = map(mouthOpenness+eyeBrowHeight/2+smile, 0.6, 0.95, 0.0, 1.0);
        happy = constrain(happy, 0, 1);
        console.log("happy: " + happy);

        faceCenterX = (minX+maxX)/2;
        faceCenterY = (minY+maxY)/2;
        faceSize = round((maxX-minX)*(maxY-minY));
        
        fill(255);
        text("happy: " + nfc(happy,2), 30, 30);
        text("faceCenterX: " + nfc(faceCenterX,2), 30, 50);
        text("faceCenterY: " + nfc(faceCenterY,2), 30, 70);
        text("faceSize: " + faceSize, 30, 90);
        
    }


}
