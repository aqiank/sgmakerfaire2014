var audioContext = new (window.AudioContext || window.webkitAudioContext)();

var SOUND_DIR 	= "../sounds/";
var SOUND_COLLECTIONS = {
	"Collection 1 (Pleasant)": [
		"aurora(bells).mp3",
		"aurora(bells2).mp3",
		"aurora(chords).mp3",
		"drum(2beats).mp3",
		"drum(4beats).mp3",
		"piano(doe).mp3",
		"piano(mi).mp3",
		"piano(so).mp3",
		"shimmer(doemi).mp3",
		"tick(4beats).mp3",
	],

	"Collection 2 (Electronic)": [
		"blips.mp3",
		"cosmic.mp3",
		"dialogue.mp3",
		"droplets.mp3",
		"embers.mp3",
		"planets.mp3",
		"space.mp3",
		"star.mp3",
		"sunrise.mp3",
		"tick_tock.mp3",
	],

	"Collection 3 (Nature)": [
		"birds.mp3",
		"dogs.mp3",
		"drip.mp3",
		"flutter.mp3",
		"hyena.mp3",
		"insects.mp3",
		"monkey.mp3",
		"water.mp3",
		"wave.mp3",
		"weirdbird.mp3",
	],

	"Collection 4 (Comedy)": [
		"aww.mp3",
		"badumtss.mp3",
		"boing.mp3",
		"boingting.mp3",
		"claps.mp3",
		"comedy_beats.mp3",
		"falling.mp3",
		"partytoy.mp3",
		"trumpet.mp3",
		"yay.mp3",
	],

	"Collection 5 (Radio)": [
		"alien.mp3",
		"music.mp3",
		"blizt.mp3",
		"countdown.mp3",
		"dutdut.mp3",
		"hangup.mp3",
		"longblizt.mp3",
		"rhythmic.mp3",
		"horn.mp3",
		"speed.mp3",
	],

	"Collection 6 (Musical)": [
		"dubhorns.mp3",
		"electriclead.mp3",
		"electricpiano.mp3",
		"flute.mp3",
		"musical_beats.mp3",
		"musical_beats2.mp3",
		"organ.mp3",
		"piano.mp3",
		"sax.mp3",
		"trumpet.mp3",
	],

	"Collection 7 (Spongebob)": [
		"captain.mp3",
		"flute.mp3",
		"fun.mp3",
		"laugh.mp3",
		"melody.mp3",
		"meow.mp3",
		"ooo.mp3",
		"pizza.mp3",
		"spongybobsquarepants.mp3",
		"testing.mp3",
	],

	"Collection 8 (Adventuretime)": [
		"adventuretime.mp3",
		"come.mp3",
		"intro.mp3",
		"living.mp3",
		"lsp.mp3",
		"lumps.mp3",
		"ohmyglob.mp3",
		"punchyourbuns.mp3",
		"shakemyfanny.mp3",
		"tune.mp3",
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
