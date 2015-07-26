// dependencies
var material_parser = require('./material');

//OBJ parser

module.exports = function ( data, files ){
	var vertices = [],
	normals = [],
	uvs = [],
	faces = [],
	materials = [],
	colors = [],
	material = "",

	// numbers
	verticesCount = 0,
	faceCount = 0,
	normalCount = 0,
	colorCount = 0,
	uvCount = 0,
	materialCount = 0,

	mcurrent = 0,
	mtllib = "",

	// current face state
	group = 0,
	object = 0,
	smooth = 0;

	// fixes
	data = data.replace( /\ \\\r\n/g, '' ); // rhino adds ' \\r\n' some times.

	var lines = data.split( "\n" );

	for ( var i = 0; i < lines.length; i ++ ) {

			var line = lines[ i ];
			line = line.trim();

			var result;

			if ( line.length === 0 || line.charAt( 0 ) === '#' ) {

				continue;

			} else if ( ( result = vertex_pattern.exec( line ) ) !== null ) {

				// ["v 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

				vertices.push(
					parseFloat( result[ 1 ] ),
					parseFloat( result[ 2 ] ),
					parseFloat( result[ 3 ] )
				);
				verticesCount++;

			} else if ( ( result = normal_pattern.exec( line ) ) !== null ) {

				// ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

				normals.push(
					parseFloat( result[ 1 ] ),
					parseFloat( result[ 2 ] ),
					parseFloat( result[ 3 ] )
				);
				normalCount++;

			} else if ( ( result = uv_pattern.exec( line ) ) !== null ) {

				// ["vt 0.1 0.2", "0.1", "0.2"]

				uvs.push(
					parseFloat( result[ 1 ] ),
					parseFloat( result[ 2 ] )
				);
				if( result[ 3 ] )
					uvs.push( result[ 3 ] );

				uvCount++;

			} else if ( /^f /.test( line ) ) {

				// face
				var vertex_index = [],
				uv_index = [],
				normal_index = [];
				// Precompute vert / normal / uv lists for negative index lookup
				var vertlen = vertices.length + 1,
				normlen = normals.length + 1,
				uvlen = uvs.legth + 1;

				var vertexy = parse_vertex( line );

				for( var v in vertexy){
					vertex = vertexy[v];
					if(vertex['v']){
						if( vertex['v'] < 0){
							vertex['v'] += vertlen
						}
						vertex_index.push(vertex['v']);
					}
					if( vertex['t'] ){
						if( vertex['t'] < 0 ){
							vertex['t'] += uvlen;
						}
						uv_index.push(vertex['t']);
					}
					if( vertex['n'] ){
						if( vertex['n'] < 0 ){
							vertex['n'] += normlen;
						}
						normal_index.push(vertex['n']);
					}

				};

				// add the face
				faces.push({
					'vertex':vertex_index,
					'uv':uv_index,
					'normal':normal_index,

					'material':mcurrent,
					'group':group,
					'object':object,
					'smooth':smooth
				});
				faceCount++;

			} else if ( /^o /.test( line ) ) {

				// object
				object = line.substring( 2 ).trim();

			// the following are processed later...
			} else if ( /^g /.test( line ) ) {

				// group
				group = line.substring( 2 ).trim();

			} else if ( /^usemtl /.test( line ) ) {

				// material
				material = line.substring( 7 ).trim();

				if( materials.indexOf( material ) > -1 ){
					mcurrent = materials[material]
				} else {
					mcurrent = materialCount;
					materials[material] = materialCount;
					materialCount ++;
				}

			} else if ( /^mtllib /.test( line ) ) {

				// mtl file
				mtllib = line.substring( 7 ).trim();

			} else if ( /^s /.test( line ) ) {

				// smooth shading
				smooth = line.substring( 2 ).trim();

			} else {

				// console.log( "THREE.OBJLoader: Unhandled line " + line );

			}

		}

	// post processing
	// - include material information (create loop for more than one files)
	materials = material_parser( files[0], materials, this.options );
	// count colors
	if( this.options.bake_colors ){
		colors = extract_material_colors( JSON.parse(materials) );
		// convert to hexcolor
		for( c in colors){
			colors[c] = generate_color_decimal( colors[c] );
		}
		colorCount = colors.length;
	}

	// final result
	return {
		files: files,
	// counts
		verticesCount : verticesCount,
		faceCount : faceCount,
		normalCount : normalCount,
		colorCount : colorCount,
		uvCount : uvCount,
		materialCount :materialCount,
	// values
		faces : faces,
		vertices : vertices,
		uvs : uvs,
		normals : normals,
		colors : colors,
		materials : materials,
		mtllib : mtllib
	}
}

