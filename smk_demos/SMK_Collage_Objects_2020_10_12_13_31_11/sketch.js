/* To do: 
- Find bedre billeder
*/
let objectDetector;
let input;

let img;
let objects = [];
let status;
let collageButton;

let backgrounds = [];
let nBackground = 5;

let apple, banana, bear, bed, boat, book, bottle, bowl, car, cat, chair, couch, cow, cup, dining_table, dog, elephant, fork, glas, horse, knife, orange, person, potted_plant, sheep, spoon, vase, zebra;

let detections;

let nTestImages = 10;
let testImages = [];

let sel;

function preload(){

  for (let i = 0; i < nTestImages; i++) {
    testImages[i] = loadImage('images/test' + i + '.jpg')
  }

  img = loadImage('images/cat2.JPG');  

  apple = loadImage("images/apple.png")
  banana = loadImage("images/banana.png")
  bear = loadImage("images/bear.png")

  bed = loadImage("images/bed.png")
  boat = loadImage("images/boat.png")
  book = loadImage("images/book.png")
  bottle = loadImage("images/bottle.png")
  bowl = loadImage("images/bowl.png")
  car = loadImage("images/car.png")

  cat = loadImage("images/cat.png")
  chair = loadImage("images/chair.png")
  couch = loadImage("images/couch.png")
  cow = loadImage("images/cow.png")
  cup = loadImage("images/cup.png")
  dining_table = loadImage("images/dining_table.png")

  dog = loadImage("images/dog.png")
  elephant = loadImage("images/elephant.png")
  fork = loadImage("images/fork.png")
  glas = loadImage("images/glas.png")
  horse = loadImage("images/horse.png")
  knife = loadImage("images/knife.png")

  orange = loadImage("images/orange.png")
  person = loadImage("images/person.png")
  potted_plant = loadImage("images/potted_plant.png")
  sheep = loadImage("images/sheep.png")
  spoon = loadImage("images/spoon.png")
  vase = loadImage("images/vase.png")

  for (let i = 0; i < nBackground; i++) {
    backgrounds[i] = loadImage('images/bg' + i + '.jpg')
  }
}


function setup() {
  createCanvas(640, 420);
  let lineBreak0 = createDiv("Try one of the pre-loaded images ");
  sel = createSelect();

  for (let i = 0; i < nTestImages; i++) {
    testImages[i].resize(width, height);
    sel.option(i)
  }
  sel.changed(mySelectEvent);


  img = testImages[5];

  let lineBreak1 = createDiv("<br> Or upload your own");
  input = createFileInput(handleFile);
  collageButton = createButton('collage');
  collageButton.mousePressed(collage);
  
  objectDetector = ml5.objectDetector('cocossd', modelReady);
}

// Change the status when the model loads
function modelReady() {
  console.log("model Ready!")
  select('#modelStatus').html('Done! <br>This simple demo only works with the following objects:<br><em>apple, banana, bear, bed, boat, book, bottle, bowl, car, cat, chair, couch, cow, cup, dining_table, dog, elephant, fork, glas, horse, knife, orange, person, potted_plant, sheep, spoon, vase, zebra</em> <br><br>The backgrounds change randomly for now.');
  status = true;
  console.log('Detecting') 
  objectDetector.detect(img, gotResult);
}

// A function to run when we get any errors and the results
function gotResult(err, results) {
  if (err) {
    console.log(err);
  }
  console.log(results)
  detections = results;
  drawStuff();
}


function drawStuff() {
  // unless the model is loaded, do not draw anything to canvas
  if (status != undefined) {
    image(img, 0, 0)

    for (let i = 0; i < detections.length; i++) {
      noStroke();
      fill(0, 255, 0);
      text(detections[i].label + " " + nfc(detections[i].confidence * 100.0, 2) + "%", detections[i].x + 5, detections[i].y + 15);
      noFill();
      strokeWeight(4);
      stroke(0, 255, 0);
      rect(detections[i].x, detections[i].y, detections[i].width, detections[i].height);
    }
  }
}

