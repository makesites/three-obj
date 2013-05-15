var threeOBJ = require("../index")(),
	fs = require("fs");

threeOBJ.set({ scale: 0.1 });

threeOBJ.convert("./camaro/Camaro.obj", "./camaro/Camaro.js", function( response ){
	console.log( "File saved at: camaro/Camaro.js"  );
});
