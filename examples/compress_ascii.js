var threeObj = require("../index"),
	fs = require("fs");

threeObj.load("obj/palm.obj", function( response ){
	//console.log( JSON.stringify( response ) );
	fs.writeFile("./json/palm.js", JSON.stringify( response ));
});

