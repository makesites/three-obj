var threeOBJ = require("../index"),
	fs = require("fs");

//threeOBJ.set({ shading: "flat" });

threeOBJ.minify("./obj/palm.obj", "./binary/palm.js", function( response ){
	console.log( "File saved at: binary/palm.js"  );
});
