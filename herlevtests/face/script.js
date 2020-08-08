/* To do:
- Lav JSON med år
- Få det til at virke med flere ansigter...
- Bedre check at ansigt stadig er i hullet før du går til state 1
- Line breaks: https://www.tutorialspoint.com/HTML5-canvas-ctx-fillText-won-t-do-line-breaks
- Full screen: http://w3schools-fa.ir/howto/tryiteedf.html?filename=tryhow_js_fullscreen2
- Lille blinke-glitch en gang imellem...
*/
const video = document.getElementById('video')
const URL = "/weights"

let state = 0;
let dataURI;

let canvas;
let savedSnapshot = new Image();

let faceInHole = false;

let lastAges = [];
let calculatedMeanAge = 0;

let bgMaskImg = new Image();
bgMaskImg.src = 'background_masked.png';

let debugMode = false;

var myObj = {
  "suggestions":[ 
    ["0", "hest"] , 
    ["1", "ko"],
    ["2", "sko"]
  ]
};

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
              min: 15
          }
      }
     },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}


video.addEventListener('play', () => {
  canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)

  let ctx = canvas.getContext("2d");
  ctx.font = "30px Arial";

  setInterval(async () => {
  switch (state) {
    case 0:
      
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withAgeAndGender()
        const resizedDetections = faceapi.resizeResults(detections, displaySize)  
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        
        //faceapi.draw.drawDetections(canvas, resizedDetections)
        
        ctx.drawImage(video, 0,0, 720, 560);
        if (debugMode) {
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
        }
        //faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
        ctx.drawImage(bgMaskImg, 0, 0);
    
        if (detections.length > 0) {
          //console.log(detections[0].ali);
    
          let myBox = resizedDetections[0].alignedRect.box;
          let faceCenterX = myBox.x + myBox.width/2;
          let faceCenterY = myBox.y + myBox.height/2;
    
          //Check if face is inside mask
          if (faceCenterX > 100 && faceCenterX < 300 && faceCenterY>100 && faceCenterY<500) {
            faceInHole = true;

            setTimeout(switchToAnalyze, 3000);

            lastAges.push(detections[0].age);

            calculatedMeanAge = avg(lastAges);
            console.log(calculatedMeanAge);

            lastAges = lastAges.slice(lastAges.length-30);
            
            if (debugMode) {
              ctx.fillRect(faceCenterX-20, faceCenterY-20, 40, 40);
              ctx.fillText("avr age " + calculatedMeanAge, 10, 50);
              ctx.fillText("last age " + Math.round(detections[0].age), 10, 150);
            }
          } else {
            faceInHole = false;
          }
        }
      
      break;
    case 1: //Analyserer
     //ctx.clearRect(0, 0, canvas.width, canvas.height)
     
     ctx.drawImage(savedSnapshot,0,0);
     ctx.drawImage(bgMaskImg, 0, 0);

     
     ctx.fillStyle = '#E0E4CD';   
     ctx.fillText("Analyserer... ", 510, 50);

      break;
    case 2: //Giv resultat + foreslag
      //ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      ctx.drawImage(savedSnapshot,0,0);
      ctx.drawImage(bgMaskImg, 0, 0);
      ctx.fillText("Du er " + calculatedMeanAge + " år gammel.", 410, 50);
      ctx.fillText("Foreslag: " + myObj.suggestions[calculatedMeanAge%3][1], 410, 150);
      break;

    case 3: //Eftertekst
      //ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      ctx.drawImage(savedSnapshot,0,0);
      ctx.drawImage(bgMaskImg, 0, 0);
      ctx.fillText("Find mere musik på 1. sal.", 310, 50);
      //ctx.fillText("Foreslag: " + myObj.suggestions[calculatedMeanAge%3][1], 410, 150);
      break;
    default:
      // code block
  }
}, 100)
})


function switchToAnalyze() {
  if (faceInHole) {
  dataURI = canvas.toDataURL('image/jpeg');
  savedSnapshot.src = dataURI;
  state = 1;
  setTimeout(switchToRecommendation, 3000);
  }
}

function switchToRecommendation() {
 state = 2; 
 if (debugMode == false) {
  setTimeout(switchToDefault, 3000);
 } else {
  setTimeout(switchToPostExperienceText, 3000);
 }
 
}

function switchToPostExperienceText() {
  state = 3;
  setTimeout(switchToDefault, 3000);
}

function switchToDefault() {
 state = 0; 
}

function avg(t) {
  let sum = 0;
  for (let item of t) {
    sum += item;
  }
  return Math.round( sum / t.length);
}