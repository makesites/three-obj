var fs = require("fs"), 
	view = fs.readFileSync("../schema/ascii.json",'utf8'),
	utils = require("./utils");
	
var Ascii = function( options ){
	// save lib options as class options...
	this.options = options;
	
}

Ascii.prototype.compile = function( data ){
	
	// massage the data for this export mode...
	// - adding meta info
	data = this.meta( data );
	// - fix faces
	data.faces = faces( data.faces );
	// - moph targets (fallback)
	data.morphTargets = data.morphTargets || " ";
	data.morphColors = data.morphColors || " ";
	//
	var json = utils.template( view, data );
	//console.log( json );
	
	return JSON.parse( json );
	//return data.faces;
};

Ascii.prototype.meta = function( data ){ 
	data.generator = this.options.package.name
	data.version = utils.main_version( this.options.package.version );
	data.files = utils.filenames( this.options.files );
	data.scale = this.options.scale;
	// 
	
	return data;
}

// Internal methods

function faces( data ){
	var faces = [];
	for( var i in data ){
		faces.push( generate_face(data[i]) );
	};
	
	//console.log(data);
	
	return faces;
}

function generate_face(f, fc, options){ 

	// fallbacks
	options = options || {};
	options.shading = options.shading || "smooth";
	options.bake_colors = options.bake_colors || false;
	
    var isTriangle = ( f['vertex'].length == 3 );

    var nVertices = (isTriangle) ? 3 : 4;

    var hasMaterial = true; // for the moment OBJs without materials get default material

    var hasFaceUvs = false; // not supported in OBJ
    var hasFaceVertexUvs = ( f['uv'].length >= nVertices );

    var hasFaceNormals = false // don't export any face normals (as they are computed in engine)
    var hasFaceVertexNormals = ( f["normal"].length >= nVertices && options.shading == "smooth" );

    var hasFaceColors = options.bake_colors;
    var hasFaceVertexColors = false // not supported in OBJ

    var faceType = 0;
    faceType = setBit(faceType, 0, !isTriangle);
    faceType = setBit(faceType, 1, hasMaterial);
    faceType = setBit(faceType, 2, hasFaceUvs);
    faceType = setBit(faceType, 3, hasFaceVertexUvs);
    faceType = setBit(faceType, 4, hasFaceNormals);
    faceType = setBit(faceType, 5, hasFaceVertexNormals);
    faceType = setBit(faceType, 6, hasFaceColors);
    faceType = setBit(faceType, 7, hasFaceVertexColors);

    faceData = [];

    // order is important, must match order in JSONLoader

    // face type
    // vertex indices
    // material index
    // face uvs index
    // face vertex uvs indices
    // face normal index
    // face vertex normals indices
    // face color index
    // face vertex colors indices

    faceData.push(faceType);

    // must clamp in case on polygons bigger than quads

    for( var i in utils.xrange(nVertices) ){
        var index = f['vertex'][i] - 1;
        faceData.push(index);
	}
    faceData.push( f['material'] );

    if( hasFaceVertexUvs ){
        for( var i in utils.xrange(nVertices) ){
            index = f['uv'][i] - 1;
            faceData.push(index);
		}
	}
    if( hasFaceVertexNormals ){
        for( var i in utils.xrange(nVertices) ){
            index = f['normal'][i] - 1;
            faceData.push(index);
		}
	}
    if( hasFaceColors ){
        index = fc['material'];
        faceData.push(index);
	}
    
	return faceData;

}

function setBit(value, position, on){ 
	var mask;

    if( on ){
        mask = 1 << position;
        return (value | mask);
	} else { 
        mask = ~(1 << position);
        return (value & mask);
	}
}

module.exports = Ascii;