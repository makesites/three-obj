var fs = require('fs'), 
	parser = require('./parser'),
	Ascii = require('./ascii'),
	package = JSON.parse( fs.readFileSync("../package.json", "utf-8") ), 
	utils = require('./utils'),
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
	// containers
	data: {}, 
	
	//extends options with custome ones
	set: function ( options ) {
		// 
		this.options = utils.extend( this.options, options );
	},
	 
	load: function ( file, callback ) { 
		
		var self = this;
		
		this.options.files.push( file );
		
		fs.readFile(file, 'utf8', function( err, obj ){
			if( err ) console.log( err );
			// convert the response to json
			self.data = self.parse( obj );
			// output the result (for the callback)
			if ( callback ) callback( self.data );
			
		});

	},
	
	// parse an OBJ to JSON
	parse: parser, 
	
	
	// convert data to binary file
	compress: function ( json ) {
		
	}, 
	
	output: function( json, callback ){
		var output = {};
		switch( this.options.type ){
			case "ascii":
				var ascii = new Ascii( this.options );
				var response = ascii.compile( json );
			break;
			case "binary":
				// TBA
			break;
		};
		if ( callback ) callback( response );
	}
	
};

module.exports  = new Main();