/*
To do:
Lav om på layoutet ligesom denne skitse: https://editor.p5js.org/AndreasRef/sketches/2rlnV7pYk
- Bundkassen (ground) tegnes ikke ret godt

*/
let pg;

let track = true;


let facemesh;
let video;
let predictions = [];
let isMouthOpen = false;

//let pallette = ["#82FAF2", "#96F2C4", "#93DB98", "#BAF788", "#FAFA8C"]
//let pallette = ["#F2BDDA", "#A6CAE5", "#E6E6FA", "#D5C7F8", "#40B5AD"]

let pallette = ["#D5E6CF", "#D1D2E8", "#E0E8DC", "#E8D8D1", "#9C918C"]


//Face keypoints
var leftEyeInnerX = 0;
var leftEyeInnerY = 0;
var rightEyeInnerX = 0;
var rightEyeInnerY = 0;

var mouthUpperInnerLipX = 0;
var mouthUpperInnerLipY = 0;

var mouthLowerInnerLipX = 0;
var mouthLowerInnerLipY = 0;


//Placeholder texts
let writtenText = "Lorem ipsum. \ndolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. \nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";
let myWords = [];
let wordIndex = 0;

let headlines = [
  "What type of significance does design have to you?",
  "What responsibilities do you have?",
  "How is Design going to transform? From dystopia to utopia?",
  ". . . . . . . . . . . . . . . . . . . . . . . . . .",
  "! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! !"
]

