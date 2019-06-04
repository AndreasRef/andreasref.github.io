const video = document.getElementById("myvideo");
const handimg = document.getElementById("handimage");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
let trackButton = document.getElementById("trackbutton");
let nextImageButton = document.getElementById("nextimagebutton");
let updateNote = document.getElementById("updatenote");

//let imgindex = 1
let isVideo = false;
let model = null;

// video.width = 500
// video.height = 400

const modelParams = {
    flipHorizontal: true,   // flip e.g for video  
    maxNumBoxes: 2,        // maximum number of boxes to detect
    iouThreshold: 0.8,      // ioU threshold for non-max suppression
    scoreThreshold: 0.8,    // confidence threshold for predictions.
}

/*draw();

function draw(); {
    ellipse(mouseX, mouseY, 20, 20);
}*/

function startVideo() {
    handTrack.startVideo(video).then(function (status) {
        console.log("video started", status);
        if (status) {
            updateNote.innerText = "Video started. Now tracking"
            isVideo = true
            runDetection()
        } else {
            updateNote.innerText = "Please enable video"
        }
    });
}

function toggleVideo() {
    if (!isVideo) {
        updateNote.innerText = "Starting video"
        startVideo();
    } else {
        updateNote.innerText = "Stopping video"
        handTrack.stopVideo(video)
        isVideo = false;
        updateNote.innerText = "Video stopped"
    }
}



/*nextImageButton.addEventListener("click", function(){
    nextImage();
});*/

trackButton.addEventListener("click", function(){
    toggleVideo();
});

/*function nextImage() {

    imgindex++;
    handimg.src = "images/" + imgindex % 15 + ".jpg"
    // alert(handimg.src)
    runDetectionImage(handimg)
}*/



function runDetection() {
    model.detect(video).then(predictions => {
        //console.log("Predictions: ", predictions);
        model.renderPredictions(predictions, canvas, context, video);
        
        
        let firstHandX = 0;
        let secondHandX = 0;
        let distanceBetweenHands = 0;
        
        
        if (predictions[0]) {
            let midval = predictions[0].bbox[0] + (predictions[0].bbox[2] / 2)
            //console.log('First hand mid: ', midval);
            
            firstHandX = midval;

        } 
        
        if (predictions[1]) {
            let midval = predictions[1].bbox[0] + (predictions[1].bbox[2] / 2)
            //console.log('Second hand mid: ', midval);
            
            secondHandX = midval;
            
            distanceBetweenHands = Math.abs(firstHandX - secondHandX);
            
            console.log('distanceBetweenHands: ', distanceBetweenHands);
            

        } 
        
        
        if (isVideo) {
            requestAnimationFrame(runDetection);
        }
    });
}

function runDetectionImage(img) {
    model.detect(img).then(predictions => {
        console.log("Predictions: ", predictions);
        model.renderPredictions(predictions, canvas, context, img);
    });
}

// Load the model.
handTrack.load(modelParams).then(lmodel => {
    // detect objects in the image.
    model = lmodel
    updateNote.innerText = "Loaded Model!"
    runDetectionImage(handimg)
    trackButton.disabled = false
    nextImageButton.disabled = false
});
