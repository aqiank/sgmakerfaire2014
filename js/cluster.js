function Point(x, y) {
	this.x = x;
	this.y = y;
	this.clusterId = 0;
}

Point.prototype.dist2 = function(other) {
	var dx = other.x - this.x;
	var dy = other.y - this.y;
	return dx * dx + dy * dy;
}

function getClusters(points, eps, minPoints) {
	var clusters = [];
	var clusterId = 1;

	eps *= eps;

	for (var i = 0; i < points.length; i++) {
		var p = points[i];
		if (p.clusterId === 0) {
			if (expandCluster(points, p, clusterId, eps, minPoints))
				clusterId++;
		}
	}

	points.sort(function(a, b) { return a.clusterId - b.clusterId; });
	
	var maxClusterId = points[points.length - 1].clusterId;
	if (maxClusterId < 1)
		return clusters;
	
	for (var i = 0; i < maxClusterId; i++)
		clusters.push(new Array());

	for (var i = 0; i < points.length; i++) {
		var p = points[i];
		if (p.clusterId > 0)
			clusters[p.clusterId - 1].push(p);
	}

	return clusters;
}

function getRegion(points, p, eps) {
	region = [];
	
	for (var i = 0; i < points.length; i++) {
		var distSquared = p.dist2(points[i]);
		if (distSquared <= eps)
			region.push(points[i]);
	}

	return region;
}

function expandCluster(points, p, clusterId, eps, minPoints) {
	var seeds = getRegion(points, p, eps);
	
	if (seeds.length < minPoints) {
		p.clusterId = -1;
		return false;
	} else {
		for (var i = 0; i < seeds.length; i++)
			seeds[i].clusterId = clusterId;

		seeds.splice(seeds.indexOf(p), 1);

		while (seeds.length > 0) {
			var currentP = seeds[0];
			result = getRegion(points, currentP, eps);
			if (result.length >= minPoints) {
				for (var i = 0; i < result.length; i++) {
					var resultP = result[i];
					if (resultP.clusterId === 0 || resultP.clusterId === -1) {
						if (resultP.clusterId === 0)
							seeds.push(resultP);
						resultP.clusterId = clusterId;
					}
				}
			}
			seeds.splice(seeds.indexOf(currentP));
		}
		return true;
	}
}
