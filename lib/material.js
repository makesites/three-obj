var fs = require("fs"),
	utils = require("./utils");

// keys
var keyMap = {
	kd : "colorDiffuse", // Diffuse color: Kd 1.000 1.000 1.000
	ka : "colorAmbient", // Ambient color: Ka 1.000 1.000 1.000
	ks : "colorSpecular", // Specular color: Ks 1.000 1.000 1.000
	ns : "specularCoef", // Specular coefficient: Ns 154.000
	tr : "opacity", // Transparency: Tr 0.9 or d 0.9
	d : "opacity", // Transparency: Tr 0.9 or d 0.9
	ni : "opticalDensity", // Optical density: Ni 1.0
	map_kd : "mapDiffuse", // Diffuse texture: map_Kd texture_diffuse.jpg
	map_ka : "mapAmbient", // Ambient texture: map_Ka texture_ambient.jpg
	map_ks : "mapSpecular", // Specular texture: map_Ks texture_specular.jpg
	map_ns : "mapSpecular", // Specular texture: map_Ns texture_specular.jpg
	map_d : "mapAlpha", // Alpha texture: map_d texture_alpha.png
	map_opacity: "mapAlpha", // alternate alias for alpha map...
	map_bump : "mapBump", // Bump texture: map_bump texture_bump.jpg
	bump : "mapBump", // or bump texture_bump.jpg
	illum : "illumination", // * Reflection (check footnote)
	refl : "illumination", // second alias
}
// dummy colors
COLORS = [0xeeeeee, 0xee0000, 0x00ee00, 0x0000ee, 0xeeee00, 0x00eeee, 0xee00ee];


module.exports = function( obj, data, options ){
		// fallbacks
		data = data || {};
		options = options || {};
		// get material file
		var mtl = utils.file_ext( obj, ".mtl");
		// first read mtl file (usually fine to read synchronously)
		var valid = fs.existsSync( mtl );
		if( valid ){
			var mtl = fs.readFileSync( mtl, "utf-8");
		}
		// parse text into an meaningful object
		var materials = parser(mtl, options);
		//
		return JSON.stringify( materials );
};




// Based on the parser of MTLLoader
// Source: https://raw.github.com/mrdoob/three.js/master/examples/js/loaders/MTLLoader.js
function parser( mtl, options ){

	var lines = mtl.split( "\n" );
	var delimiter_pattern = /\s+/;
	var materials = [];
	var index = 0;

		for ( var i = 0; i < lines.length; i ++ ) {

		var line = lines[ i ];
		line = line.trim();

		if ( line.length === 0 || line.charAt( 0 ) === '#' || line.substr( 0, 2 ) === "//" ) {

			// Blank line or comment ignore
			continue;

		}

		var pos = line.indexOf( ' ' );

		var key = ( pos >= 0 ) ? line.substring( 0, pos) : line;
		key = key.toLowerCase();

		var value = ( pos >= 0 ) ? line.substring( pos + 1 ) : "";
		value = value.trim();

		if ( key === "newmtl" ) {
			// save index for later
			index = materials.length;

			// New material
			var material = {
				'DbgName': value,
				'DbgIndex': index,
				'DbgColor' : generate_color(index)
			};

			materials.push(material);

		} else if ( materials.length > 0 ) {
			// colorAmbient disabled for THREE.js > r80
			if ( key === "ka" ) continue;

			if ( key === "kd" || key === "ks" ) {

				var ss = value.split( delimiter_pattern, 3 );
				materials[ index ][ keyMap[key] ] = [ parseFloat( ss[0] ), parseFloat( ss[1] ), parseFloat( ss[2] ) ];

			} else {

				// skip empty values
				if( value == "" ) continue;

				// special conditions for transparency...
				if( key == "tr" || key == "d" || key == "map_d" ){
					materials[ index ]["transparent"] = true;
					if( options.transparency == "invert" && !isNaN( parseFloat(value) ) ){
						// invert value
						value = 1.0 - parseFloat(value);
					}
				}

				// is it necessary to parse floats on number string?
				materials[ index ][ keyMap[key] ] = (isNaN( parseFloat(value) )) ? value : parseFloat(value);


			}

		}

	}

	return materials;
}



// Helpers


// Generate dummy materials (if there is no MTL file).
function generate_mtl(materials){

	var mtl = {};
	for( i in materials){
		var material = materials[i];
		mtl[i] = {
			'DbgName': i,
			'DbgIndex': material,
			'DbgColor': generate_color(material)
		}
	}
	return mtl;
}

//Generate hex color corresponding to integer.
function generate_color(i){
	/* Colors should have well defined ordering.
	 * First N colors are hardcoded, then colors are random
	 * (must seed random number  generator with deterministic value
	 * before getting colors).
	 */
	return ( i < COLORS.length ) ? COLORS[i] :  parseInt(0xffffff * Math.random());
}

function value2string(v){
	if( typeof v == "string" && v.substr(0,2) != "0x"){
		return '"%s"' % v;
	} else if ( typeof v == "boolean"){
		return str(v).toLowerCase();
	}
	return str(v);
}



// References

/* Illumination
 * illum 2
 *
 * 0. Color on and Ambient off
 * 1. Color on and Ambient on
 * 2. Highlight on
 * 3. Reflection on and Ray trace on
 * 4. Transparency: Glass on, Reflection: Ray trace on
 * 5. Reflection: Fresnel on and Ray trace on
 * 6. Transparency: Refraction on, Reflection: Fresnel off and Ray trace on
 * 7. Transparency: Refraction on, Reflection: Fresnel on and Ray trace on
 * 8. Reflection on and Ray trace off
 * 9. Transparency: Glass on, Reflection: Ray trace off
 * 10. Casts shadows onto invisible surfaces
 */
