//See https://github.com/justadudewhohacks/face-api.js/issues/130

//const MODEL_URL = '/models'
//const labels = ['sheldon', 'raj', 'leonard', 'howard']

let labeledFaceDescriptors;

async function run1() {
    console.log("run1 starting")
    const MODELS = "/models"; // Contains all the weights.

    await faceapi.loadSsdMobilenetv1Model(MODELS)
    await faceapi.loadFaceLandmarkModel(MODELS)
    await faceapi.loadFaceRecognitionModel(MODELS)

    console.log("models loaded?")

    const labels = ['sheldon','howard', 'andreas', 'guy_with_hat']

    labeledFaceDescriptors = await Promise.all(
        labels.map(async label => {
            console.log("starting labeledFaceDescriptors function")

            // fetch image data from urls and convert blob to HTMLImage element
            const imgUrl = `${label}.jpg`
            const img = await faceapi.fetchImage(imgUrl)

            // detect the face with the highest score in the image and compute it's landmarks and face descriptor
            const fullFaceDescription = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()

            if (!fullFaceDescription) {
                throw new Error(`no faces detected for ${label}`)
            }

            const faceDescriptors = [fullFaceDescription.descriptor]
            console.log("ending labeledFaceDescriptors function")
            return new faceapi.LabeledFaceDescriptors(label, faceDescriptors)
        })     
    )


    // try to access users webcam and stream the images
    // to the video element
    const videoEl = document.getElementById('inputVideo')
    navigator.getUserMedia(
        { video: {} },
        stream => videoEl.srcObject = stream,
        err => console.error(err)
    )
}

async function run2() {

    const mtcnnResults = await faceapi.ssdMobilenetv1(document.getElementById('inputVideo'))

    console.log(mtcnnResults)
    console.log(mtcnnResults.length)    

    //overlay.width = 500
    //overlay.height = 400
    //const detectionsForSize = mtcnnResults.map(det => det.forSize(500, 400))

    //faceapi.drawDetection(overlay, detectionsForSize, { withScore: true })    




    if (mtcnnResults.length>0) {

        const input = document.getElementById('inputVideo')
        const fullFaceDescriptions = await faceapi.detectAllFaces(input).withFaceLandmarks().withFaceDescriptors()

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
            return boxWithText
        })
        
            //Clear canvas
    let myCanvas = document.getElementById('overlay');
    const context = myCanvas.getContext('2d');
    context.clearRect(0, 0, myCanvas.width, myCanvas.height);

    faceapi.drawDetection(overlay, boxesWithText)
    } else {
                    //Clear canvas
    let myCanvas = document.getElementById('overlay');
    const context = myCanvas.getContext('2d');
    context.clearRect(0, 0, myCanvas.width, myCanvas.height);
    }
}

async function onPlay(videoEl) {
    run2()
    setTimeout(() => onPlay(videoEl))
} 



