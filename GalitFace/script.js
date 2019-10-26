var myBool = true;

const video = document.getElementById('video')

var canvas = document.getElementById('overlay')

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('https://rawgit.com/justadudewhohacks/face-api.js/master/weights'),
  faceapi.nets.faceLandmark68Net.loadFromUri('https://rawgit.com/justadudewhohacks/face-api.js/master/weights'),
//  faceapi.nets.faceRecognitionNet.loadFromUri('https://rawgit.com/justadudewhohacks/face-api.js/master/weights'),
//  faceapi.nets.faceExpressionNet.loadFromUri('https://rawgit.com/justadudewhohacks/face-api.js/master/weights'),
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
  //canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
    
  setInterval(async () => {


    const detections = await faceapi.detectAllFaces(video, new 
    faceapi.TinyFaceDetectorOptions({ inputSize: 512 }, {scoreThreshold: 0.5})).withFaceLandmarks().withAgeAndGender();
                                //faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions().withAgeAndGender()
    //inputSize must be divisible by 32, common sizes are 128, 160, 224, 320, 416, 512, 608,        
                              
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    //canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    //Test to make things alligned in time
    canvas.getContext("2d").drawImage(video, 0, 0, video.width, video.height, 0, 0, video.width, video.height);

    
    //console.log("detections: " + detections[0]._box._x);
    //console.log("resized: " + resizedDetections[0]._box._x);

      for (let i = 0; i<resizedDetections.length; i++) {
        //console.log(resizedDetections[0]._box._x);
        //drawStuff(resizedDetections, i);
          if (detections[i].gender == "male" && settings.male) {
            drawStuff(resizedDetections, i);
          } if (detections[i].gender == "female" && settings.female) {
            drawStuff(resizedDetections, i);
          }
        }
        

  //faceapi.draw.drawDetections(canvas, resizedDetections)
  //faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
  //faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
      
      
  }, 200)
})


function drawStuff(resizedDetections, i) {
    let myBox = resizedDetections[i].alignedRect.box;
    console.log(resizedDetections[i])

    var ctx = canvas.getContext("2d");  
    //ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    //ctx.fillRect(myBox.x, myBox.y, myBox.width, myBox.height);
    //ctx.font = "12px Arial";
    //ctx.fillStyle = "blue"
    //ctx.fillText(resizedDetections[i].gender +" "+Math.round(resizedDetections[i].age), myBox.x+5, myBox.y + 15);

    let offSet = myBox.width/8;


  
    ctx.filter = 'blur(15px)';
    //ctx.drawImage(video, myBox.x, myBox.y, myBox.width, myBox.height, myBox.x, myBox.y, myBox.width, myBox.height)
    ctx.drawImage(video,myBox.x + offSet, myBox.y - offSet, myBox.width - offSet*2, myBox.height, myBox.x + offSet, myBox.y - offSet, myBox.width - offSet*2, myBox.height)
    ctx.drawImage(video,myBox.x + offSet, myBox.y - offSet, myBox.width - offSet*2, myBox.height, myBox.x + offSet, myBox.y - offSet, myBox.width - offSet*2, myBox.height)
    //ctx.drawImage(video,myBox.x, myBox.y - offSet, myBox.width, myBox.height + offSet * 2, myBox.x, myBox.y - offSet, myBox.width, myBox.height + offSet * 2) //blur additional time

    //Debug box without filter
    ctx.filter = 'blur(0px)';
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    //ctx.fillRect(myBox.x + offSet, myBox.y, myBox.width - offSet*2, myBox.height);
}

//GUI
var gui = new dat.GUI();
var settings = { age: 5, male: false, female: false};


gui.add(settings, 'male');
gui.add(settings, 'female');
gui.add(settings, 'age', 0, 100);
