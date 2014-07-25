var BACKSPACE = 8;
var DELETE    = 46;
var TILDE     = 192;

var palette 	  = null;
var currentSwatch = null;
var currentColor  = "#00ff00";

var headerHidden   = true;
var controlsHidden = false;
var paletteHidden  = false;

function initGui() {
	initLoadScreen();
	initHeader();
	initSoundPalette();
	initCollectionButtons();
	initControls();
	initGlobalEvents();
}

function initLoadScreen() {
	var loadScreen = document.getElementById("load-screen");
	loadScreen.style.opacity = "1";
}

function initHeader() {
	var toggle = document.getElementById("header-toggle");
	toggle.onclick = toggleHeader;
	toggleHeader();
}

function initSoundPalette() {
	palette = document.getElementById("palette-container");

	var toggle = document.getElementById("palette-toggle");
	toggle.onclick = togglePalette;
	togglePalette();
}

function initCollectionButtons() {
	forEachElement(".collection", function(el, i) {
		el.onclick = function() {
			setCurrentCollection(i);
		};
	});
}

function setCurrentCollection(idx) {
	empty(palette);

	var i = 0;
	for (var key in collections) {
		if (i == idx) {
			var collection = collections[key];
			for (var i = 0; i < collection.length; i++)
				addSwatch(collection[i].name);

			if (paletteHidden)
				togglePalette();
			break;
		}

		i++;
	}
}

function addSwatch(name) {
	var swatch = document.createElement("div");
	swatch.className = "swatch";
	swatch.soundName = name;
	swatch.style.background = "none";
	swatch.onclick = function(e) {
		if (currentSwatch != null)
			currentSwatch.style.border = "1px solid #f3f3f3";
		this.style.border = "2px solid #ffff00";
		currentSwatch = this;

		e.stopPropagation();
	};

	var p = document.createElement("p");
	p.innerText = formatSoundName(name);
	p.className = "swatch-label";

	var resetButton = document.createElement("img");
	resetButton.src = "../images/reset.png";
	resetButton.className = "swatch-button";
	resetButton.onclick = function(e) {
		this.parentNode.style.background = "none";
		e.stopPropagation();
	};

	var playButton = document.createElement("img");
	playButton.src = "../images/play.png";
	playButton.className = "swatch-button";
	playButton.onclick = function(e) {
		sounds[this.parentNode.soundName].play();
	};

	swatch.appendChild(p);
	swatch.appendChild(resetButton);
	swatch.appendChild(playButton);
	palette.appendChild(swatch);
}

function initControls() {
	var toggle = document.getElementById("controls-toggle");
	toggle.onclick = toggleControls;
	toggleControls();

	var range = document.getElementById("scan-speed");
	var display = document.getElementById("scan-speed-value");
	range.value = scanner.scanSpeed;
	display.innerHTML = scanner.scanSpeed;
	range.oninput = function(e) {
		display = document.getElementById("scan-speed-value");
		scanner.scanSpeed = this.value;
		display.innerHTML = this.value;
	};
	
	range = document.getElementById("pixel-diff");
	range.value = scanner.pixelDiff * 100;
	display = document.getElementById("pixel-diff-value");
	display.innerHTML = scanner.pixelDiff;
	range.oninput = function(e) {
		display = document.getElementById("pixel-diff-value");
		scanner.pixelDiff = this.value * 0.01;
		display.innerHTML = scanner.pixelDiff;
	};
	
	range = document.getElementById("cluster-spread");
	range.value = scanner.clusterSpread;
	display = document.getElementById("cluster-spread-value");
	display.innerHTML = scanner.clusterSpread;
	range.oninput = function(e) {
		display = document.getElementById("cluster-spread-value");
		scanner.clusterSpread = this.value;
		display.innerHTML = scanner.clusterSpread;
	};

	range = document.getElementById("min-cluster-points");
	range.value = scanner.minClusterPoints;
	display = document.getElementById("min-cluster-points-value");
	display.innerHTML = scanner.minClusterPoints;
	range.oninput = function(e) {
		display = document.getElementById("min-cluster-points-value");
		scanner.minClusterPoints = this.value;
		display.innerHTML = scanner.minClusterPoints;
	};

	range = document.getElementById("low-pass-frequency");
	range.value = lowPassFreq;
	display = document.getElementById("low-pass-frequency-value");
	display.innerHTML = lowPassFreq;
	range.oninput = function(e) {
		display = document.getElementById("low-pass-frequency-value");
		lowPassFreq = this.value;
		display.innerHTML = lowPassFreq;
	};

	range = document.getElementById("volume-multiplier");
	range.value = volumeMult * 100;
	display = document.getElementById("volume-multiplier-value");
	display.innerHTML = volumeMult;
	range.oninput = function(e) {
		display = document.getElementById("volume-multiplier-value");
		volumeMult = this.value * 0.01;
		display.innerHTML = volumeMult;
	};

	var checkbox = document.getElementById("debug-draw");
	checkbox.checked = scanner.debugDraw;
	checkbox.onchange = function(e) {
		scanner.debugDraw = this.checked;
	};
}

function initGlobalEvents() {
	window.onkeydown = function(e) {
		switch (e.keyCode) {
		case BACKSPACE:
		case DELETE:
			currentSwatch.focus();
			if (currentSwatch != null)
				currentSwatch.style.background = "none";
			e.preventDefault();
			break;

		case TILDE:
			headerShown = !headerShown;
			if (headerShown)
				header.style.display = "block";
			else
				header.style.display = "none";
			break;

		default:
			//console.log(e.keyCode);
			break;
		}
	};

	window.onclick = function(e) {
		if (currentSwatch != null) {
			currentSwatch.style.border = "1px solid #f3f3f3";
			currentSwatch = null;
		}
	};
}

function toggleHeader() {
	var header = document.getElementById("header-container");

	headerHidden = !headerHidden;
	if (headerHidden) {
		header.style.height = "0";
		forEachElement(".collection", function(el, i) {
			el.style.display = "none";
		});
	} else {
		header.style.height = "auto";
		forEachElement(".collection", function(el, i) {
			el.style.display = "inline-block";
		});
	}
}

function toggleControls() {
	var controls = document.getElementById("controls-container");

	controlsHidden = !controlsHidden;
	if (controlsHidden) {
		controls.style.height = "0";
		controls.style.display = "none";
	} else {
		controls.style.height = "auto";
		controls.style.display = "block";
	}
}

function togglePalette() {
	var palette = document.getElementById("palette-container");

	paletteHidden = !paletteHidden;
	if (paletteHidden) {
		palette.style.height = "0";
		palette.style.display = "none";
	} else {
		palette.style.height = "auto";
		palette.style.display = "block";
	}
}

function onSoundLoaded() {
	var loadProgress = document.getElementById("load-progress");
	loadProgress.innerText = (++numSoundsLoaded / numSounds * 100).toFixed(0) + "%";
	if (numSoundsLoaded == numSounds) {
		var loadScreen = document.getElementById("load-screen");
		loadScreen.style.opacity = "0";
		loadScreen.style.display = "none";
	}
}

function formatSoundName(name) {
	name = name.replace(".wav", "");
	name = name.replace(/_/g, " ");
	name = name.replace(/[a-z]/g, function(match) { return match.toUpperCase(); });
	return name;
}
