
// set the transport
Tone.Transport.bpm.value = 120;
Tone.Transport.loop = true;
Tone.Transport.loopStart = "0m";
Tone.Transport.loopEnd = "2m";

const drum = new Tone.Player({
    url: "sounds/drum_0.mp3",
    loop: true
}).toDestination().sync().start(0);

const bass = new Tone.Player({
    url: "sounds/bass_0.mp3",
    loop: true
}).toDestination().sync().start(0);

const piano = new Tone.Player({
    url: "sounds/piano_0.mp3",
    loop: true
}).toDestination().sync().start(0); 


const saxophone = new Tone.Player({
    url: "sounds/saxophone_0.mp3",
    loop: true
}).toDestination().sync().start(0); 

const bicycle = new Tone.Player({
    url: "sounds/bicycle_0.mp3",
    loop: true
}).toDestination().sync().start(0);



class instrument {
    constructor(name, filename) {
      this.name = name;
      this.filename = filename;
      this.count = 0;


       this.myPlayer = new Tone.Player({
        url: "sounds/"+this.filename+"_0.mp3",
        loop: true
    }).toDestination().sync().start(0);
    }

    increaseCount() {
        this.count++;
        if (this.count > 4) {
            this.count = 4;
        }
    }

    loadTrack() {
        //console.log("hey " + this.name + " " + this.count)
        this.myPlayer.load("sounds/"+this.filename+"_"+this.count +".mp3")
        Tone.Transport.start()
    }
}


// connect the UI with the components
// document.querySelector("tone-play-toggle").addEventListener("start", () => {Tone.Transport.start()});
// document.querySelector("tone-play-toggle").addEventListener("stop", () => {Tone.Transport.stop()});

//Sloppy test to change tracks - actually works
//document.querySelector("tone-play-toggle").addEventListener("stop", () => piano.load("sounds/piano_4.mp3"));

// keep the playhead on track
// setInterval(() => {
//     const progress = Tone.Transport.progress;
//     document.querySelector("#progress").style = `left: ${progress * 100}%`; // scale it between 0-1
// }, 16);