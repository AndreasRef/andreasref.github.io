var audioObject;
var MicrophoneInput = function MicrophoneInput(bufferSize) {
	if (window.hasOwnProperty('webkitAudioContext') && !window.hasOwnProperty('AudioContext')) {
		window.AudioContext = webkitAudioContext;
	}

	if (navigator.hasOwnProperty('webkitGetUserMedia') && !navigator.hasOwnProperty('getUserMedia')) {
		navigator.getUserMedia = webkitGetUserMedia;
		if (!AudioContext.prototype.hasOwnProperty('createScriptProcessor')) {
			AudioContext.prototype.createScriptProcessor = AudioContext.prototype.createJavaScriptNode;
		}
	}

	this.context = new AudioContext();

	this.synthesizer = {};
	this.synthesizer.out = this.context.createGain();

	this.meyda = Meyda.createMeydaAnalyzer({
		audioContext: this.context,
		source: this.synthesizer.out,
		bufferSize: bufferSize,
		featureExtractors: ['mfcc', 'loudness'],
		callback: soundDataCallback
	});
	audioObject = this;
	this.initializeMicrophoneSampling();
};

MicrophoneInput.prototype.initializeMicrophoneSampling = function() {
	var errorCallback = function errorCallback(err) {
        // We should fallback to an audio file here, but that's difficult on mobile
        var elvis = document.getElementById('elvisSong');
        var stream = audioObject.context.createMediaElementSource(elvis);
        stream.connect(audioObject.context.destination);
        audioObject.meyda.setSource(stream);
    };

    try {
    	navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.getUserMedia;
    	var constraints = { video: false, audio: true };
    	var successCallback = function successCallback(mediaStream) {
    		window.mediaStream = mediaStream;
            // document.getElementById('elvisSong').style.display = 'none';
            console.group("Meyda")
            console.log('User allowed microphone access.');
            console.log('Initializing AudioNode from MediaStream');
            var source = audioObject.context.createMediaStreamSource(window.mediaStream);
            console.log('Setting Meyda Source to Microphone');
            audioObject.meyda.setSource(source);
            audioObject.meyda.start()

            console.groupEnd();
        };

        try {
        	console.log('Asking for permission...');
        	navigator.getUserMedia(constraints, successCallback, errorCallback);
        } catch (e) {
        	var p = navigator.mediaDevices.getUserMedia(constraints);
        	p.then(successCallback);
        	p.catch(errorCallback);
        }
    } catch (e) {
    	errorCallback();
    }
};

MicrophoneInput.prototype.get = function(features) {
	return audioObject.meyda.get(features);
};
