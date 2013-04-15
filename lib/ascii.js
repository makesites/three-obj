var fs = require("fs"), 
	view = fs.readFileSync("../schema/ascii.json",'utf8'),
	utils = require("./utils");
	
var Ascii = function( options ){
	// save lib options as class options...
	this.options = options;
	
}

Ascii.prototype.compile = function( data ){
	
	// massage the data for this export mode...
	data.faces = faces( data.faces );
	//
	var json = utils.template( view, data );
	
	return JSON.parse( json );
}

// Internal methods
function faces( data ){
	//console.log(data);
	return ;
}

function generate_face(f, fc){ 

    var isTriangle = ( f['vertex'].length == 3 );

    var nVertices = (isTriangle) ? 3 : 4;

    var hasMaterial = true; // for the moment OBJs without materials get default material

    var hasFaceUvs = false; // not supported in OBJ
    var hasFaceVertexUvs = ( f['uv'].length >= nVertices );

    var hasFaceNormals = false // don't export any face normals (as they are computed in engine)
    var hasFaceVertexNormals = ( f["normal"].length >= nVertices && SHADING == "smooth" );

    var hasFaceColors = BAKE_COLORS;
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

    faceData.append(faceType);

    // must clamp in case on polygons bigger than quads

    for( var i in xrange(nVertices) ){
        var index = f['vertex'][i] - 1;
        faceData.append(index);
	}
    faceData.append( f['material'] );

    if( hasFaceVertexUvs ){
        for( var i in xrange(nVertices) ){
            index = f['uv'][i] - 1;
            faceData.append(index);
		}
	}
    if( hasFaceVertexNormals ){
        for( var i in xrange(nVertices) ){
            index = f['normal'][i] - 1;
            faceData.append(index);
		}
	}
    if( hasFaceColors ){
        index = fc['material'];
        faceData.append(index);
	}
    //return ",".join( map(str, faceData) );

}

function setBit(value, position, on){ 
    if( on ){
        var mask = 1 << position;
        return (value || mask);
	} else { 
        //var mask = ~(1 << position);
        //return (value && mask);
	}
}

module.exports = Ascii;