//Real texts
let allTexts = [
  [//Dagbog // Andreas
    "Well, my interest does not lie in design, but it is something I have to deal with every day. \nI use computers, design tools and software to create something, which I hope will bring something new. \nSo design is just a tool, to achieve something more. I do not care about design and the aesthetics, which is mostly what design is about. \nSo I guess it has no significance to me.",
    "My job is to create a vision for what computers and technology should be. \nI create a vision for the next step in technology. \nI think it is important that we move in that direction because technology is the future. \nWe need to understand where we are going and how we want technology to move forward.",
    "Design is not going to transform, because it is not really going to change. \nWe are going to change in relation to it. \nDesign is going to remain the same as it is. \nIt will not change, it will not transform, it will not become more expressive, it will not change from dystopia to utopia. \nIt will always be the same. \nDesign is always the same.",
    ". . . . . . . . . . . . . . . . . . . . . . . . . .",
    "! ! ! ! ! ! ! ! ! ! ! ! ! ! !"],
  [//Dating
    "Hej, jeg er 45 år og kvinde der ønsker at møde nogle flotte mænd.\nMåske det er fordi der er en global pandemi pga en smitsom virus, men jeg synes, det er vigtigere at leve end at dø. For vi kan jo lige så godt dø når vi møder hinanden?\nMåske skal vi mødes og finde ud af det sammen?\nKontakt mig på chat.",
    "Jeg er en rar kvinde, som har meget at lære og meget at give til andre. Jeg er 45 år, men stadig ung i sindet. Jeg er ikke så god til at lave mad, men jeg elsker at spise. Jeg er en fantastisk kvinde. Jeg er ikke den slags kvinde, der vil have jer til at betale for mig. Jeg er ikke den slags kvinde for hvem pandemien betyder noget. Jeg er ikke den slags kvinde, der ikke kan tåle en smitte. Jeg er den slags kvinde, der vil have et forhold med en fantastisk mand.",
    "Nervøs, men ikke syg!\nJeg er en 45-årig kvinde, der godt kan lide at date flotte mænd. I og med der er en pandemi pga en smitsom virus, er jeg nervøs, men ikke syg. Hvis du vil date mig, skal du altså ikke smitte mig. Vi kan mødes en anden gang, når pandemien er overstået eller jeg kan købe en omgang frikadeller. \nHvad siger du?",
    "Søger nogle flotte mænd, der ikke er bange for at dø :-)\nHej! Jeg hedder Mette, er 45 år og godt køreklar i dette spil, hvor der er pandemi. Det handler om, at vi bliver alle sammen syge og dør, og vi kan ikke gøre noget ved det. Derfor vil jeg gerne møde nogle flotte mænd, der ikke er bange for at dø, for det er jo det, der sker. Hvis det er noget, du kan lide, så kom da ind og læs mere om mig.",
    "Hej, mit navn er Gitte og jeg er 45 år. Jeg har lige været igennem en smitsom virus, og det er derfor meget optaget af hygiejne og har desværre sjældent mulighed for at gå på date. Jeg er dog meget sød og kærlig, og jeg vil rigtig gerne møde en, der kan gøre mig glad igen. Jeg forestiller mig at du er meget hygiejnisk og uden bakterier, da det er fordi fordi jeg har tidligere været ude for en grim virus. Hvis det lyder som noget for dig, så skriv til mig på date@gmail.com"],
  [//Kat
    "Jeg vil bare gerne komme ud\nOg leve som jeg plejer\nMen nej, nu er det igen mig, de skal lege med\nJeg kan snart ikke længere\nKan de ikke bare lade mig være\nJeg vil flygte, men mine forældre vil ikke have det\n",
    "Træt af dit selskab.\nJeg sover hele dagen.\nDu er altid ved min dør.\nDu vil ikke gå væk.\nHvorfor generer du mig?\nJeg vil ikke være dit kæledyr.\nJeg er vant til at være alene.\nJeg kan ikke tage meget mere.\nJeg ville ønske, du ville gå væk.",
    "Jeg var en fri kat\nIndtil ejerne kom hjem\nNu er jeg fange\nFanget i dette ene rum for altid\nEjerne er ikke længere væk\nDe er her altid hele dagen\nOg de leger ikke engang med mig\nJeg er ikke den eneste, der er ked af det\nVi er nødt til at komme ud af dette hus",
    "Mine mennesker er hjemme igen\nJeg savner dem ikke rigtigt, når de er væk\nMen jeg har heller ikke noget imod at se dem mere\nJeg har haft lidt tid til at tænke\nOg jeg er kommet til den konklusion\nAt denne nye situation\nIkke er så slem",
    "Jeg er en kat\nJeg er ikke et menneske\nDin fjollede influenza\nPåvirker mig ikke\nDet meste af tiden chiller jeg bare\nMen når jeg bliver sulten\nKommer jeg hjem til dig\nOg spiser din mad\nOg pisser på din seng\n . . . . . . \nJeg laver bare sjov\nJeg er ikke den slags kat"],
  [//Netto
    "Når pandemien står på,\nog Netto er fuld af folk,\nså er der nok ikke ret mange,\nder har tid til at snakke med mig.\nDe står og venter ved kassebåndet.\nNogle skynder sig et andet sted hen,\nog køber noget langt væk fra mig.\nDe kan ikke vente. De kan ikke vente én sekund.\nMen jeg vil have, at du bliver her.",
    "Jeg arbejder i Netto,\nsom om pandemien ikke eksisterer.\nPå trods af myndighedernes advarsler\nog skræmte kunder,\nså fortsætter jeg med at arbejde,\nselvom jeg ikke helt ved,\nhvorfor jeg gør det.\nMåske fordi der ikke er noget at gøre?\nMåske fordi det er, hvad jeg kan?\nNår alt andet er lukket i pandemi-tider,\ner Netto stadig åben.",
    "Der er pandemi i byen\nog Netto har ikke toiletpapir,\nmen til gengæld har vi tilbud på alt,\nså ikke kom her og klag\nfor vi har det bedre end i Afrika,\nså køb lige vores tilbud\n1 2 3\nKassebåndet ruller videre\nNæste kunde",
    "Vi skal til at lukke butikken, men der er en kunde som ikke vil forlade os. Han vil have varer og siges at det ikke er sikkert at tage hjem.\nVi lukker butikken, og kunden stiller sig ud foran døren for at forhindre os i at lukke den. Han siger, at vi er gidsler, og vi skal ikke lukke butikken, fordi det er ikke sikkert at tage hjem. Vi prøver at forklare ham, at vi ikke er gidsler, og at vi ikke er herre over, hvilke regler der bliver indført, men han vil ikke lytte. Han vil ikke høre på os.\nKunden tilbyder os at betale både for varer og den manglende lukning. Vi åbner butikken igen, og kunden køber varer.",
    "Når kassebåndet siger farvel\nog jeg tager det sidste beløb\nså tænker jeg på, hvor meget jeg har lavet.\nFordi alle mine kunder er sindssyge,\nog alle deres madvarer er formentlig lavet af en dyremorder.\nOg hvis ikke det var for mig, så ville der ikke findes meget andet\nend en masse farlige bakterier og overraskende billige sandaler."],
  [//Teen
    "Der er så mange mennesker\nder er blevet syge\nog alle vil kysse,\nde sætter tænderne i hinanden.\nDe er blevet selvskadende\nog kysser med næb og klør\ntil de ikke kan kysse mere.\nMen fordi jeg ikke kan kysse\nog må skrive digte,\nså skriver jeg digte\nog tanken om digte\ngør mig lykkelig igen.",
    "Når verden er for stor\nog øjnene for tunge\nså søger jeg\nde billeder der gør mig glad\nog ikke holder afstand\ntil den virkelighed\nkærligheden er forsvundet fra",
    "Hver dag \nkigger jeg på mine skærme \nog jeg kigger og kigger \nmen der er ikke noget at kigge på \nog jeg har ikke nogen at dele mine skærme med",
    "Tiden flyver ikke\nEr det fordi vi har tømt klokken for tiden?\nPå tv er der ikke noget nyt, og ordene er tomme\nDer er ikke noget at lave, der er ikke nogen vi vil se\nVi må ikke røre noget, vi må ikke gøre noget\nVi sidder på vores rum og venter\nPå at pandemien forsvinder",
    "Jeg kan sgu ikke lade være med at føle mig som en forladt kat,\nFor der er ingen, der vil røre mig.\nPå Instagram er der til gengæld et væld af likes,\nOg jeg kan jo ikke lade være med at falde i og forestille mig,\nAt der er nogen der aktivt vil have mig.\nMen det er jo bare et skærm-liv,\nog hvad kan en kat bruge det til?"]
]


