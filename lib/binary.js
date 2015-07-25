var fs = require("fs"),
	struct = require("bufferpack"),
	utils = require("./utils"),
	Faces = require("./faces"),
	Ascii = require("./ascii");

// header
var header_bytes  = struct.calcLength('<12s');
header_bytes += struct.calcLength('<BBBBBBBB');
header_bytes += struct.calcLength('<IIIIIIIIIII');

// signature
var signature = struct.pack('<12s', ['Three OBJ']);

// metadata (all data is little-endian)
var vertex_coordinate_bytes = 4;
var normal_coordinate_bytes = 1;
var uv_coordinate_bytes = 4;

var vertex_index_bytes = 4;
var normal_index_bytes = 4;
var uv_index_bytes = 4;
var material_index_bytes = 2;

/*
# header_bytes            unsigned char   1

# vertex_coordinate_bytes unsigned char   1
# normal_coordinate_bytes unsigned char   1
# uv_coordinate_bytes     unsigned char   1

# vertex_index_bytes      unsigned char   1
# normal_index_bytes      unsigned char   1
# uv_index_bytes          unsigned char   1
# material_index_bytes    unsigned char   1
*/
var bdata = struct.pack('<BBBBBBBB', [header_bytes,
						   vertex_coordinate_bytes,
						   normal_coordinate_bytes,
						   uv_coordinate_bytes,
						   vertex_index_bytes,
						   normal_index_bytes,
						   uv_index_bytes,
						   material_index_bytes]);

// Main class

function Binary( options ){
	this.options = options;
	// load ascii wiht the same options
	this.ascii = new Ascii( options );
}

