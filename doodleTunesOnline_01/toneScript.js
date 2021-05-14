
// set the transport
Tone.Transport.bpm.value = 120;
Tone.Transport.loop = true;
Tone.Transport.loopStart = "0m";
Tone.Transport.loopEnd = "2m";

const drum = new Tone.Player({
    url: "sounds/drum_0.wav",
    loop: true
}).toDestination().sync().start(0);

const bass = new Tone.Player({
    url: "sounds/bass_0.wav",
    loop: true
}).toDestination().sync().start(0);

const piano = new Tone.Player({
    url: "sounds/piano_0.wav",
    loop: true
}).toDestination().sync().start(0); 


const saxophone = new Tone.Player({
    url: "sounds/sax_0.wav",
    loop: true
}).toDestination().sync().start(0); 

// connect the UI with the components
// document.querySelector("tone-play-toggle").addEventListener("start", () => {Tone.Transport.start()});
// document.querySelector("tone-play-toggle").addEventListener("stop", () => {Tone.Transport.stop()});

//Sloppy test to change tracks - actually works
//document.querySelector("tone-play-toggle").addEventListener("stop", () => piano.load("sounds/piano_4.wav"));

// keep the playhead on track
// setInterval(() => {
//     const progress = Tone.Transport.progress;
//     document.querySelector("#progress").style = `left: ${progress * 100}%`; // scale it between 0-1
// }, 16);