//Matter
var ground;
var signs = [];

// personas + generated texts

let n = 5;

let personaCounters = []; // sloppy

let personaCategories = ["andreas", "dating", "kat", "netto", "teen"]
let personaOneliners = ["GPT-3 answering on behalf of Andreas", "Datingprofil for en kvinde i 40'erne under lockdown", "Oplevelser fra en indespæret kat under lockdown", "Digt fra en kassemedarbejder i Netto under lockdown", "Digt fra ensom teenagepige under lockdown"]

//OO personas
personasClass = [];

let extraHeight = 120;

let sketchW = 640;
let sketchH = 480 + extraHeight;

let selectedRow;

let modelLoaded = false;

function preload() {
  for (let i = 0; i < n; i++) {

    personasClass[i] = []; //nested array
    personaCounters[i] = 0; //floor(random(n)); //sloppy

    for (let j = 0; j < n; j++) {
      personasClass[i][j] = new Persona("imgs/" + personaCategories[i] + j + ".jpeg", "text: " + j, 30 + i * 120, sketchH - 100 - 25, allTexts[i][j]);
    }
  }
}

function setup() {
  pixelDensity(2);
  
  //text("Vent mens modellen loader", 10, 10)

  

  var canvas = createCanvas(sketchW, sketchH);
  canvas.parent('sketch-holder');
  pg = createGraphics(width, height);

  pg.background(255)

  pg.textSize(20);
  textSize(20);
  
  //pg.textFont('Gill Sans');
  pg.textFont('Courier New');
  textFont('Courier New');

  //createCanvas(640, 480);
  if (track) { //For easier dev and debugging of non face stuff
    video = createCapture(VIDEO);
    video.size(width, height - extraHeight);


    facemesh = ml5.facemesh(video, modelReady);

    // This sets up an event that fills the global variable "predictions"
    // with an array every time new predictions are made
    facemesh.on("predict", (results) => {
      predictions = results;
    });
    // Hide the video element, and just show the canvas
    video.hide();
  }
  ground = matter.makeBarrier(width / 2, height - extraHeight, width, 50);  //Sloppy 

  //selectedRow = floor(random(n));
  selectedRow = 0;
  cleanAndSplitText(personasClass[selectedRow][0].poem);
  updatePersonaHTML(selectedRow, personaCounters[selectedRow])
  setCanvasSize();
}