Binary.prototype = {

	compile: function( data ){

		var buffer, nnormals;
		var faces = new Faces( this.options );
		// - alignment
		if( this.options.align == "center" ){
			data.vertices = faces.center( data.vertices );
		} else if( this.options.align == "centerxz" ){
			data.vertices = faces.centerxz( data.vertices );
		} else if( this.options.align == "bottom" ){
			data.vertices = faces.bottom( data.vertices );
		} else if( this.options.align == "top" ){
			data.vertices = faces.top( data.vertices );
		}

		var sfaces = faces.sort( data.faces );

		if( this.options.shading == "smooth" ){
			nnormals = data.normalCount;
		} else {
			nnormals = 0;
		}

		var ntri_flat = sfaces['triangles_flat'].length;
		var ntri_smooth = sfaces['triangles_smooth'].length;
		var ntri_flat_uv = sfaces['triangles_flat_uv'].length;
		var ntri_smooth_uv = sfaces['triangles_smooth_uv'].length;

		var nquad_flat = sfaces['quads_flat'].length;
		var nquad_smooth = sfaces['quads_smooth'].length;
		var nquad_flat_uv = sfaces['quads_flat_uv'].length;
		var nquad_smooth_uv = sfaces['quads_smooth_uv'].length;

		/*
		# nvertices       unsigned int    4
		# nnormals        unsigned int    4
		# nuvs            unsigned int    4

		# ntri_flat       unsigned int    4
		# ntri_smooth     unsigned int    4
		# ntri_flat_uv    unsigned int    4
		# ntri_smooth_uv  unsigned int    4

		# nquad_flat      unsigned int    4
		# nquad_smooth    unsigned int    4
		# nquad_flat_uv   unsigned int    4
		# nquad_smooth_uv unsigned int    4
		*/
		ndata = struct.pack('<IIIIIIIIIII', [data.verticesCount,
												nnormals,
												data.uvCount,
												ntri_flat,
												ntri_smooth,
												ntri_flat_uv,
												ntri_smooth_uv,
												nquad_flat,
												nquad_smooth,
												nquad_flat_uv,
												nquad_smooth_uv]);

		buffer = Buffer.concat([ signature, bdata, ndata ]);

		/*
		# 1. vertices
		# ------------
		# x float   4
		# y float   4
		# z float   4
		*/
		for( var i = 0; i < data.vertices.length; i +=3 ){
			var v = data.vertices[i];
			var oct = struct.pack('<fff', [data.vertices[i], data.vertices[i+1], data.vertices[i+2]]);
			buffer = Buffer.concat([ buffer, oct ]);
		}

		/*
		# 2. normals
		# ---------------
		# x signed char 1
		# y signed char 1
		# z signed char 1
		*/
		if( this.options.shading == "smooth" ){
			for( var i = 0; i < data.normals.length; i +=3 ){
				var n = [ data.normals[i], data.normals[i+1], data.normals[i+2] ];
				n = utils.normalize(n);
				var oct = struct.pack('<bbb', [Math.floor(n[0]*127+0.5), Math.floor(n[1]*127+0.5), Math.floor(n[2]*127+0.5)]);
				buffer = Buffer.concat([ buffer, oct ]);
			}
			buffer = add_padding(buffer, nnormals * 3);
		}

		/*
		# 3. uvs
		# -----------
		# u float   4
		# v float   4
		*/
		for( var i = 0; i < data.uvs.length; i +=2 ){
			var uv = [ data.uvs[i], data.uvs[i+1] ];
			var oct = struct.pack('<ff', [uv[0], uv[1]]);
			buffer = Buffer.concat([ buffer, oct ]);
		}

		/*
		# padding
		#data = struct.pack('<BB', 0, 0)
		#buffer.append(data)

		# 4. flat triangles (vertices + materials)
		# ------------------
		# a unsigned int   4
		# b unsigned int   4
		# c unsigned int   4
		# ------------------
		# m unsigned short 2
		*/
		buffer = dump_vertices3_to_buffer(sfaces['triangles_flat'], buffer);

		buffer = dump_materials_to_buffer(sfaces['triangles_flat'], buffer);
		buffer = add_padding(buffer, ntri_flat * 2);

		/*
		# 5. smooth triangles (vertices + materials + normals)
		# -------------------
		# a  unsigned int   4
		# b  unsigned int   4
		# c  unsigned int   4
		# -------------------
		# na unsigned int   4
		# nb unsigned int   4
		# nc unsigned int   4
		# -------------------
		# m  unsigned short 2
		*/
		buffer = dump_vertices3_to_buffer(sfaces['triangles_smooth'], buffer);
		buffer = dump_normals3_to_buffer(sfaces['triangles_smooth'], buffer);

		buffer = dump_materials_to_buffer(sfaces['triangles_smooth'], buffer);
		buffer = add_padding(buffer, ntri_smooth * 2);

		/*
		# 6. flat triangles uv (vertices + materials + uvs)
		# --------------------
		# a  unsigned int    4
		# b  unsigned int    4
		# c  unsigned int    4
		# --------------------
		# ua unsigned int    4
		# ub unsigned int    4
		# uc unsigned int    4
		# --------------------
		# m  unsigned short  2
		*/
		buffer = dump_vertices3_to_buffer(sfaces['triangles_flat_uv'], buffer);
		buffer = dump_uvs3_to_buffer(sfaces['triangles_flat_uv'], buffer);

		buffer = dump_materials_to_buffer(sfaces['triangles_flat_uv'], buffer);
		buffer = add_padding(buffer, ntri_flat_uv * 2);

		/*
		# 7. smooth triangles uv (vertices + materials + normals + uvs)
		# ----------------------
		# a  unsigned int    4
		# b  unsigned int    4
		# c  unsigned int    4
		# --------------------
		# na unsigned int    4
		# nb unsigned int    4
		# nc unsigned int    4
		# --------------------
		# ua unsigned int    4
		# ub unsigned int    4
		# uc unsigned int    4
		# --------------------
		# m  unsigned short  2
		*/
		buffer = dump_vertices3_to_buffer(sfaces['triangles_smooth_uv'], buffer);
		buffer = dump_normals3_to_buffer(sfaces['triangles_smooth_uv'], buffer);
		buffer = dump_uvs3_to_buffer(sfaces['triangles_smooth_uv'], buffer);

		buffer = dump_materials_to_buffer(sfaces['triangles_smooth_uv'], buffer);
		buffer = add_padding(buffer, ntri_smooth_uv * 2);

		/*
		# 8. flat quads (vertices + materials)
		# ------------------
		# a unsigned int   4
		# b unsigned int   4
		# c unsigned int   4
		# d unsigned int   4
		# --------------------
		# m unsigned short 2
		*/
		buffer = dump_vertices4_to_buffer(sfaces['quads_flat'], buffer);

		buffer = dump_materials_to_buffer(sfaces['quads_flat'], buffer);
		buffer = add_padding(buffer, nquad_flat * 2);

		/*
		# 9. smooth quads (vertices + materials + normals)
		# -------------------
		# a  unsigned int   4
		# b  unsigned int   4
		# c  unsigned int   4
		# d  unsigned int   4
		# --------------------
		# na unsigned int   4
		# nb unsigned int   4
		# nc unsigned int   4
		# nd unsigned int   4
		# --------------------
		# m  unsigned short 2
		*/
		buffer = dump_vertices4_to_buffer(sfaces['quads_smooth'], buffer);
		buffer = dump_normals4_to_buffer(sfaces['quads_smooth'], buffer);

		buffer = dump_materials_to_buffer(sfaces['quads_smooth'], buffer);
		buffer = add_padding(buffer, nquad_smooth * 2);

		/*
		# 10. flat quads uv (vertices + materials + uvs)
		# ------------------
		# a unsigned int   4
		# b unsigned int   4
		# c unsigned int   4
		# d unsigned int   4
		# --------------------
		# ua unsigned int  4
		# ub unsigned int  4
		# uc unsigned int  4
		# ud unsigned int  4
		# --------------------
		# m unsigned short 2
		*/
		buffer = dump_vertices4_to_buffer(sfaces['quads_flat_uv'], buffer);
		buffer = dump_uvs4_to_buffer(sfaces['quads_flat_uv'], buffer);

		buffer = dump_materials_to_buffer(sfaces['quads_flat_uv'], buffer);
		buffer = add_padding(buffer, nquad_flat_uv * 2);

		/*
		# 11. smooth quads uv
		# -------------------
		# a  unsigned int   4
		# b  unsigned int   4
		# c  unsigned int   4
		# d  unsigned int   4
		# --------------------
		# na unsigned int   4
		# nb unsigned int   4
		# nc unsigned int   4
		# nd unsigned int   4
		# --------------------
		# ua unsigned int   4
		# ub unsigned int   4
		# uc unsigned int   4
		# ud unsigned int   4
		# --------------------
		# m  unsigned short 2
		*/
		buffer = dump_vertices4_to_buffer(sfaces['quads_smooth_uv'], buffer);
		buffer = dump_normals4_to_buffer(sfaces['quads_smooth_uv'], buffer);
		buffer = dump_uvs4_to_buffer(sfaces['quads_smooth_uv'], buffer);

		buffer = dump_materials_to_buffer(sfaces['quads_smooth_uv'], buffer);
		buffer = add_padding(buffer, nquad_smooth_uv * 2);

		// lastly create the json file
		var json = this.convert( data );

		return {
			json: json,
			buffer: buffer
		}
	},

	convert: function( data ){
		return this.ascii.compile( data );
	},

	save: function( destination, output, callback ){
		//
		var bin = utils.file_ext(destination, ".bin");
		// output js
		this.ascii.save( destination, output.json, function(){
			// check for errors..
			// output binary
			fs.writeFile(bin, output.buffer, function(err){
				if( err ) return console.log( err );
				// return to callback
				if ( callback ) callback();
			});
		});
	}
}

