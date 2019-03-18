//ml5 - KNN Classification on Webcam Images with mobileNet. 
//Advanced example with load/save, flexible number of classes + less mouse clicking :)

let video;
// Create a KNN classifier
const knnClassifier = ml5.KNNClassifier();
let featureExtractor;

let myClasses = []; 

let myClassNames = ["Andreas", "Hello", "Peace"]; //Add as many classes as you wish 

let myPredicton = ""; //Variable for keeping track of the label with highest confidence 


function setup() {
    createCanvas(640,480)
  	frameRate(25)
    for (let i = 0; i < myClassNames.length; i++) {
        myClasses.push(new Category(myClassNames[i]));
    }
    
    // Create a featureExtractor that can extract the already learned features from MobileNet
    featureExtractor = ml5.featureExtractor('MobileNet', modelReady);
    
    video = createCapture(VIDEO);
    video.hide();
    createButtons();
    textAlign(CENTER);
    textSize(32);
}

function draw() {
    image(video, 0, 0)
    for (let i = 0; i < myClassNames.length; i++) {    
        if (myClasses[i].recordExamples) {
            addExample(myClasses[i].name);
        }
    }
  
    fill(0,255,0)
    text(myPredicton, width/2, height/2);
}


// Category class
class Category {
    constructor(s) {
        this.name = s;
        this.recordExamples = false;
    }
}

function modelReady(){
    select('#status').html('FeatureExtractor(mobileNet model) Loaded')
}

// Add the current frame from the video to the classifier
function addExample(label) {
    const features = featureExtractor.infer(video);
    knnClassifier.addExample(features, label);
    updateCounts();
}

// Predict the current frame.
function classify() {
    // Get the total number of labels from knnClassifier
    const numLabels = knnClassifier.getNumLabels();
    if (numLabels <= 0) {
        console.error('There is no examples in any label');
        return;
    }
    // Get the features of the input video
    const features = featureExtractor.infer(video);

    // Use knnClassifier to classify which label do these features belong to
    // You can pass in a callback function `gotResults` to knnClassifier.classify function
    knnClassifier.classify(features, 10, gotResults); // You can also pass in an optional K value, K default to 3
}

// A util function to create UI buttons
function createButtons() {
    //Linebreak
    linebreak = createDiv('');
    
    for (let i = 0; i<myClassNames.length; i++) {
        
        //Buttons for recording new examples
        myClasses[i].button = createButton('Add Examples to Class ' + myClasses[i].name)
            .mousePressed(()  => myClasses[i].recordExamples = true)
            .mouseReleased(() => myClasses[i].recordExamples = false);

        //Reset buttons
        myClasses[i].resetBtn = createButton('Reset Class '+ myClasses[i].name);
        myClasses[i].resetBtn.mousePressed(function() {
            clearLabel(myClasses[i].name);
        });    

        //Count + confidence text
        myClasses[i].exampleCount = createP(myClasses[i].name + ' examples');
        myClasses[i].confidence = createP(' | Confidence in ' + myClasses[i].name + ' is: ');

        //Linebreak
        linebreak = createDiv('');
    }    

    //GENERAL BUTTONS
    // Predict button
    buttonPredict = select('#buttonPredict');
    buttonPredict.mousePressed(classify);

    // Clear all classes button
    buttonClearAll = select('#clearAll');
    buttonClearAll.mousePressed(clearAllLabels);
  

    // Load saved classifier dataset
    buttonSetData = select('#load');
    buttonSetData.mousePressed(loadMyKNN);

    // Save classifier dataset
    buttonGetData = select('#save');
    buttonGetData.mousePressed(saveMyKNN);
}

// Show the results
function gotResults(err, result) {
    // Display any error
    if (err) {
        console.error(err);
    }

    if (result.confidencesByLabel) {
        const confidences = result.confidencesByLabel;
        // result.label is the label that has the highest confidence
        if (result.label) {
            select('#result').html(result.label);
            select('#confidence').html(`${confidences[result.label] * 100} %`);
            
            myPredicton = result.label; //Save the label with highest confidence to myPrediction
        }

        for (let i = 0; i<myClassNames.length; i++) {
            myClasses[i].confidence.html(" confidence in class: " + `${confidences[myClasses[i].name] ? confidences[myClasses[i].name] * 100 : 0} %`);  
        }
    }
    classify();
}

// Update the example count for each label	
function updateCounts() {
    const counts = knnClassifier.getCountByLabel();

    for (let i = 0; i<myClassNames.length; i++) {
        myClasses[i].exampleCount.html(myClasses[i].name + " examples: " + counts[myClasses[i].name] || 0);
    }    
}

// Clear the examples in one label
function clearLabel(label) {
    knnClassifier.clearLabel(label);
    updateCounts();
}

// Clear all the examples in all labels
function clearAllLabels() {
    knnClassifier.clearAllLabels();
    updateCounts();
}

// Save dataset as myKNNDataset.json
function saveMyKNN() {
    knnClassifier.save('myKNN');
}

// Load dataset to the classifier
function loadMyKNN() {
    knnClassifier.load('./myKNN.json', updateCounts);
}

function toggleImages() {
 	 showImages = !showImages;
}
