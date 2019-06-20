window.onload = loadModelsAndCalculateDescriptors();

let labeledFaceDescriptors;

async function loadModelsAndCalculateDescriptors() {
    const MODELS = "https://rawgit.com/justadudewhohacks/face-api.js/master/weights"; // Contains all the weights.

    //await faceapi.loadSsdMobilenetv1Model(MODELS)
    await faceapi.loadTinyFaceDetectorModel(MODELS)
    await faceapi.loadFaceLandmarkModel(MODELS)
    await faceapi.loadFaceRecognitionModel(MODELS)

    console.log("models loaded, calculating labeledFaceDescriptors")

    const labels = ['andreas','nikolaj', 'thomas']
    const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 512 })

    labeledFaceDescriptors = await Promise.all(
        labels.map(async label => {
            //console.log("starting labeledFaceDescriptors function")

            // fetch image data from urls and convert blob to HTMLImage element
            const imgUrl = `${label}.jpg`
            const img = await faceapi.fetchImage(imgUrl)

            // detect the face with the highest score in the image and compute it's landmarks and face descriptor
            const fullFaceDescription = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor()

            if (!fullFaceDescription) {
                throw new Error(`no faces detected for ${label}`)
            }

            const faceDescriptors = [fullFaceDescription.descriptor]  
            return new faceapi.LabeledFaceDescriptors(label, faceDescriptors)
        })     
    )
    console.log("Calculated all labeledFaceDescriptors ")

    // try to access users webcam and stream the images
    // to the video element
    const videoEl = document.getElementById('inputVideo')
    navigator.getUserMedia(
        { video: {} },
        stream => videoEl.srcObject = stream,
        err => console.error(err)
    )
    console.log("Starting video")
}

async function recognise() {

        const input = document.getElementById('inputVideo')
        const fullFaceDescriptions = await faceapi.detectAllFaces(input, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors()

        // 0.6 is a good distance threshold value to judge
        // whether the descriptors match or not
        const maxDescriptorDistance = 0.6
        const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, maxDescriptorDistance)
        //console.log("face matcher"+faceMatcher)
        const results = fullFaceDescriptions.map(fd => faceMatcher.findBestMatch(fd.descriptor))


        const boxesWithText = results.map((bestMatch, i) => {
            const box = fullFaceDescriptions[i].detection.box
            const text = bestMatch.toString()
            const boxWithText = new faceapi.BoxWithText(box, text)
            //console.log(bestMatch.label);
            //console.log("_x:" + box._x + " _y:" +box._y + " width:" + box.width + " height " + box.height);
            return boxWithText
        })

        //Clear canvas
        let myCanvas = document.getElementById('overlay');
        const context = myCanvas.getContext('2d');
        context.clearRect(0, 0, myCanvas.width, myCanvas.height);

        faceapi.drawDetection(overlay, boxesWithText)
}

async function onPlay(videoEl) {
    await recognise()
    setTimeout(() => onPlay(videoEl))
} 