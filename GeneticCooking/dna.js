// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Interactive Selection
// http://www.genarts.com/karl/papers/siggraph91.html

  //Constructor (makes a random DNA)
  function DNA(newgenes) {
    // DNA is random floating point values between 0 and 1 (!!)
    // The genetic sequence
    var len = 20;  // Arbitrary length
    if (newgenes) {
      this.genes = newgenes;
      //Add some minor variation
      for (var i = 0; i < this.genes.length; i++) {
        this.genes[i] += random(-0.1,0.1)/(population.getGenerations()+1); //More variation in early generations
        this.genes[i] = constrain(this.genes[i],0,1); //but keep values within boundaries
      }
        } else {
      this.genes = new Array(len);
      for (var i = 0; i < this.genes.length; i++) {
        this.genes[i] = random(0,1);
      }
    }

    this.printableGenes = this.genes;

  // Crossover
  // Creates new DNA sequence from two (this &
  this.crossover = function(partner) {
    var child = new Array(this.genes.length);
    var crossover = floor(random(this.genes.length));
    for (var i = 0; i < this.genes.length; i++) {
      if (i > crossover) child[i] = this.genes[i];
      else               child[i] = partner.genes[i];
    }
    var newgenes = new DNA(child);
    return newgenes;
  }

  // Based on a mutation probability, picks a new random character in array spots
  this.mutate = function(m) {
    for (var i = 0; i < this.genes.length; i++) {
      if (random(1) < m) {
         this.genes[i] = random(0,1);
      }
    }
  }
}
