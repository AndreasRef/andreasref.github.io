var loaded = false;
const video = document.getElementById('video')

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('https://rawgit.com/justadudewhohacks/face-api.js/master/weights'),
  faceapi.nets.faceLandmark68Net.loadFromUri('https://rawgit.com/justadudewhohacks/face-api.js/master/weights'),
  //faceapi.nets.faceRecognitionNet.loadFromUri('https://rawgit.com/justadudewhohacks/face-api.js/master/weights'),
  faceapi.nets.faceExpressionNet.loadFromUri('https://rawgit.com/justadudewhohacks/face-api.js/master/weights'),
  faceapi.nets.ageGenderNet.loadFromUri('https://rawgit.com/justadudewhohacks/face-api.js/master/weights')
]).then(startVideo)

function startVideo() {
  console.log("loading")
  navigator.getUserMedia(
    { video: {} },
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
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 608, scoreThreshold: 0.35 })).withFaceLandmarks().withFaceExpressions().withAgeAndGender()
    if (detections) console.log("finished loading")
            
    //faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)


    for (let i = 0; i < detections.length; i++) {
      const box = { x: 0, y: 50+ i*30, width: 0, height: 0 }

      const expression = detections[i].expressions;

        // see DrawBoxOptions below
        const drawOptions = {
          label: "face# " + i + ": " + detections[i].gender + " " + Math.floor(detections[i].age) + " years old" + 
          " angry " +  expression.angry.toFixed(2) +
          " disgusted " +  expression.disgusted.toFixed(2) +
          " fearful " +  expression.fearful.toFixed(2) +
          " happy " +  expression.happy.toFixed(2) +
          " neutral " +  expression.neutral.toFixed(2) +
          " sad " +  expression.sad.toFixed(2) +
          " surprised " + expression.surprised.toFixed(2),

          lineWidth: 1
        }
        const drawBox = new faceapi.draw.DrawBox(box, drawOptions)
        drawBox.draw(canvas)
    }
    
    faceapi.draw.drawDetections(canvas, resizedDetections)
    //faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    //faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
  }, 200)
})