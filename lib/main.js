var fs = require('fs'),
	path = require("path"),
	parser = require('./parser'),
	Ascii = require('./ascii'),
	Binary = require('./binary'),
	package = JSON.parse( fs.readFileSync( path.join( __dirname, "/../", "package.json"), "utf-8") ),
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
	this.options = utils.extend( this.options, options );
	// add info from package.json
	this.options.package = package;
	this.options.files = [];
	// preserve namespace

	this._this = this;
	return this;
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
		// save file list
		this.options.files.push( file );
		var files = this.options.files;

		fs.readFile(file, 'utf8', function( err, obj ){
			if( err ) return console.log( err );
			// convert the response to json
			self.data = self.parse( obj, files );
			// output the result (for the callback)
			if ( callback ) callback( self.data );

		});

	},

	// parse an OBJ to JSON
	parse: parser,

	// load & output to a json file (ascii)
	convert: function ( source, destination, callback ) {
		var self = this;
		//set type to ascii
		this.set({ type : "ascii" });
		// load the OBJ file
		self.load( source, function( data ){
			// validate data?
			self.output( data, destination, function(){
				//
				if ( callback ) callback( data );

			});
		});

	},

	//Convert infile.obj to outfile.js + outfile.bin
	minify: function ( source, destination, callback ) {
		//
		if( !fs.existsSync(source) ) return console.log("Couldn't find "+ source);
		//
		var self = this;

		//set type to ascii
		this.set({ type : "binary" });
		// load the OBJ file
		self.load( source, function( data ){
			// validate data?
			self.output( data, destination, function(){
				//
				if ( callback ) callback( data );

			});
		});

	},

	// convert data to binary file
	compress: function ( json, callback ) {
		//set type to ascii
		this.set({ type : "binary" });
		// load the OBJ file
		// add binary file in the options
		this.set({ buffers : utils.get_name(destination) +".bin" });
		var binary = new Binary( this.options );
		output = binary.compile( json );
		return ( callback ) ? callback( output ) : output;
	},

	output: function( data, destination, callback ){
		var json, output = {};
		//
		switch( this.options.type ){
			case "ascii":
				var ascii = new Ascii( this.options );
				output = ascii.compile( data );
				// save json to file
				ascii.save( destination, output, callback );
			break;
			case "binary":
				// add binary file in the options
				this.set({ buffers : utils.get_name(destination) +".bin" });
				var binary = new Binary( this.options );
				output = binary.compile( data );
				binary.save( destination, output, callback );
			break;
		};

	}

};

module.exports  = function( options ){
	return new Main( options );
}