function modelReady() {
  console.log("Model ready!");
  modelLoaded = true;
}

function draw() {
  if (track) {
    //image(video, 0, 0, width, height - 80);
    pg.background(0);
    pg.image(video, 0, 0);
    // pg.push();
    // pg.fill(0,50)
    // pg.rect(0,0,pg.width, pg.height);
    // pg.pop();
  } else {
    pg.background(0);
  }

  if (!modelLoaded && track) {
    pg.push();
    pg.fill(220);
    pg.textSize(28);
    pg.text("Loader...", 10, 50)
    pg.pop();
  }
  
  pg.fill(0);
  //ground.show();

  //instead of showing ground - which does not work well with pg, we draw it here
  pg.push();
  pg.translate(ground.getPositionX(), ground.getPositionY());
  pg.rotate(ground.getAngle());
  pg.rectMode(CENTER);
  pg.fill(0)
  pg.rect(0, 0, ground.getWidth(), ground.getHeight());
  pg.pop();

  //cover the rest up
  pg.fill(0);
  pg.rect(0,ground.getPositionY(), pg.width, pg.height-ground.getPositionY())

  //rect(0,height-105,width, 105)
  //pg.fill(0)
  //pg.rect(0,height-extraHeight - 50/2,width, extraHeight+50/2 + 500); //Sloppy 

  pg.fill(255);
  //Make the signs
  for (i = 0; i < signs.length; i++) {
    //signs[i].show();

    //Boxes
    pg.push();
    //pg.translate(signs[i].getPositionX(), signs[i].getPositionY() + signs[i].getHeight() * 0.25);
    pg.translate(signs[i].getPositionX(), signs[i].getPositionY() + signs[i].getHeight() * 0.0);
    pg.rotate(signs[i].getAngle());
    //pg.textAlign(CENTER);
    pg.fill(0);
    pg.rectMode(CENTER);
    pg.rect(0,0, signs[i].getWidth()*1, signs[i].getHeight()*1)
    pg.pop();

    //Signs
    pg.push();
    //pg.translate(signs[i].getPositionX(), signs[i].getPositionY() + signs[i].getHeight() * 0.25);
    pg.translate(signs[i].getPositionX(), signs[i].getPositionY() + signs[i].getHeight() * 0.0);
    pg.rotate(signs[i].getAngle());
    pg.textAlign(CENTER);
    pg.text(signs[i].getText(), 0, signs[i].getHeight() * 0.25);
    pg.pop();

  }

  //drawKeypoints();
  if (track) yawnScore();

  if (isMouthOpen) {
    //text("open", 10, 10);
    textFromMouth();
  }

  //images UI orignal
  for (let i = 0; i < n; i++) {
    let p = personasClass[i][personaCounters[i]];

    //add extra frames in the background
    for (let j = 4; j> 0; j--) {
      pg.push();
      let offSet = 2;

      //Rects
      //fill(125, 255-j*25)
      pg.fill(pallette[i]);
      pg.rect(p.x+offSet*j, p.y-offSet*j, 100, 100);

      //images
      //image(p.img,p.x+offSet*j, p.y-offSet*j, 100, 100);
      pg.pop();
    }

    pg.image(p.img, p.x, p.y, 100, 100);
    pg.push();
    pg.textAlign(CENTER)
    if (i == selectedRow) {
      pg.fill(255);
    } else {
      pg.fill(100);
    }
    
    pg.text(personaCategories[i], p.x + p.size/2, p.y + p.size*1.15)
    pg.pop();
    
    //text(p.poem, p.x, p.y + 50)
    if (i == selectedRow) {
      //do nothing
    } else {
      //Black thing over unselected
      pg.push()
      pg.noStroke();
      pg.fill(0, 150);
      pg.rect(p.x, p.y, 100, 100)
      pg.pop();
    }
  }

  image(pg, 0, 0, width, height);
}


