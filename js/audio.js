var audioContext = new (window.AudioContext || window.webkitAudioContext)();

var SOUND_DIR 	= "../sounds/";
var SOUND_COLLECTIONS = {
	"Collection 1 (Pleasant)": [
		"aurora_bells.wav",
		"aurora_bells_2.wav", 
		"aurora_chords.wav", 
		"drum_2beats.wav", 
		"drum_4beats.wav", 
		"piano_doe.wav", 
		"piano_mi.wav", 
		"piano_so.wav", 
		"shimmer_doemi.wav", 
		"tick(4beats).wav", 
	],

	"Collection 2 (Electronic)": [
		"blips.wav", 
		"cosmic.wav", 
		"dialogue.wav", 
		"droplets.wav", 
		"embers.wav", 
		"planets.wav", 
		"space.wav", 
		"star.wav", 
		"sunrise.wav", 
		"tick_tock.wav", 
	],

	"Collection 3 (Nature)": [
		"birds.wav",
		"dogs.wav",
		"drip.wav",
		"flutter.wav",
		"hyena.wav",
		"insects.wav",
		"monkey.wav",
		"water.wav",
		"wave.wav",
		"weirdbird.wav",
	],

	"Collection 4 (Comedy)": [
		"aww.wav",
		"badumtss.wav",
		"boing.wav",
		"boingting.wav",
		"claps.wav",
		"comedy_beats.wav",
		"falling.wav",
		"partytoy.wav",
		"trumpet.wav",
		"yay.wav",
	],

	"Collection 5 (Radio)": [
		"alien_music.wav",
		"alien_ufo.wav",
		"blizt.wav",
		"countdown.wav",
		"dial_dutdut.wav",
		"hangup.wav",
		"longblizt.wav",
		"rhythmic_melody.wav",
		"siren_horn.wav",
		"speed.wav",
	],

	"Collection 6 (Musical)": [
		"dubhorns.wav",
		"electriclead.wav",
		"electricpiano.wav",
		"flute.wav",
		"musical_beats.wav",
		"musical_beats2.wav",
		"organ.wav",
		"piano.wav",
		"sax.wav",
		"trumpet.wav",
	],

	"Collection 7 (Spongebob)": [
		"captain.wav",
		"flute.wav",
		"fun.wav",
		"laugh.wav",
		"melody.wav",
		"meow.wav",
		"ooo.wav",
		"pizza.wav",
		"spongybobsquarepants.wav",
		"testing.wav",
	],

	"Collection 8 (Adventuretime)": [
		"adventuretime.wav",
		"come.wav",
		"intro.wav",
		"living.wav",
		"lsp.wav",
		"lumps.wav",
		"ohmyglob.wav",
		"punchyourbuns.wav",
		"shakemyfanny.wav",
		"tune.wav",
	],
};

var collections	    = [];
var sounds 	    = [];
var currentSound    = null;
var numSoundsLoaded = 0;
var numSounds 	    = 0;

var lowPassFreq = 1000;
var volumeMult = 1;

function initAudio() {
	initNumSounds();
	initSoundList();
}

function initNumSounds() {
	for (var collection in SOUND_COLLECTIONS)
		numSounds += SOUND_COLLECTIONS[collection].length;
}

function initSoundList() {
	for (var collection in SOUND_COLLECTIONS) {
		collections[collection] = [];

		var filenames = SOUND_COLLECTIONS[collection];
		for (var i = 0; i < filenames.length; i++) {
			var name = filenames[i];
			var sound = new Sound(SOUND_DIR + collection, name);
			collections[collection].push(sound);
			sounds[name] = sound;
		}
	}
}

function Sound(folder, name) {
	this.name     = name;
	this.buffer   = null;
	this.filter   = null;
	this.gain     = null;
	this.source   = null;
	this.playing  = false;

	this.load(folder + "/" + name);
}

Sound.prototype.load = function(url) {
	var sound = this;
	var request = new XMLHttpRequest();

	request.open("GET", url, true);
	request.responseType = "arraybuffer";
	request.onload = function() {
		audioContext.decodeAudioData(request.response, function(buf) {
			sound.buffer = buf;
			onSoundLoaded();
		}, function(err) { console.log(err) });
	}
	request.send();
}

Sound.prototype.play = function(volume, rate) {
	if (this.playing)
		return;

	volume = ((typeof volume == "undefined") ? 1 : volume) * volumeMult;
	this.gain = audioContext.createGain();
	this.gain.gain.value = Math.max(0.1, volume);
	this.gain.connect(audioContext.destination);

	this.filter = audioContext.createBiquadFilter();
	this.filter.frequency.value = (rate * rate) * lowPassFreq;
	this.filter.type = "lowpass";
	this.filter.connect(this.gain);

	this.source = audioContext.createBufferSource();
	this.source.buffer = this.buffer;
	this.source.connect(this.filter);

	this.source.container = this;
	this.source.onended = function() {
		this.container.playing = false;
	};

	this.source.start();
	this.playing = true;
}

Sound.prototype.isPlaying = function() {
	return this.playing;
}
