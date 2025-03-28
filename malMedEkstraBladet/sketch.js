//const HTTP = 'http:' + '//',
//      PROX = 'CORS-Anywhere.HerokuApp.com/',
//      SITE = 'EkstraBladet.dk/',
//      PATH = 'rss2/',
//      FILE = 'rss.xml',
//      QRY1 = '?mode=' + 'normal',
//      QRY2 = '&submode=' + 'nyheder',
//      URI  = HTTP + PROX + HTTP + SITE + PATH + QRY1 + QRY2,
//      REMOTE = true,
      titles = ["23-årig med K-skål: Mine bryster vil ikke stoppe med at vokse", 
                "Sheridan Larkman har været på venteliste til en operation i årevis. Nu beder hun om fremmedes hjælp.",
               "Tyskland: Over 500 betjente i kæmpe anti-terroraktion",
               "Dette billede får konspirationsteori til at blomstre: Var månelandingen fake?",
               "Det her er ulovligt i stemmeboksen - du må ikke tage en 'valg-fie'",
               "Thorning sætter Kinnock på plads i unikt klip: - Hvorfor gør du det her nu?",
               "Verdenskendt modeshow ramt af nye skandaler: Afvist superstjerne og brystsmutter",
               "Atomulykke sender mystisk sky over Danmark: Her er årsagen",
               "Provinsby i oprør: Nu tager sagen en overraskende drejning",
               "Objekt dobbelt så høj som Frihedsgudinden spottet i vores solsystem",
               "Purunge piger dropper skolen: Derfor fryser de på Rådhuspladsen",
               "USA smider 60.000 haitianere på porten",
               "Anklager vil undersøge USA for krigsforbrydelser"];

//var URL = "http://cors-anywhere.herokuapp.com/http://EkstraBladet.dk/rss2/?mode=normal&submode=nyheder";

let xml;
var myString = "";

function preload() {
    //console.info(URI);
    //xml = loadXML(REMOTE && URI || FILE, print, console.warn);
    //xml = loadXML(URL || FILE, print, console.warn);
}

var x = 0;
var y = 0;
var stepSize = 5.0;

var font = "Times New Roman";
var letters = "";
var fontSizeMin = 3;

var articleIndex =0;
var counter = 0;

var infoScreen = true;

var programHeight = 0;
var prevHeight = 0;

function setup() {
    createCanvas(windowWidth, windowHeight);
    programHeight = height;

    //for (const item of xml.getChild('channel').getChildren('item'))
      //  titles.push(item.getChild('title').getContent());

    background(255);
    smooth();
    cursor(CROSS);

    x = mouseX;
    y = mouseY;

    textFont(font);
    textAlign(LEFT);
    fill(0);

}

function draw() {

    if (infoScreen == true) {
        push();
        textFont(font,24);
        background(255);
        text("Tegn med overskrifter fra ekstrabladet.dk ved at holde musen nede og trække den over skærmen. \nTryk på en tast for at få et rent lærred.", 100, 100); 
        pop();
    } 

    letters = titles[articleIndex];

    if (mouseIsPressed) {
        var d = dist(x,y, mouseX,mouseY);
        textFont(font,fontSizeMin+d/2);
        var newLetter = letters.charAt(counter);
        stepSize = textWidth(newLetter);

        if (d > stepSize) {
            var angle = atan2(mouseY-y, mouseX-x);

            push();
            translate(x, y);
            rotate(angle);
            text(newLetter, 0, 0);
            pop();

            counter++;
            if (counter > letters.length-1) counter = 0;

            x = x + cos(angle) * stepSize;
            y = y + sin(angle) * stepSize;
        }
    }
}

function mousePressed() {
    x = mouseX;
    y = mouseY;

    fullscreen(true);
}

function mouseClicked() {
    if (articleIndex < titles.length - 1) {
        articleIndex++;
    } else {
        articleIndex = 0;
    }
}

function keyReleased() {
    background(255);
}

function windowResized() {

    resizeCanvas(windowWidth, windowHeight);
    programHeight = height;
//    console.log("programHeight: " + programHeight);
//    console.log("prevHeight: " +prevHeight);

    if (programHeight > prevHeight) {
        infoScreen = false;
    } else {
        infoScreen = true;
    }
    prevHeight = programHeight;
//    console.log("infoScreen: " + infoScreen);
}