// Helpers

function dump_materials_to_buffer(faces, buffer){
	for( var i in faces){
		var f = faces[i];
		var data = struct.pack('<H', [f['material']]);
		buffer = Buffer.concat([ buffer, data ]);
	}
	return buffer;
}

function dump_vertices3_to_buffer(faces, buffer){
	for( var i in faces){
		var f = faces[i];
		var vi = f['vertex'];
		var data = struct.pack('<III', [vi[0]-1, vi[1]-1, vi[2]-1]);
		buffer = Buffer.concat([ buffer, data ]);
	}
	return buffer;
}

function dump_vertices4_to_buffer(faces, buffer){
	for( var i in faces){
		var f = faces[i];
		var vi = f['vertex'];
		var data = struct.pack('<IIII', [vi[0]-1, vi[1]-1, vi[2]-1, vi[3]-1]);
		buffer = Buffer.concat([ buffer, data ]);
	}
	return buffer;
}

function dump_normals3_to_buffer(faces, buffer){
	for( var i in faces){
		var f = faces[i];
		var ni = f['normal'];
		var data = struct.pack('<III', [ni[0]-1, ni[1]-1, ni[2]-1]);
		buffer = Buffer.concat([ buffer, data ]);
	}
	return buffer;
}

function dump_normals4_to_buffer(faces, buffer){
	for( var i in faces){
		var f = faces[i];
		var ni = f['normal'];
		var data = struct.pack('<IIII', [ni[0]-1, ni[1]-1, ni[2]-1, ni[3]-1]);
		buffer = Buffer.concat([ buffer, data ]);
	}
	return buffer;
}

function dump_uvs3_to_buffer(faces, buffer){
	for( var i in faces){
		var f = faces[i];
		var ui = f['uv'];
		var data = struct.pack('<III', [ui[0]-1, ui[1]-1, ui[2]-1]);
		buffer = Buffer.concat([ buffer, data ]);
	}
	return buffer;
}

function dump_uvs4_to_buffer(faces, buffer){
	for( var i in faces){
		var f = faces[i];
		var ui = f['uv'];
		var data = struct.pack('<IIII', [ui[0]-1, ui[1]-1, ui[2]-1, ui[3]-1]);
		buffer = Buffer.concat([ buffer, data ]);
	}
	return buffer;
}

function add_padding(buffer, n){
	if( n % 4 ){
		for( var i in utils.range(4 - n % 4) ){
			var data = struct.pack('<B', [0]);
			buffer = Buffer.concat([ buffer, data ]);
		}
	}
	return buffer;
}


module.exports = Binary;