function collage() {
  image(backgrounds[floor(random(backgrounds.length))], 0, 0, width, height);
  detections.forEach(detection => {

    //Sloppy manual if-else hell :-D
    if (detection.label === "apple") {
      image(apple, detection.x, detection.y, detection.width, detection.height);
    } else if (detection.label === "banana") {
      image(banana, detection.x, detection.y, detection.width, detection.height);
    } else if (detection.label === "bear") {
      image(bear, detection.x, detection.y, detection.width, detection.height);
    } else if (detection.label === "bed") {
      image(bed, detection.x, detection.y, detection.width, detection.height);
    } else if (detection.label === "boat") {
      image(boat, detection.x, detection.y, detection.width, detection.height);
    } else if (detection.label === "book") {
      image(book, detection.x, detection.y, detection.width, detection.height);
    } else if (detection.label === "bottle") {
      image(bottle, detection.x, detection.y, detection.width, detection.height);
    } else if (detection.label === "bowl") {
      image(bowl, detection.x, detection.y, detection.width, detection.height);
    } else if (detection.label === "car") {
      image(car, detection.x, detection.y, detection.width, detection.height);
    } else if (detection.label === "cat") {
      image(cat, detection.x, detection.y, detection.width, detection.height);
    } else if (detection.label === "chair") {
      image(chair, detection.x, detection.y, detection.width, detection.height);
    } else if (detection.label === "couch") {
      image(couch, detection.x, detection.y, detection.width, detection.height);
    } else if (detection.label === "cow") {
      image(cow, detection.x, detection.y, detection.width, detection.height);
    } else if (detection.label === "cup") {
      image(cup, detection.x, detection.y, detection.width, detection.height);
    } else if (detection.label === "dining table") {
      image(dining_table, detection.x, detection.y, detection.width, detection.height);
    } else if (detection.label === "dog") {
      image(dog, detection.x, detection.y, detection.width, detection.height);
    } else if (detection.label === "elephant") {
      image(elephant, detection.x, detection.y, detection.width, detection.height);
    } else if (detection.label === "fork") {
      image(fork, detection.x, detection.y, detection.width, detection.height);
    } else if (detection.label === "glas") {
      image(glas, detection.x, detection.y, detection.width, detection.height);
    } else if (detection.label === "horse") {
      image(horse, detection.x, detection.y, detection.width, detection.height);
    } else if (detection.label === "knife") {
      image(knife, detection.x, detection.y, detection.width, detection.height);
    } else if (detection.label === "orange") {
      image(orange, detection.x, detection.y, detection.width, detection.height);
    } else if (detection.label === "person") {
      image(person, detection.x, detection.y, detection.width, detection.height);
    } else if (detection.label === "potted plant") {
      image(potted_plant, detection.x, detection.y, detection.width, detection.height);
    } else if (detection.label === "sheep") {
      image(sheep, detection.x, detection.y, detection.width, detection.height);
    } else if (detection.label === "spoon") {
      image(spoon, detection.x, detection.y, detection.width, detection.height);
    } else if (detection.label === "vase") {
      image(vase, detection.x, detection.y, detection.width, detection.height);
    } else if (detection.label === "zebra") {
      image(zebra, detection.x, detection.y, detection.width, detection.height);
    } else {
      //text("sorry, no  image for" + detection.label + " in this demo",  detection.x, detection.y);
      console.log("sorry, no corresponding image for " + detection.label)
    }


    
  })
}


function handleFile(file) {
  print(file);
  if (file.type === 'image') {
    img = loadImage(file.data, userImageLoaded);
  } else {
    img = null;
    console.log("no image, please select something else")
  }
}
  
function userImageLoaded() {
  img.resize(width, height);
  console.log("image loaded")
  
  console.log('Detecting') 
  objectDetector.detect(img, gotResult);
}

function mySelectEvent() {
  let item = sel.value();
  console.log(item);
  

  img = testImages[item];
  userImageLoaded();
  
}