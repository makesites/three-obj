var fs = require('fs'), 
	parser = require('./parser'),
	material = require('./material'),
	Ascii = require('./ascii'),
	package = JSON.parse( fs.readFileSync("../package.json", "utf-8") ), 
THREE = require('three');

// default options
var defaults = require('./options');
	
Main = function ( options ) {
	// fallbacks
	options = options || {};
	// set default options
	this.options = defaults;
	// extend default options
	// this.options = Object.extend(this.options, options)
	// add info from package.json
	this.options.package = package;
	this.options.files = [];
};

Main.prototype = {
	
	constructor: Main,
	
	data: {}, 
	
	load: function ( file, callback ) { 
		
		var self = this;
		
		this.options.files.push( file );
		
		fs.readFile(file, 'utf8', function( err, obj ){
			if( err ) console.log( err );
			// convert the response to json
			self.data = self.parse( obj );
			// post processing
			// - include material information
			self.data.materials = self.material( self.data.materials );
			// output the result (for the callback)
			var response = self.output();
			
			if ( callback ) callback( response );
		});

	},
	
	material: material, 

	// convert json to binary file
	parse: parser, 
	
	// convert json to binary file
	compress: function ( json ) {
		
	}, 
	
	output: function(){
		var output = {};
		switch( this.options.type ){
			case "ascii":
				var ascii = new Ascii( this.options );
				return ascii.compile( this.data );
			break;
			case "binary":
				// TBA
			break;
		};
	}
	
};

module.exports  = new Main();