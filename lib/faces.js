// Dependencies
var utils = require("./utils");


// Faces generator

function Faces( options ){
	this.options = options;
}

Faces.prototype = {

	is_triangle_flat: function(f){
		return f['vertex'].length==3 && !(f["normal"] && this.options.shading == "smooth") && !f['uv'];
	},
	is_triangle_flat_uv: function(f){
		return f['vertex'].length==3 && !(f["normal"] && this.options.shading == "smooth") && f['uv'].length==3;
	},
	is_triangle_smooth: function(f){
		return f['vertex'].length==3 && f["normal"] && this.options.shading == "smooth" && !f['uv'];
	},
	is_triangle_smooth_uv: function(f){
		return f['vertex'].length==3 && f["normal"] && this.options.shading == "smooth" && f['uv'].length==3;
	},
	is_quad_flat: function(f){
		return f['vertex'].length==4 && !(f["normal"] && this.options.shading == "smooth") && !f['uv'];
	},
	is_quad_flat_uv: function(f){
		return f['vertex'].length==4 && !(f["normal"] && this.options.shading == "smooth") && f['uv'].length==4;
	},
	is_quad_smooth: function(f){
		return f['vertex'].length==4 && f["normal"] && this.options.shading == "smooth" && !f['uv'];
	},
	is_quad_smooth_uv: function(f){
		return f['vertex'].length==4 && f["normal"] && this.options.shading == "smooth" && f['uv'].length==4;
	},
	sort: function(faces){
		var data = {
		'triangles_flat': [],
		'triangles_flat_uv': [],
		'triangles_smooth': [],
		'triangles_smooth_uv': [],

		'quads_flat': [],
		'quads_flat_uv': [],
		'quads_smooth': [],
		'quads_smooth_uv': []
		};

		for( var i in faces ){
			var f = faces[i];
			if( this.is_triangle_flat(f) ){
				data['triangles_flat'].push(f);
			} else if( this.is_triangle_flat_uv(f) ){
				data['triangles_flat_uv'].push(f);
			} else if( this.is_triangle_smooth(f) ){
				data['triangles_smooth'].push(f);
			} else if( this.is_triangle_smooth_uv(f) ){
				data['triangles_smooth_uv'].push(f);
			} else if( this.is_quad_flat(f) ){
				data['quads_flat'].push(f);
			} else if( this.is_quad_flat_uv(f) ){
				data['quads_flat_uv'].push(f);
			} else if( this.is_quad_smooth(f) ){
				data['quads_smooth'].push(f);
			} else if( this.is_quad_smooth_uv(f) ){
				data['quads_smooth_uv'].push(f);
			}
		}
		return data;
	},
	// align
	// - Center model (middle of bounding box).
	center: function(vertices){

		var bb = bbox(vertices);

		var cx = bb['x'][0] + (bb['x'][1] - bb['x'][0])/2.0;
		var cy = bb['y'][0] + (bb['y'][1] - bb['y'][0])/2.0;
		var cz = bb['z'][0] + (bb['z'][1] - bb['z'][0])/2.0;

		vertices = translate(vertices, [-cx,-cy,-cz]);

		return vertices;
	},
	// - Align top of the model with the floor (Y-axis) and center it around X and Z.
	top: function(vertices){

		var bb = bbox(vertices);

		var cx = bb['x'][0] + (bb['x'][1] - bb['x'][0])/2.0;
		var cy = bb['y'][1];
		var cz = bb['z'][0] + (bb['z'][1] - bb['z'][0])/2.0;

		vertices = translate(vertices, [-cx,-cy,-cz]);

		return vertices;
	},
	// - Align bottom of the model with the floor (Y-axis) and center it around X and Z.
	bottom: function(vertices){

		var bb = bbox(vertices);

		var cx = bb['x'][0] + (bb['x'][1] - bb['x'][0])/2.0;
		var cy = bb['y'][0];
		var cz = bb['z'][0] + (bb['z'][1] - bb['z'][0])/2.0;

		vertices = translate(vertices, [-cx,-cy,-cz]);

		return vertices;
	},
	// - Center model around X and Z.
	centerxz: function(vertices){

		var bb = bbox(vertices);

		cx = bb['x'][0] + (bb['x'][1] - bb['x'][0])/2.0;
		cy = 0;
		cz = bb['z'][0] + (bb['z'][1] - bb['z'][0])/2.0;

		vertices = translate(vertices, [-cx,-cy,-cz]);

		return vertices;
	}
}


// Helpers
// - Compute bounding box of vertex array.
function bbox( vertices ){

	if( vertices.length >0 ){
		var minx = maxx = vertices[0];
		var miny = maxy = vertices[1];
		var minz = maxz = vertices[2];

		for( var i = 0; i < vertices.length; i +=3 ){
			var v = [ vertices[i], vertices[i+1], vertices[i+2] ];
			if( v[0] < minx ){
				minx = v[0];
			} else if( v[0] > maxx ){
				maxx = v[0];
			}
			if( v[1] < miny ){
				miny = v[1];
			} else if( v[1] > maxy ){
				maxy = v[1];
			}
			if( v[2]<minz ){
				minz = v[2];
			} else if( v[2] > maxz ){
				maxz = v[2];
			}
		}
		return { 'x':[minx,maxx], 'y':[miny,maxy], 'z':[minz,maxz] };

	} else {
		return { 'x':[0,0], 'y':[0,0], 'z':[0,0] };
	}
}

// - Translate array of vertices by vector t.
function translate(vertices, t){

	for( var i = 0; i < vertices.length; i +=3 ){
		//console.log("i", i);
		vertices[i] += t[0];
		vertices[i+1] += t[1];
		vertices[i+2] += t[2];
	}

	return vertices;
}

module.exports = Faces;
