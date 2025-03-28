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
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions().withAgeAndGender()
    //console.log("finished loading")
    if (detections.length > 0) {
        //console.log("age " + detections[0].age)
        //console.log("gender " + detections[0].gender)
    }
        
    //faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    
    const box = { x: 20, y: 50, width: 0, height: 0 } //Try to make the ugly box invisible
        // see DrawBoxOptions below
        const drawOptions = {
          label: detections[0].gender + " " + Math.floor(detections[0].age) + " years old",
          lineWidth: 1
        }
        const drawBox = new faceapi.draw.DrawBox(box, drawOptions)
        drawBox.draw(canvas)
      
    faceapi.draw.drawDetections(canvas, resizedDetections)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
    //faceapi.draw.drawAgeAndGender(canvas, resizedDetections)
  }, 200)
})