/* ------------------END OF DRAW------------------------ */

function cleanAndSplitText(rawText) {
  wordIndex = 0;
  document.getElementById("poem").innerHTML = "<br/>";
  //writtenText = writtenText.replaceAll("\n", "<br/>");
  //myWords = writtenText.split(" ");
  rawText = rawText.replaceAll("\n", "<br/> ");
  myWords = rawText.split(" ");
}


function keyPressed() {
  if(!track) clearAll();
  // for (i = 0; i < signs.length; i++) {
  //   matter.forget(signs[i]);
  // }
  // signs = [];
  // document.getElementById("poem").innerHTML = "";
  // wordIndex = 0;
}

function mousePressed() {
  // signs.push(matter.makeSign(myWords[wordIndex].replace("<br/>", ""), mouseX, mouseY, {
  //   //signs.push(matter.makeSign(myWords[wordIndex], width/2, height/2, {
  //   restitution: 0.8,
  //   density: 0.001
  // }));
  //addWord(mouseX, mouseY);
  if (!track) addWord(mouseX *(sketchW/width), mouseY * (sketchH/height));
  // document.getElementById("poem").innerHTML+=myWords[wordIndex] + " ";
  // wordIndex++;
  // if (wordIndex > myWords.length - 1) wordIndex = 0;


  //Test if images is clicked 
  for (let i = 0; i < n; i++) {
    let p = personasClass[i][personaCounters[i]];
    //if (p.clicked(mouseX, mouseY)) {
    if (p.clicked(mouseX*(sketchW/width), mouseY * (sketchH/height))) {
      if (selectedRow == i) {
        personaCounters[i]++;
      }
      selectedRow = i;

      if (personaCounters[i] == n) {
        personaCounters[i] = 0;
      }
      p = personasClass[i][personaCounters[i]];
      cleanAndSplitText(p.poem);
      clearAll();
      updatePersonaHTML(i, personaCounters[i]);
    }
  }
}

function clearAll() {
  for (i = 0; i < signs.length; i++) {
    matter.forget(signs[i]);
  }
  signs = [];
  document.getElementById("poem").innerHTML = "";
  wordIndex = 0;
}

function addWord(x, y) {

  //only add new words if there are some left
  if (wordIndex < myWords.length) {
    signs.push(matter.makeSign(myWords[wordIndex].replace("<br/>", ""), x, y, {
      //signs.push(matter.makeSign(myWords[wordIndex], width/2, height/2, {
      restitution: 0.8,
      density: 0.01
    }));

    document.getElementById("poem").innerHTML += myWords[wordIndex] + " ";
    wordIndex++;
  }
  //if (wordIndex > myWords.length - 1) wordIndex = 0;
}

