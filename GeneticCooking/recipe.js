// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Interactive Selection
// http://www.genarts.com/karl/papers/siggraph91.html

// The class for our "recipe", contains DNA sequence, fitness value, position on screen

  // Create a new recipe
  function Recipe(dna_, x_, y_) {
    this.rolloverOn = false; // Are we rolling over this recipe?
    this.dna = dna_; // recipe's DNA
    this.x = x_;     // Position on screen
    this.y = y_;
    this.wh = rectSize;      // Size of square enclosing the recipe
    this.fitness = 1; // How good is this recipe?
    // Using java.awt.Rectangle (see: http://java.sun.com/j2se/1.4.2/docs/api/java/awt/Rectangle.html)
    this.r = new Rectangle(this.x-this.wh/2, this.y-this.wh/2, this.wh, this.wh);

  // Display the recipe
  this.display = function() {
    // Now, since every gene is a floating point between 0 and 1, we map the values
    var genes = this.dna.genes;

    var salt         = map (genes[0],0,1,0,10);
    var flour        = map (genes[1],0,1,0,500);
    var yest         = map (genes[2],0,1,0,5);
    var oil          = map (genes[3],0,1,0,70);
    var tomatos       = map (genes[4],0,1,0,5);
    var heat         = map (genes[5],0,1,60,200);
    var cookingTime  = map (genes[6],0,1,10,60);

    push();
    translate(this.x, this.y);
    noStroke();
    textAlign(LEFT);
    fill(0);
    textSize(12);
    text("salt: " + round(salt) + "g", -50, -75);
    text("flour: " + round(flour) + "g", -50, -50);
    text("yest: " + round(yest) + "g", -50, -25);
    text("oil: " + round(oil) + "ml", -50, 0);
    text("tomatos: " + round(tomatos), -50, 25);
    textSize(9);
    text("cook at " + round(heat) + " degrees for " + round(cookingTime) + " min", -50, 50);

    // Draw the bounding box
    stroke(0.25);
    if (this.rolloverOn) fill(0, 0.25);
    else noFill();
    rectMode(CENTER);
    rect(0, 0, this.wh, this.wh);
    pop();

    // Display fitness value
    textAlign(CENTER);
    if (this.rolloverOn) fill(0);
    else fill(0.25);
    text("Votes: " + floor(this.fitness), this.x, this.y+75);
  }

  this.getFitness = function() {
    return this.fitness;
  }

  this.getDNA = function() {
    return this.dna;
  }

  this.getPrintableDNA = function(nGeneration, nRecipe) {

    //Sloppy as fuck!
    var genes = this.dna.genes;

    var salt         = map (genes[0],0,1,0,10);
    var flour        = map (genes[1],0,1,0,500);
    var yest         = map (genes[2],0,1,0,5);
    var oil          = map (genes[3],0,1,0,70);
    var tomatos       = map (genes[4],0,1,0,5);
    var heat         = map (genes[5],0,1,60,200);
    var cookingTime  = map (genes[6],0,1,10,60);

    var string = "Gen " + nGeneration + "." + nRecipe + ":     salt: " + round(salt) + "g - " +  "flour: " + round(flour) + "g - " +  "yest: " + round(yest) + "g - " + "oil: " + round(oil) + "ml - " +  "tomatos: " + round(tomatos) + " - cook at " + round(heat) + " degrees for " + round(cookingTime) + " min";
    return string;
  }

  // Increment fitness if mouse is pressed while rolling over recipe
  this.rollover = function(mx, my) {
    if (this.r.contains(mx, my)) {
      this.rolloverOn = true;
      this.fitness += 0.25;
    } else {
      this.rolloverOn = false;
    }
  }
}
