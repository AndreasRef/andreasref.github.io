var bg, leftAd, rightAd, topAd, bLeftAd, bRightAd;

var lerpVar = 0;

var margin = 50;
var banners = [];

var nBanners = 5;
var instruments = [];

function preload() {
  bg = loadImage('data/bg.jpg')
  leftAd = loadImage('data/leftAd.jpg')
  rightAd = loadImage('data/rightAd.jpg')
  topAd = loadImage('data/topAd.jpg')
  bLeftAd = loadImage('data/bLeftAd.png');
  bRightAd = loadImage('data/bRightAd.png');
}

function setup() {
  createCanvas(1350, 1045)
  noStroke();

  //Kick
  instruments[0] = EDrums('xxxx')
  instruments[0].amp = .75
  kickFollow = Follow( instruments[0] )

  //Deep bass
  instruments[1] = FM('bass')
  .note.seq( [0,0,0,0].rnd(), [1/8,1/16].rnd(1/16,2) )
  bassFollow = Follow (instruments[1])

  //Melody
  instruments[2] = FM('bass')
  .note.seq( [7,14,13].rnd(), [1/2,1/16].rnd(1/16,2) )
  melodyFollow = Follow (instruments[2])

  //Hihat
  instruments[3] = EDrums('.* * * -')
  instruments[3].amp = .75
  hihatFollow = Follow( instruments[3] )

  //Snare
  instruments[4] = EDrums('..o...o.', 1/8)
  instruments[4].amp = .75
  snareFollow = Follow( instruments[4] )


  //Rhodes
  instruments[5]  = Synth( 'rhodes', {amp:.35} )
  .chord.seq( Rndi(0,6,3), 1 )
  .fx.add( Delay() )


  for (var i = 0; i<instruments.length; i++) {
    instruments[i].on = true;
    if (random()>0.8){
      instruments[i].amp = 0.0;
      instruments[i].on = false;
    }
    console.log(instruments[i].on);
  }



  //GIBBER
  // kick = EDrums('xxxx')
  // kick.amp = .75
  // kickFollow = Follow( kick )
  //
  // hihat = EDrums('.* * * -')
  // hihat.amp = .75
  // hihatFollow = Follow( hihat )
  //
  // snare = EDrums('..o...o.', 1/8)
  // snare.amp = .75
  // snareFollow = Follow( snare )
  //
  // bass = FM('bass')
  // .note.seq( [0,0,0,0].rnd(), [1/8,1/16].rnd(1/16,2) )
  // bassFollow = Follow (bass)
  //
  // melody = FM('bass')
  // .note.seq( [7,14,13].rnd(), [1/2,1/16].rnd(1/16,2) )
  // melodyFollow = Follow (melody)
  //
  // rhodes = Synth( 'rhodes', {amp:.35} )
  // .chord.seq( Rndi(0,6,3), 1 )
  // .fx.add( Delay() )

  Gibber.scale.root.seq( ['c4','ab3','bb3'], [4,2,2] )
  Gibber.scale.mode.seq( ['Minor','Mixolydian'], [6,2] )

  //Banner objects
  banners[0] = new Banner(topAd, 276, 155, kickFollow, 1, 1, instruments[0].on, 0); //Top banner
  banners[1] = new Banner(leftAd, 150, 295, bassFollow, 3, 1, instruments[1].on, 0); //Upper left banner
  banners[2] = new Banner(rightAd, 935, 295, melodyFollow, 5, 1, instruments[2].on, 0); //Upper right banner
  banners[3] = new Banner(bLeftAd, 50, 295 + leftAd.height + margin, hihatFollow, 15, 2, instruments[3].on, 100); //Lower left banner
  banners[4] = new Banner(bRightAd, 935, 295 + rightAd.height + margin, snareFollow, 2, 2, instruments[4].on, 100); //Lower right banner
}

function draw() {
  image(bg,0,0);

  for (var i = 0; i<banners.length; i++) {
    banners[i].update();
    if (instruments[i].on) banners[i].display();
  }

}


