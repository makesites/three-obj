var threeOBJ = require("../index"),
	fs = require("fs");

threeOBJ.convert("./obj/palm.obj", "./ascii/palm.js", function( response ){
	console.log( "File saved at: ascii/palm.js"  );
});
