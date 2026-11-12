const video = document.getElementById('video');
const status = document.getElementById('status');
const modelUrl = new URL('./models/', document.baseURI).href;

async function start() {
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(modelUrl),
      faceapi.nets.faceLandmark68Net.loadFromUri(modelUrl),
      faceapi.nets.faceExpressionNet.loadFromUri(modelUrl),
      faceapi.nets.ageGenderNet.loadFromUri(modelUrl)
    ]);
    status.textContent = 'Allow camera access to start.';
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Camera access requires HTTPS or localhost and a supported browser.');
    }
    video.srcObject = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    await video.play();
    status.textContent = '';

    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    async function detect() {
      try {
        if (video.paused || video.ended) {
          setTimeout(detect, 200);
          return;
        }
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions()
          .withAgeAndGender();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
        for (const detection of resizedDetections) {
          new faceapi.draw.DrawTextField(
            [`${detection.gender} ${Math.floor(detection.age)} years old`],
            detection.detection.box.bottomLeft
          ).draw(canvas);
        }
        // Wait for inference to finish before scheduling another frame.
        setTimeout(detect, 200);
      } catch (error) {
        showError('Face detection failed', error);
      }
    }
    await detect();
  } catch (error) {
    showError('Unable to start', error);
  }
}

function showError(message, error) {
  console.error(message, error);
  status.textContent = `${message}: ${error.message || error}`;
}

start();