function Banner(ad, x, y, musicSync, followAmp, animationType, playing, r) { //Banner class
  this.x = x;
  this.y = y;
  this.w = ad.width;
  this.h = ad.height;
  this.follow = musicSync;
  this.followAmp = followAmp;
  this.vol;
  this.animationType = animationType;
  this.agreegatedMove = 0;
  this.playing = playing;

  this.randomPoints = r;
  this.randomX = [this.randomPoints];
  this.randomY = [this.randomPoints];

  for (var i = 0; i<this.randomPoints; i++) {
    this.randomX[i] = random(this.x, this.x + this.w);
    this.randomY[i] = random(this.y, this.y + this.h);
  }

  this.update = function() {
    this.vol = this.follow.getValue()*this.followAmp;
    this.agreegatedMove += this.follow.getValue()*followAmp;

    var mult = 10;
    for (var i = 0; i<this.randomPoints; i++) {
      this.randomX[i] += random(-this.vol*mult, this.vol*mult);
      this.randomY[i] += random( -this.vol*mult , this.vol*mult);

      this.randomX[i] = noise(this.agreegatedMove/5+i+frameCount/500)*this.w+this.x;
      this.randomY[i] = noise(this.agreegatedMove/5+i*2+frameCount/500)*this.h+this.y;

      // this.randomX[i] = constrain(this.randomX[i], this.x+0, this.x+this.w-0);
      // this.randomY[i] = constrain(this.randomY[i], this.y+0, this.y+this.h-0);

    }

  }

  this.display = function () {

    if (this.playing) {
      image(ad, this.x, this.y)
      fill(255, 255 - this.vol*255.0);
      //fill(255,0,255, this.vol*255.0 + 200);
      rect(this.x, this.y, this.w, this.h);
    }
    fill(0);

    switch (this.animationType) {
      case 0:
      // image(ad, this.x, this.y)
      // //fill(255, 255 - this.vol*255.0);
      // fill(255, this.vol*255.0 + 200);
      // rect(this.x, this.y, this.w, this.h);

      break;
      case 1:
      //fill(0);


      var s = millis()/500;
      var maxSize = 25;

      if (this.w > this.h) {
        for (var x = maxSize; x<this.w-maxSize; x+=this.w/maxSize) {
          ellipse(this.x + x, this.y + this.h/2 + sin( x + s)*(this.h/2-maxSize),this.vol*maxSize*2+5);
          ellipse(this.x + x, this.y + this.h/2 + sin( x + s)*-(this.h/2-maxSize),this.vol*maxSize*2+5);
        }
      } else {
        for (var y = maxSize; y<this.h-maxSize; y+=this.h/(maxSize*3)) {
          if (this.w > 200) {
            ellipse( -2.5*maxSize + this.x + this.w/2 + sin( y + s/2 + this.agreegatedMove*0.8)*(this.w/4-maxSize), this.y + y,this.vol*20+1);
            ellipse( this.x + this.w/2 + sin( y + s/2 + this.agreegatedMove*0.8)*(this.w/4-maxSize), this.y + y,this.vol*20+1);
            ellipse( 2.5*maxSize + this.x + this.w/2 + sin( y + s/2 + this.agreegatedMove*0.8)*(this.w/4-maxSize), this.y + y,this.vol*20+1);
          } else {
            ellipse(this.x + this.w/2 + sin( y + s/2 + this.agreegatedMove*0.8)*(this.w/2-maxSize), this.y + y,this.vol*20+1);
          }
        }
      }
      break;
      case 2:
        lerpVar = lerp(lerpVar, this.vol, 0.2);
        stroke(0);
        strokeWeight(lerpVar*25)
        for (var i = 0; i<this.randomPoints; i++)
        point(this.randomX[i], this.randomY[i]);
        noStroke();
      break;
      case 3:
        // fill(0,255,255, this.vol*this.vol*1055.0);
        // rect(this.x, this.y, this.w, this.h);
      break;
    }
  }
};