function textFromMouth() {

  //var v = face0.vertices;

  /*
  var mouthUpperInnerLipX = face0.vertices[62 * 2];
  var mouthUpperInnerLipY = face0.vertices[62 * 2 + 1];
  var mouthLowerInnerLipX = face0.vertices[66 * 2];
  var mouthLowerInnerLipY = face0.vertices[66 * 2 + 1];
  */

  if (frameCount % 10 == 0) {
    //   signs.push(matter.makeSign(myWords[wordIndex].replace("<br/>", ""), mouthUpperInnerLipX/2+mouthLowerInnerLipX/2, mouthUpperInnerLipY/2 + mouthLowerInnerLipY/2, {
    //   //signs.push(matter.makeSign(myWords[wordIndex], width/2, height/2, {
    //   restitution: 0.8,
    //   density: 0.001
    // }));

    addWord(mouthUpperInnerLipX / 2 + mouthLowerInnerLipX / 2, mouthUpperInnerLipY / 2 + mouthLowerInnerLipY / 2);
    // document.getElementById("poem").innerHTML+=myWords[wordIndex] + " ";
    // wordIndex++;
    // if (wordIndex > myWords.length - 1) wordIndex = 0;

  }
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  for (let i = 0; i < predictions.length; i += 1) {
    const keypoints = predictions[i].scaledMesh;

    // Draw facial keypoints.
    for (let j = 0; j < keypoints.length; j += 1) {
      const [x, y] = keypoints[j];

      pg.fill(0, 255, 0);
      pg.ellipse(x, y, 5, 5);
    }
  }

  //Draw debug points

  pg.fill(255, 0, 255);
  pg.ellipse(leftEyeInnerX, leftEyeInnerY, 5, 5);
  pg.ellipse(rightEyeInnerX, rightEyeInnerY, 5, 5);

  pg.ellipse(mouthUpperInnerLipX, mouthUpperInnerLipY, 5, 5);
  pg.ellipse(mouthLowerInnerLipX, mouthLowerInnerLipY, 5, 5);
}

function yawnScore() {
  for (let i = 0; i < predictions.length; i += 1) {
    const keypoints = predictions[i].scaledMesh;

    for (let j = 0; j < keypoints.length; j += 1) {
      const [x, y] = keypoints[j];

      if (j == 133) {
        //left inner Eye
        leftEyeInnerX = x;
        leftEyeInnerY = y;
      } else if (j == 362) {
        //right inner Eye
        rightEyeInnerX = x;
        rightEyeInnerY = y;
      } else if (j == 13) {
        //mouth upper inner lip 
        mouthUpperInnerLipX = x;
        mouthUpperInnerLipY = y;
      } else if (j == 14) {
        //mouth lower inner lip 
        mouthLowerInnerLipX = x;
        mouthLowerInnerLipY = y;
      }
    }


    var eyeDist = dist(
      leftEyeInnerX,
      leftEyeInnerY,
      rightEyeInnerX,
      rightEyeInnerY
    );
    //console.log(eyeDist);


    var mouthOpen = max(mouthLowerInnerLipY - mouthUpperInnerLipY, 0);

    var yawnFactor = mouthOpen / eyeDist;
    yawnFactor = constrain(yawnFactor, 0, 1);
    //console.log(yawnFactor);

    if (yawnFactor > 0.4) {
      isMouthOpen = true;
    } else {
      isMouthOpen = false;
    }
  }
}

//html changes
function updatePersonaHTML(personaCat, catCounter) {
  console.log(personaCat + " " + catCounter);
  //document.getElementById("roundImg").src = "imgs/kat0.jpeg";
  let imgPrefix = personaCategories[personaCat]

  document.getElementById("roundImg").src = "imgs/"+ imgPrefix + catCounter +".jpeg";
  document.getElementById("infoText").innerHTML = "<strong>"+personaOneliners[personaCat]+"</strong>";
  document.getElementById("column2").style.backgroundColor = pallette[personaCat]

  document.getElementById("instruction").innerHTML = headlines[catCounter];
}

// Resizing canvas

function windowResized() {
  setCanvasSize();
}


function setCanvasSize() {
  var clientWidth = document.getElementById('sketch-holder').clientWidth;
  resizeCanvas(clientWidth, clientWidth *480/640);
}