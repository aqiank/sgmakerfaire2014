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


	var button = document.getElementById("play-button");
	button.onclick = function(e) {
		if (currentSwatch == null)
			return;

		var name = currentSwatch.soundName;
		sounds[name].play();
		e.stopPropagation();
	};
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
	swatch.innerText = name;
	swatch.soundName = name;
	swatch.style.background = "none";
	swatch.onclick = function(e) {
		if (currentSwatch != null)
			currentSwatch.style.border = "1px solid #f3f3f3";
		this.style.border = "2px solid #ffff00";
		currentSwatch = this;

		var paletteButtons = document.getElementById("palette-buttons");
		paletteButtons.style.display = "block";

		e.stopPropagation();
	};

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

			var paletteButtons = document.getElementById("palette-buttons");
			paletteButtons.style.display = "none";
		}
	};
}

function toggleHeader() {
	var header = document.getElementById("header-container");

	headerHidden = !headerHidden;
	if (headerHidden) {
		forEachElement(".collection", function(el, i) {
			el.style.display = "none";
		});
		header.style.height = "0px";
	} else {
		header.style.height = "116px";
		forEachElement(".collection", function(el, i) {
			el.style.display = "inline-block";
		});
	}
}

function toggleControls() {
	var controls = document.getElementById("controls-container");

	controlsHidden = !controlsHidden;
	if (controlsHidden) {
		controls.style.height = "0px";
		controls.style.display = "none";
	} else {
		controls.style.height = "128px";
		controls.style.display = "block";
	}
}

function togglePalette() {
	var palette = document.getElementById("palette-container");

	paletteHidden = !paletteHidden;
	if (paletteHidden) {
		palette.style.height = "0px";
		palette.style.display = "none";
	} else {
		palette.style.height = "48px";
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
