var threeOBJ = require("../index")(),
	fs = require("fs");

threeOBJ.load("obj/palm.obj", function( response ){
	console.log( JSON.stringify( response ) );
	//..
});