// Helpers

function parse_vertex( line ){
	// Parse text chunk specifying single vertex.

	/* Possible formats:
	 *  vertex index
	 *  vertex index / texture index
	 *  vertex index / texture index / normal index
	 *  vertex index / / normal index
	 */

	var vertex = [];

	if ( ( result = face_pattern1.exec( line ) ) !== null ) {

	// ["f 1 2 3", "1", "2", "3", undefined]

		for ( var i = 1; i < result.length; i ++ ) {
			vertex.push({ 'v': result[ i ], 't': 0, 'n': 0 });
		};

	} else if ( ( result = face_pattern2.exec( line ) ) !== null ) {

	// ["f 1/1 2/2 3/3", " 1/1", "1", "1", " 2/2", "2", "2", " 3/3", "3", "3", undefined, undefined, undefined]

		for ( var i = 2; i < result.length; i += 3 ) {
			if(typeof result[ i ] == "undefined") continue;
			vertex.push({ 'v': result[ i ], 't': result[ i+1 ], 'n': 0 });
		};

	} else if ( ( result = face_pattern3.exec( line ) ) !== null ) {

	// ["f 1/1/1 2/2/2 3/3/3", " 1/1/1", "1", "1", "1", " 2/2/2", "2", "2", "2", " 3/3/3", "3", "3", "3", undefined, undefined, undefined, undefined]

		for ( var i = 2; i < result.length; i += 4 ) {
			if(typeof result[ i ] == "undefined") continue;
			vertex.push({ 'v': result[ i ], 't': result[ i+1 ], 'n': result[ i+2 ] });
		};

	} else if ( ( result = face_pattern4.exec( line ) ) !== null ) {

	// ["f 1//1 2//2 3//3", " 1//1", "1", "1", " 2//2", "2", "2", " 3//3", "3", "3", undefined, undefined, undefined]

		for ( var i = 2; i < result.length; i += 3 ) {
			vertex.push({ 'v': result[ i ], 't': 0, 'n': result[ i+1 ] });
		};

	}

	return vertex;

}

// Extract diffuse colors from MTL materials
function extract_material_colors( materials ){
	// fallbacks
	materials = materials || [{ 'default': 0 }];
	var colors = [];
	for( m in materials){
		var material = materials[m];
		//var index
		var color = material["colorDiffuse"] || [1,0,0];
		if( material["DbgIndex"] ){
			var index = material["DbgIndex"];
			colors[index]= color;
		} else {
			colors.push(color);
		}
	}
	colors.sort();

	return colors;
}

function generate_color_decimal(c){
	//return "%d" % hexcolor(c);
	return hexcolor(c);
}

function hexcolor(c){
	return ( parseInt(c[0] * 255, 10) << 16  ) + ( parseInt(c[1] * 255, 10) << 8 ) + parseInt(c[2] * 255, 10);
}

// Regular expressions

// v float float float

var vertex_pattern = /v( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/;

// vn float float float

var normal_pattern = /vn( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/;

// vt float float

var uv_pattern = /vt( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/;

// f vertex vertex vertex ...

var face_pattern1 = /f( +-?\d+)( +-?\d+)( +-?\d+)( +-?\d+)?/;

// f vertex/uv vertex/uv vertex/uv ...

var face_pattern2 = /f( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))?/;

// f vertex/uv/normal vertex/uv/normal vertex/uv/normal ...

var face_pattern3 = /f( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))?/;

// f vertex//normal vertex//normal vertex//normal ...

var face_pattern4 = /f( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))?/;
