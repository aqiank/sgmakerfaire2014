var video 	 = null;
var videoCanvas  = null;
var canvas 	 = null;
var context 	 = null;
var videoContext = null;

// Time
var previousTime = 0;
var deltaTime 	 = 0;

// Scanner
var scanner = new Scanner();

// Ripples
var ripples = [];

window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
			       window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia ||
			 navigator.webkitGetUserMedia || navigator.msGetUserMedia;

// main update routine
function tick(time) {
	deltaTime = (time - previousTime) * 0.001;
	previousTime = time;

	if (videoContext == null)
		videoContext = videoCanvas.getContext("2d");

	if (context == null)
		context = canvas.getContext("2d");

	scanner.run(deltaTime);
	runRipples();
	requestAnimationFrame(tick);
}

function runRipples() {
	for (var i = 0; i < ripples.length; i++) {
		if (ripples[i].isDead()) {
			ripples.splice(i, 1);
			i--;
			continue;
		}

		ripples[i].run();
	}
}

// helper routine to get color from videoCanvas at specific coordinate
function pickCanvasColor(x, y) {
	if (videoContext == null)
		return;

	x = Math.floor((x / canvas.width) * videoCanvas.width);
	y = Math.floor((y / canvas.height) * videoCanvas.height);
	var frame = videoContext.getImageData(0, 0, videoCanvas.width, videoCanvas.height);
	var index = Math.floor((x + y * videoCanvas.width) * 4);
	var r = frame.data[index + 0];
	var g = frame.data[index + 1];
	var b = frame.data[index + 2];
	return (r << 16) | (g << 8) | b;
}

function initVideo() {
	video 	    = document.getElementById("video");
	videoCanvas = document.getElementById("video-canvas");
	canvas 	    = document.getElementById("canvas");

	canvas.width  = document.body.clientWidth;
	canvas.height = window.innerHeight;
	//canvas.height = document.body.clientHeight;

	videoCanvas.style.width  = canvas.width + "px";
	videoCanvas.style.height = canvas.height + "px";
	canvas.onclick = function(e) {
		var x = e.layerX;
		var y = e.layerY;
		var color = pickCanvasColor(x, y);
		if (currentSwatch != null) {
			currentSwatch.style.background = rgbToHex(color);
			e.stopPropagation();
		}
	};

	navigator.getUserMedia(
		{
			video: { 
				mandatory: { 
					minWidth: videoCanvas.width,
					minHeight: videoCanvas.height,
					maxFrameRate: 30,
				}
			},

			audio: false
		}, 

		function(stream) {
			if (navigator.mozGetUserMedia) {
				video.mozSrcObject = stream;
			} else {
				var vendorURL = window.URL || window.webkitURL;
				video.src     = window.URL.createObjectURL(stream);
			}
			video.play();
			tick(0);
		},
		
		function(err) {
			console.log("An error occured! " + err);
		}
	);
}

function Ripple(x, y, colorStr) {
	this.x = x;
	this.y = y;
	this.color = colorStr;
	this.radius = 1;
	this.radiusSpeed = 100;
	this.opacity = 1;
	this.opacitySpeed = -1;
	this.lifespan = 1; // seconds
}

Ripple.prototype.run = function() {
	if (this.lifespan <= 0)
		return;

	context.save();

	var gradient = context.createRadialGradient(0, 0, 0, 1, 1, this.radius) 
	gradient.addColorStop(0, "rgba(0,0,0,0)");
	gradient.addColorStop(1, this.color);
	context.strokeStyle = gradient;
	context.fillStyle = gradient;
	context.globalAlpha = this.opacity;
	context.globalCompositeOperation = "lighter";

	context.beginPath();
	context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
	context.closePath();
	context.fill();

	this.radius += this.radiusSpeed * deltaTime;
	this.opacity += this.opacitySpeed * deltaTime;
	this.lifespan -= deltaTime;

	context.restore();
}

Ripple.prototype.isDead = function() {
	return this.lifespan <= 0;
}

function createRippleAt(obj) {
	ripples.push(new Ripple(obj.x, obj.y, obj.colorStr));
}
