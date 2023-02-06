//Make a dictionary with the names of the poems and the corresponding poem texts
var poemDict = {
    "background": "A poem about the background",
    "person": "A poem about a person",
    "hand": "A poem about a hand"
};



//Make page full screen on mouse click
function makeFullScreen() {
    var elem = document.body;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    }
    else if (elem.mozRequestFullScreen) { /* Firefox */
        elem.mozRequestFullScreen();
    }
    else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        elem.webkitRequestFullscreen();
    }
    else if (elem.msRequestFullscreen) { /* IE/Edge */
        elem.msRequestFullscreen();
    }
}

//call makeFullScreen() on mouse click
//document.addEventListener('click', makeFullScreen);


//Every 5 seconds, change the text of the poem to the next poem and make it the text of id="poem"
// function changePoem() {
//     var poem = document.getElementById("poem");
    
//     var currentPoemText = poemTexts[Math.floor(Math.random() * poemTexts.length)];

//     poem.innerHTML = currentPoemText;
// }

//setInterval(changePoem, 3000);


function hide() {
    document.getElementById("tm-div").style.visibility = "hidden";
}

//TEACHABLE MACHINE STUFF
// More API functions here:
        // https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

        // the link to your model provided by Teachable Machine export panel
        const URL = "https://teachablemachine.withgoogle.com/models/iYQ3Q_63S/";
        let model, webcam, labelContainer, maxPredictions;

        // Load the image model and setup the webcam
        async function init() {
            const modelURL = URL + "model.json";
            const metadataURL = URL + "metadata.json";

            // load the model and metadata
            // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
            // or files from your local hard drive
            // Note: the pose library adds "tmImage" object to your window (window.tmImage)
            model = await tmImage.load(modelURL, metadataURL);
            maxPredictions = model.getTotalClasses();

            // Convenience function to setup a webcam
            const flip = true; // whether to flip the webcam
            webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
            await webcam.setup(); // request access to the webcam
            await webcam.play();
            window.requestAnimationFrame(loop);

            // append elements to the DOM
            document.getElementById("webcam-container").appendChild(webcam.canvas);
            labelContainer = document.getElementById("label-container");
            for (let i = 0; i < maxPredictions; i++) { // and class labels
                labelContainer.appendChild(document.createElement("div"));
            }
            makeFullScreen();
        }

        async function loop() {
            webcam.update(); // update the webcam frame
            await predict();
            window.requestAnimationFrame(loop);
        }

        // run the webcam image through the image model
        async function predict() {
            var poem = document.getElementById("poem");
            // predict can take in an image, video or canvas html element
            const prediction = await model.predict(webcam.canvas);
            for (let i = 0; i < maxPredictions; i++) {
                const classPrediction = prediction[i].className + ": " + prediction[i].probability.toFixed(2);
                
                labelContainer.childNodes[i].innerHTML = classPrediction;
                
            }
            //Sort the prediction from highest to lowest probability
            let sortedPredictions = prediction.sort((p1, p2) => (p1.probability < p2.probability) ? 1 : (p1.probability > p2.probability) ? -1 : 0);
            console.log(sortedPredictions[0].className);
           
            //Get the text of the poem corresponding to the highest prediction
            var currentPoemText = poemDict[sortedPredictions[0].className];
            poem.innerHTML = currentPoemText;   

        }

        