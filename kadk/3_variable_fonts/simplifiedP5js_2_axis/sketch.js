
var myText; //Your text
var wghtValue = 0; //Variable for controlling the wght parameter of your font
var italValue = 0; //Variable for controlling the wght parameter of your font

function setup() { 
    myText = document.getElementById("text");
    
    createCanvas(400,400);
    
}

function draw() { 
    background(255,0,0);
    //The variable wghtValue controls the wght of your font.
    //Drag and drop it onto https://www.axis-praxis.org/ to see its boundaries
        
    wghtValue = round(map(mouseX, 0, width, 100, 700));
    italValue = round(map(mouseY, 0, width, 100, 700));
    
    var settings = "font-variation-settings: " + '"' + "wght" + '" ' + wghtValue + "," + '"' + "ital" + '" ' + italValue + ";";
    
    myText.setAttribute("style", settings);
    
    text("wghtValue: " + wghtValue +"   italValue: " + italValue, 10, 10);
}