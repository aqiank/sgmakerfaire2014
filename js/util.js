function bgrDiff(A, B) {
	var aR = (A & 0xff);
	var aG = (A >> 8) & 0xff;
	var aB = (A >> 16) & 0xff;
	var bR = (B & 0xff);
	var bG = (B >> 8) & 0xff;
	var bB = (B >> 16) & 0xff;
	return (Math.abs(aR - bR) + Math.abs(aG - bG) + Math.abs(aB - bB)) / 765;
}

function bgrToRGB(color) {
	var r = (color << 16) & 0xff;
	var g = (color >> 0) & 0xff00;
	var b = (color >> 16) & 0xff0000;
	return r | g | b;
}

function rgbToBGR(color) {
	var r = (color >> 16) & 0xff;
	var g = (color >> 0) & 0xff00;
	var b = (color << 16) & 0xff0000;
	return b | g | r;
}

function rgbToHex(color) {
	color &= 0xFFFFFF;
	var colorStr = color.toString(16);
	return "#000000".substr(0, 7 - colorStr.length) + colorStr;
}

function rgbValue(color) {
	var m 	  = color.match(/(\d+)*(\d+)*(\d+)/g);
	var red   = parseInt(m[0]) & 0xff;
	var green = parseInt(m[1]) & 0xff;
	var blue  = parseInt(m[2]) & 0xff;
	return (red << 16)   |
	       (green << 8) |
	       (blue << 0);
}

function bgrValue(color) {
	var m 	  = color.match(/(\d+)*(\d+)*(\d+)/g); // regex to get values from e.g. 'rgb(255, 0, 0)'
	var red   = parseInt(m[0]) & 0xff;
	var green = parseInt(m[1]) & 0xff;
	var blue  = parseInt(m[2]) & 0xff;
	return (blue << 16) |
	       (green << 8) |
	       (red << 0);
}

function rgbToHsv(r, g, b) {
	r /= 255;
	g /= 255;
	b /= 255;

	var max = Math.max(r, g, b);
	var min = Math.min(r, g, b);
	var h, s, v = max;

	var d = max - min;
	s = max === 0 ? 0 : d / max;

	if (max == min) {
		h = 0; // achromatic
	} else {
		switch (max) {
			case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			case g: h = (b - r) / d + 2; break;
			case b: h = (r - g) / d + 4; break;
		}
		h /= 6;
	}
	return { h: h, s: s, v: v };
}

function bgrToHsv(b, g, r) {
	b /= 255;
	g /= 255;
	r /= 255;

	var max = Math.max(r, g, b);
	var min = Math.min(r, g, b);
	var h, s, v = max;

	var d = max - min;
	s = max === 0 ? 0 : d / max;

	if (max == min) {
		h = 0; // achromatic
	} else {
		switch (max) {
			case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			case g: h = (b - r) / d + 2; break;
			case b: h = (r - g) / d + 4; break;
		}
		h /= 6;
	}
	return { h: h, s: s, v: v };
}

function bgrToHsl(b, g, r) {
	b /= 255;
	g /= 255;
	r /= 255;

	var max = Math.max(r, g, b);
	var min = Math.min(r, g, b);
	var h, s, l = (max + min) / 2;

	if (max == min) {
		h = s = 0; // achromatic
	} else {
		var d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			case g: h = (b - r) / d + 2; break;
			case b: h = (r - g) / d + 4; break;
		}
		h /= 6;
	}
	return { h: h, s: s, l: l };
}

function hsvDiff(A, B, minV) {
	return Math.abs(A.h - B.h); // consider hue only
	//return (Math.abs(A.h - B.h) + Math.abs(A.s - B.s)) * 0.5; // consider hue and saturation
}

function hslDiff(A, B) {
	if (A.l < 0.25 || A.l > 0.75)
		return 1;
	else
		return (Math.abs(A.h - B.h) + Math.abs(A.s - B.s)) / 2;
}

function dist(x1, y1, x2, y2) {
	const dx = x1 - x2;
	const dy = y1 - y2;
	return dx * dx + dy * dy;
}

function analyzePoints(ps) {
	var minX = 0;
	var minY = 0;
	var maxX = 0;
	var maxY = 0;
	var dx = 0;
	var dy = 0;

	for (var i = 0; i < ps.length; i++) {
		var p = ps[i];

		if (i == 0) {
			minX = p.x;
			minY = p.y;
		}

		if (p.x <= minX) minX = p.x;
		if (p.y <= minY) minY = p.y;
		if (p.x >= maxX) maxX = p.x;
		if (p.y >= maxY) maxY = p.y;
	}

	dx = maxX - minX;
	dy = maxY - minY;

	return {
		centroid: {x: dx / 2, y: dy / 2},
		minX: minX,
		maxX: maxX,
		minY: minY,
		maxY: maxY,
		width: dx,
		height: dy,
		radius: Math.sqrt(dx * dx + dy * dy)
	};
}
	
function forEachElement(selector, fn) {
	var elements = document.querySelectorAll(".collection");
	for (var i = 0; i < elements.length; i++)
		fn(elements[i], i);
}

function empty(el) {
	while (el.firstChild)
		el.removeChild(el.firstChild);
}
