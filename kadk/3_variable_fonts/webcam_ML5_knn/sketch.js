
var myText; //Your text
var wghtValue = 500; //Variable for controlling the wght parameter of your font
var target = 500;

var maxWght = 1000;
var minWght = 0;

let knn;
let video;

let msg;

function setup() { 
    myText = document.getElementById("text");
    noCanvas();
    video = createCapture(VIDEO).parent('videoContainer');
    // Create a KNN Image Classifier
    knn = new ml5.KNNImageClassifier(2, 1, modelLoaded, video.elt);
    createButtons();
}

function draw() { 
    
    if (msg === 'A') {
        target = minWght;
    } else if (msg === 'B') {
        target = maxWght;
    }  
    
    wghtValue = lerp(wghtValue, target, 0.1);
    var settings = "font-variation-settings: " + '"' + "wght" + '" ' + wghtValue + ";";
    myText.setAttribute("style", settings);
}


function createButtons() {
    // Save and Load buttons
    save = select('#save');
    save.mousePressed(function() {
        knn.save('test');
    });

    load = select('#load');
    load.mousePressed(function() {
        knn.load('KNN-preload.json', updateExampleCounts);
    });


    // Train buttons
    buttonA = select('#buttonA');
    buttonA.mousePressed(function() {
        train(1);
    });

    buttonB = select('#buttonB');
    buttonB.mousePressed(function() {
        train(2);
    });

    // Reset buttons
    resetBtnA = select('#resetA');
    resetBtnA.mousePressed(function() {
        clearClass(1);
        updateExampleCounts();
    });

    resetBtnB = select('#resetB');
    resetBtnB.mousePressed(function() {
        clearClass(2);
        updateExampleCounts();
    });

    // Predict Button
    buttonPredict = select('#buttonPredict');
    buttonPredict.mousePressed(predict);
}

// A function to be called when the model has been loaded
function modelLoaded() {
    select('#loading').html('Model loaded!');
}

// Train the Classifier on a frame from the video.
function train(category) {
    if (category == 1) {
        msg = 'A';
    } else if (category == 2) {
        msg = 'B';
    }
    select('#training').html(msg);
    knn.addImageFromVideo(category);
    updateExampleCounts();
}

// Predict the current frame.
function predict() {
    knn.predictFromVideo(gotResults);
}

// Show the results
function gotResults(results) {
    //let msg;

    if (results.classIndex == 1) {
        msg = 'A';
    } else if (results.classIndex == 2) {
        msg = 'B';
    }
    select('#result').html(msg);

    // Update confidence
    select('#confidenceA').html(results.confidences[1]);
    select('#confidenceB').html(results.confidences[2]);

    setTimeout(function(){
        predict();
    }, 50);
}

// Clear the data in one class
function clearClass(classIndex) {
    knn.clearClass(classIndex);
}

// Update the example count for each class
function updateExampleCounts() {
    let counts = knn.getClassExampleCount();
    select('#exampleA').html(counts[1]);
    select('#exampleB').html(counts[2]);
}