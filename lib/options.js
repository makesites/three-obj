// overwrite these options when initiating the lib
module.exports = {
	align : "none", 			// model alignment: center, centerxz, bottom, top, none
	shading : "smooth", 		// export vertex normals: smooth, flat
	type : "ascii", 			// export format: ascii, binary
	transparency : "normal", 	// opacity calculation: normal, invert
	truncate : false,
	scale : 1.0,
	framestep : 1,
	bake_colors : false,
// default colors for debugging (each material gets one distinct color):
// white, red, green, blue, yellow, cyan, magenta
	colors : [0xeeeeee, 0xee0000, 0x00ee00, 0x0000ee, 0xeeee00, 0x00eeee, 0xee00ee],
	buffers : false
}
