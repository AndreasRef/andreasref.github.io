class drawing {
  constructor(category, nodes, skins) {
    this.category = category;
    this.nodes = nodes;
    this.skins = skins;
    this.scaling = 1.0;
    this.wiggleFactor = 0.5;
    this.x = Math.random()*master_canvas.width-canvas.width;
    this.y = Math.random()*master_canvas.height-canvas.height;

    if (this.category === "plant") {
      this.x = getRandomArbitrary(0.27*master_canvas.width, master_canvas.width-canvas.width);
      this.y = getRandomArbitrary(0.25*master_canvas.height, 0.8*master_canvas.height-canvas.height);
      this.wiggleFactor = 0.02;
    } else if(this.category === "fish") {
      this.scaling = 0.3;
      this.wiggleFactor = 0.5;
    } else if(this.category === "ship") {
      this.scaling = 0.5;
      this.wiggleFactor = 0.2;
    }else if (this.category === "vehicle") {
      this.wiggleFactor = 0.2;
    } else if (this.category === "bird") {
      this.wiggleFactor = 0.5;
      this.scaling = 0.5;
    }
     else if (this.category === "architecture" || this.category === "container" || this.category === "food"  || this.category === "fruit"  || this.category === "furniture"  
     || this.category === "garment" || this.category === "instrument"  || this.category === "technology"  || this.category === "tool" ) { //All the drawings we are not sure what are
      this.x = Math.random()*master_canvas.width*0.25;
      this.y = getRandomArbitrary(0.6*master_canvas.height, 0.8*master_canvas.height);
      this.wiggleFactor = 0.2;
      this.scaling = 0.3;
    }    
    this.noiseX = Math.random()*1000;
    this.noiseY = Math.random()*1000;
    }

  animate() {
    for (var i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i].parent) {
        var r = Math.min(Math.max(parseFloat(atob(this.nodes[i].id)), 0.3), 0.7);
        this.nodes[i].th = this.nodes[i].th0 + Math.sin((new Date()).getTime() * 0.003 / r + r * Math.PI * 2) * r * this.wiggleFactor;
      } else {
        this.nodes[i].th = this.nodes[i].th0
      }
    }
    doodleMeta.forwardKinematicsNodes(this.nodes);
    doodleMeta.calculateSkin(this.skins);
  }

  //let xTrans = generator.getVal(noiseX)*100;
  //console.log(xTrans);
  //noiseX+=0.01;
  //let xTrans = Math.sin((new Date()).getTime()*0.003)*150;
  //master_context.translate(xTrans,0);


  show() {
    master_context.save();
    master_context.scale(this.scaling, this.scaling);
    if (this.category === "bird") {
      let xTrans = generator.getVal(this.noiseX)*(master_canvas.width)*(1/this.scaling)-WIDTH/3*(1/this.scaling);
      let yTrans = generator.getVal(this.noiseY)*master_canvas.height * 0.25-WIDTH*0.25; //sloppy
      this.noiseX+=0.003;
      this.noiseY+=0.007;
      master_context.translate(xTrans,yTrans);
    } else if (this.category === "fish") {
      let xTrans = generator.getVal(this.noiseX)*master_canvas.width*0.22*(1/this.scaling); //sloppy
      let yTrans = generator.getVal(this.noiseY)*master_canvas.height * 0.25*(1/this.scaling)+0.25*master_canvas.height*(1/this.scaling); //sloppy
      this.noiseX+=0.001;
      this.noiseY+=0.004;
      master_context.translate(xTrans,yTrans);
    } else if (this.category === "ship") {
      let xTrans = generator.getVal(this.noiseX)*master_canvas.width*0.21*(1/this.scaling); //sloppy
      let yTrans = generator.getVal(this.noiseY)*master_canvas.height * 0.25*(1/this.scaling)+0.15*master_canvas.height*(1/this.scaling); //sloppy
      this.noiseX+=0.001;
      this.noiseY+=0.004;
      master_context.translate(xTrans,yTrans);
    }else if (this.category === "humanoid" || this.category === "insect" || this.category === "quadruped") {
      let xTrans = generator.getVal(this.noiseX)*(master_canvas.width-WIDTH*2)+master_canvas.width*0.2; //sloppy
      let yTrans = generator.getVal(this.noiseY)*master_canvas.height * 0.5 + master_canvas.height*0.1;
      this.noiseX+=0.001;
      this.noiseY+=0.002;
      master_context.translate(xTrans,yTrans);
    } else if (this.category === "plant") {
      //let xTrans = getRandomArbitrary(0.27*master_canvas.width, master_canvas.width-canvas.width);
      //let yTrans = getRandomArbitrary(0.25*master_canvas.height, 0.8*master_canvas.height-canvas.height);

      //this.noiseX+=0.01
      //this.noiseY+=0.001
      master_context.translate(this.x,this.y);
    } else if (this.category === "vehicle") {
      this.x+=generator.getVal(this.noiseX)*3 + 1;
      this.noiseX+=0.01;
      if (this.x > master_canvas.width) this.x = -WIDTH;
      let yTrans = generator.getVal(this.noiseY+ this.y)*(master_canvas.height-WIDTH) * 0.2+0.85*(master_canvas.height-WIDTH);
      //this.noiseY+=0.01
      //this.noiseY+=0.01
      master_context.translate(this.x,yTrans);
    } 
    // THIS IS NOT WORKING PROPERLY...
    else if (this.category === "architecture" || this.category === "container" || this.category === "food"  || this.category === "fruit"  || this.category === "furniture"  
    || this.category === "garment" || this.category === "instrument"  || this.category === "technology"  || this.category === "tool" ) {
      //this.x = this.x * 1/this.scaling;
      //this.y = this.y * 1/this.scaling;
      master_context.translate(this.x* 1/this.scaling,this.y* 1/this.scaling);
    }

    for (var i = 0; i < this.skins.length; i++) {
      if (!this.skins[i].connect) {
        if (i != 0) {
          master_context.stroke();
        }
        master_context.beginPath();
        master_context.moveTo(this.skins[i].x, this.skins[i].y);
      } else {
        master_context.lineTo(this.skins[i].x, this.skins[i].y);
      }
    }
    master_context.stroke();
    master_context.restore();
  }
} 