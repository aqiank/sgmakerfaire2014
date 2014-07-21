function Scanner() {
	this.scanX 	      = 0;
	this.scanSpeed 	      = 200;
	this.pixelDiff 	      = 0.02;
	this.clusterSpread    = 50;
	this.minClusterPoints = 20;
	this.groups 	      = [];
	this.objects 	      = [];
	this.prevObjects      = [];
	this.debugDraw	      = false;
}

// main scanner routine
Scanner.prototype.run = function(dt) {
	context.clearRect(0, 0, canvas.width, canvas.height);

	if (videoContext != null) {
		videoContext.drawImage(video, 0, 0, videoCanvas.width, videoCanvas.height);
		var frame = videoContext.getImageData(0, 0, videoCanvas.width, videoCanvas.height);
		frame = this.visualize(frame);
		videoContext.putImageData(frame, 0, 0);
	}
	
	this.runScanline();

	this.groups.length = 0;
	this.objects.length = 0;
}

Scanner.prototype.visualize = function(frame) {
	var elements = document.querySelectorAll(".swatch");
	var scanner = this;
	Array.prototype.forEach.call(elements, function(el, i) {
		var soundColorStr = el.style.background;
		if (soundColorStr == "none")
			return;

		var soundColor = bgrValue(soundColorStr);
		scanner.gatherPoints(frame, soundColor, soundColorStr);
	});

	this.formClusters();

	if (this.debugDraw)
		this.drawObjects();

	return frame;
}

// cluster all the points that belong to specific color group
Scanner.prototype.formClusters = function() {
	for (var color in this.groups) {
		var group = this.groups[color];
		if (typeof group.points !== "undefined" && group.points.length > 0) {
			group.clusters = getClusters(group.points, this.clusterSpread, this.minClusterPoints);
			for (var i = 0; i < group.clusters.length; i++) {
				var cluster = group.clusters[i];
				var info = analyzePoints(cluster);
				var x = (info.minX + info.centroid.x) / videoCanvas.width * canvas.width;
				var y = (info.minY + info.centroid.y) / videoCanvas.height * canvas.height;
				var w = info.width / videoCanvas.width * canvas.width;
				var h = info.height / videoCanvas.height * canvas.height;
				this.prevObjects = this.objects.slice();
				this.objects.push({x: x, y: y, w: w, h: h, info: info, colorStr: group.colorStr});
			}
		}
	}
}

// gather all the points and assign them into their own groups
Scanner.prototype.gatherPoints = function(frame, color, colorStr) {
	var pixels = new Uint32Array(frame.data.buffer); // ABGR 32-bit format

	if (typeof this.groups[color] === "undefined")
		this.groups[color] = {points: [], color: color, colorStr: colorStr, clusters: []};

	for (var y = 0; y < videoCanvas.height; y++) {
		for (var x = 0; x < videoCanvas.width; x++) {
			var index = x + y * videoCanvas.width;
			if (this.colorMatches(pixels[index], color))
				this.groups[color].points.push(new Point(x, y));
		}
	}
}


Scanner.prototype.drawObjects = function() {
	for (var i = 0; i < this.objects.length; i++) {
		var obj = this.objects[i];
		context.save();
		context.fillStyle = obj.colorStr;
		context.translate(-obj.w / 2, -obj.h / 2);
		context.fillRect(obj.x, obj.y, obj.w, obj.h);
		context.restore();
	}
}

Scanner.prototype.runScanline = function() {
	this.scanObjects();
	this.drawScanline();
}

// look for objects and trigger sounds when found
Scanner.prototype.scanObjects = function() {
	for (var i = 0; i < this.objects.length; i++) {
		var obj = this.objects[i];
		if (obj.x < this.scanX && this.scanX < obj.x + obj.w) {
			createRippleAt(obj);
			this.playSound(obj);
		}
	}
}

Scanner.prototype.drawScanline = function() {
	context.save();
	context.strokeStyle = '#00aacc';
	context.beginPath();
	context.moveTo(this.scanX, 0);
	context.lineTo(this.scanX, canvas.height);
	context.stroke();

	this.scanX += this.scanSpeed * deltaTime;
	if (this.scanX >= canvas.width)
		this.scanX = 0;

	context.closePath();
	context.restore();
}

Scanner.prototype.colorMatches = function(pixel, color) {
	var aHsl = bgrToHsl((pixel >> 16) & 0xff, (pixel >> 8) & 0xff, pixel & 0xff);
	var bHsl = bgrToHsl((color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff);
	var diff = hslDiff(aHsl, bHsl);
	if (diff <= this.pixelDiff)
		return true;
	return false;
}

Scanner.prototype.playSound = function(obj) {
	var elements = document.querySelectorAll(".swatch");
	var scanner = this;
	Array.prototype.forEach.call(elements, function(el, i) {
		var soundColorStr = el.style.background;
		if (soundColorStr == "none")
			return;

		var sound = sounds[el.soundName];
		if (obj.colorStr == soundColorStr && !sound.isPlaying()) {
			var volume = obj.h * 0.002;
			var rate = 1 - obj.y / canvas.height;
			sound.play(volume, rate);
		}
	});
}
