/*To do

*/

const video = document.getElementById('video')
//const URL = "/weights"
//online URL
const URL = "https://rawgit.com/justadudewhohacks/face-api.js/master/weights";

let faces = [];

let age = 0;

let scaleFactor = 960/720;

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri(URL),
  faceapi.nets.faceLandmark68Net.loadFromUri(URL),
  faceapi.nets.ageGenderNet.loadFromUri(URL)
]).then(startVideo)

function startVideo() {
  navigator.getUserMedia(
    { video: {
          frameRate: {
              ideal: 25,
              min: 25
          }
      }
     },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}


video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)

  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withAgeAndGender()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    faces = resizedDetections;    
  }, 500)
})

//New layout
//let age = 80;

let noiseOffSet = 100000-0.01;

let suggestions = [
"(0-årige)",
"(5-årige)",
"(10-årige)",
"Ariana Grande",
"Taylor Swift",
"Lady Gaga",
"Nephew",
"Britney Spears",
"Nirvana",
"George Michael",
"Thomas Helmig",
"Abba",
"Gasolin",
"The Bee Gees",
"Keld & The Donkeys",
"Frank Sinatra",
"Otto Brandenburg",
"1949",
"1944",
"1939",
"1934"
];

let textSpacing = 0.42;
let rightCircleSpacingCompensation = 1.03;

let sliceFraction = 16;
let outCircleSizeFactor = 1.15;

function setup() {
  pixelDensity(1);
  createCanvas(1920/2, 1080/2);
}

function draw() {
  //background(220);
  clear();

  //face stuff
  //quick test
  if (faces.length > 0) {
    age = lerp(age, faces[0].age, 0.01);
  } else {
    age = lerp(age, noise(noiseOffSet)*100, 0.01);
    noiseOffSet+=0.0005;
  }

  //the loop
  for (let i = 0; i<faces.length; i++) {
    //text("#" + i + ": age : " + round(faces[i].age), 25, 25*i + 50);
    push();
    noFill();
    translate((960-720)/2,0);
    scale(1/scaleFactor, 1);
    rect(faces[i].alignedRect.box.x, faces[i].alignedRect.box.y, faces[i].alignedRect.box.width, faces[i].alignedRect.box.height)
    pop();
  }


  //Info bars
  push();
  textAlign(CENTER);
  textSize(16);
  noStroke();
  
  //Top info
  fill(255);
  rect(0,0,width, height/6);
  fill(0);
  text("Lad computeren analysere dit ansigt \nog gætte din alder og yndlingsmusik.", width/2, height/12);
  
  //Bottom info
  fill(255);
  rect(0,height -height/6,width, height/6);
  fill(0);
  text("Rammer den rigtigt? \nBiblioteket har både CD'er, DVD'er,\noder og musikmagasiner på 1. sal.", width/2, height- height/10);
  
  pop();
  
  //Age circle
  push();
  translate(0, height/2);
  circle(0, 0, height);
  push();
  rotate(-TWO_PI * age / 100);
  for (let i = 0; i < 20; i++) {
    push();
    rotate(TWO_PI * i / 20);
    textSize(24);
    text(i * 5, textSpacing*height, 0);
    pop();
  }
  pop();
  pop();

  //Suggestions circle
  push();
  translate(width, height/2);
  circle(0, 0, height);
  push();
  rotate(-TWO_PI * age / 100);
  for (let i = 0; i < 20; i++) {
    push();
    rotate(TWO_PI * i / 20);
    
    text(suggestions[i], -textSpacing*height*rightCircleSpacingCompensation, 0);
    pop();
  }
  pop();
  pop();
  
  
  //Left arrow
  push();
  noStroke();
  fill(255, 0, 0);
  triangle(0, height*0.45, 0, height*0.55, height/3, height*0.5);
  pop();
  
  //Left arc
  push();
  fill(0);
  arc(0, height/2, height*outCircleSizeFactor, height*outCircleSizeFactor, TWO_PI/sliceFraction, -TWO_PI/sliceFraction, PIE);
  pop();
  
  
  //Right arrow
  push();
  noStroke();
  fill(255, 0, 0);
  triangle(width, height*0.475, width, height*0.525, width- height/6, height*0.5);
  pop();

  
  //Right arc
  push();
  fill(0);
  arc(width, height/2, height*outCircleSizeFactor, height*outCircleSizeFactor, PI + TWO_PI/sliceFraction, PI - TWO_PI/sliceFraction, PIE);
  pop();
  
  
  
  //reset noiseOffSet if it gets too high
  if (noiseOffSet > 100000) noiseOffSet = 0;
  //age = map(mouseX, 0, width, 0, 100);

  //console.log(age);
}

function mousePressed() {
  console.log(faces);
}



/* OLD
function setup() {
  pixelDensity(1);
  createCanvas(960, 540)
  textSize(24);
  
}

function draw() {
  clear();  
  text(faces.length + " face(s) detected", 25, 25)
  
  for (let i = 0; i<faces.length; i++) {
    text("#" + i + ": age : " + round(faces[i].age), 25, 25*i + 50);
    push();
    noFill();
    rect(faces[i].alignedRect.box.x, faces[i].alignedRect.box.y, faces[i].alignedRect.box.width, faces[i].alignedRect.box.height)
    pop();
  }
}



function mousePressed() {
  console.log(faces);
}
*/