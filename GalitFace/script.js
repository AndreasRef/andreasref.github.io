var myBool = true;

const video = document.getElementById('video')

var canvas;

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('https://rawgit.com/justadudewhohacks/face-api.js/master/weights'),
  faceapi.nets.faceLandmark68Net.loadFromUri('https://rawgit.com/justadudewhohacks/face-api.js/master/weights'),
  faceapi.nets.faceRecognitionNet.loadFromUri('https://rawgit.com/justadudewhohacks/face-api.js/master/weights'),
  faceapi.nets.faceExpressionNet.loadFromUri('https://rawgit.com/justadudewhohacks/face-api.js/master/weights'),
  faceapi.nets.ageGenderNet.loadFromUri('https://rawgit.com/justadudewhohacks/face-api.js/master/weights')
]).then(startVideo)

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}

video.addEventListener('play', () => {
  canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
    
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions().withAgeAndGender()
            
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    
    //const box = { x: 50, y: 50, width: 10, height: 10 }
        // see DrawBoxOptions below
        //const drawOptions = {
          //label: detections[0].gender + " " + detections[0].age,
          //lineWidth: 1
        //}
        //const drawBox = new faceapi.draw.DrawBox(box, drawOptions)
        //drawBox.draw(canvas)
        
      //console.log("age " + detections[0].age)
      //console.log("gender " + detections[0].gender)
      //console.log(detections[0]); //THIS GIVES RESULTS!

      
      //console.log("x: " + myBox.x + "\ny: " +  myBox.y + "\nwidth: " + myBox.width + "\nheight: " + myBox.height);
      //console.log(document.getElementById("genderSelect").value)
      
      for (let i = 0; i<detections.length; i++) {
          if (detections[i].gender == "male" && settings.male) {
            drawStuff(resizedDetections, i);
          } if (detections[i].gender == "female" && settings.female) {
            drawStuff(resizedDetections, i);
          }
        }
        

  faceapi.draw.drawDetections(canvas, resizedDetections)
  //faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
  //faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
    
  }, 200)
})


function drawStuff(resizedDetections, i) {
    let myBox = resizedDetections[i].detection._box;

    var ctx = canvas.getContext("2d");  
    ctx.fillStyle = "white"
    ctx.fillRect(myBox.x, myBox.y, myBox.width, myBox.height);

    ctx.font = "12px Arial";
    ctx.fillStyle = "blue"
    ctx.fillText(resizedDetections[i].gender +" "+Math.round(resizedDetections[i].age), myBox.x+5, myBox.y + 15);
    
}

//GUI
var gui = new dat.GUI();
var settings = { age: 5, male: false, female: false};


gui.add(settings, 'male');
gui.add(settings, 'female');
gui.add(settings, 'age', 0, 100);

console.log(settings.age)
