var capture;

var inputText = "Narcissus er navnet på en mytologisk figur fra den græske mytologi. I den myten, som han optræder i, beskrives han som en smuk ung mand, der forelsker sig i sit eget spejlbillede, som han ser i en sø. Han dør som følge af uopfyldt længsel efter sig selv. Efter hans død spirer der blomster af samme navn op fra jorden. Betegnelsen narcissisme har sin oprindelse i denne myte. Narcissisme er et andet ord for selvbeundring, selvoptagethed og selvdyrkelse, hvis betegnelse henviser til myten om Ekko og Narcissos, der foruden ‘narcissisme’ også har givet navn til begrebet ‘ekkolali’. Forskellige teoretikere benytter begrebet, narcissisme, i to betydninger – enten som et personlighedspsykologisk fænomen eller som et social psykologisk og kulturelt problem i moderniteten.";

var fontSizeMax = 60;
var fontSizeMin = 25;
var spacing = 35; // line height
var kerning = 0.5; // between letters
var infoScreen = true;


function setup() {
    createCanvas(1920, 1080);

    capture = createCapture(VIDEO);
    capture.size(64, 48);
    capture.hide();

    textFont("Times New Roman");
    //textSize(10);
    textAlign(LEFT, CENTER);
}

function draw() {
    
    if (infoScreen == true) {
        push();
        //textFont(font,24);
        background(255);
        textSize(60)
        text("Narcissus \n \nTryk på mus eller keyboard for at gå i fuld skærm", 200, 100); 
        pop();
    } else { 

        background(255);

        var x = 20;
        var y = 20;
        var counter = 0;


        capture.loadPixels();
        while(y < height) {
            // translate position (display) to position (image)
            // get current color
            var c = color(capture.get(
                round(map(x, 0, width, 0, capture.width)),
                round(map(y, 0, height, 0, capture.height))
            ));
            var greyscale = round(red(c) * 0.222 + green(c) * 0.707 + blue(c) * 0.071);

            push();
            translate(x, y);

            // greyscale to fontsize
            var fontSize = map(greyscale, 0, 255, fontSizeMax, fontSizeMin);
            fontSize = max(fontSize, 1);
            textSize(fontSize);
            fill(c);


            var letter = inputText.charAt(counter);
            text(letter, 0, 0);
            var letterWidth = textWidth(letter) + kerning;
            // for the next letter ... x + letter width
            x += letterWidth;

            pop();

            // linebreaks
            if (x + letterWidth >= width+20) {
                x = 20;
                y += spacing;
            }

            counter++;
            if (counter >= inputText.length) {
                counter = 0;
            }
        }
    }
}

function keyPressed() {
    fullscreen(true);
    infoScreen = false;
    // change fontSizeMax with arrow keys up/down
    if (keyCode == UP_ARROW) fontSizeMax += 2;
    if (keyCode == DOWN_ARROW) fontSizeMax -= 2;
    // change fontSizeMin with arrow keys left/right
    if (keyCode == RIGHT_ARROW) fontSizeMin += 2;
    if (keyCode == LEFT_ARROW) fontSizeMin -= 2;
}

function mousePressed() {
    infoScreen = false;
    fullscreen(true);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}