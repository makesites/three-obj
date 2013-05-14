
module.exports = {

	// return the filenames from an array of paths
	filenames: function( array ){
		var files = [];
		for( var i in array ){
			files.push( array[i].split("/").pop() );
		}
		return files.join(",");
	},

	// Create model name based of filename ("path/fname.js" -> "fname").
	get_name: function( path ){
		return path.split("/").pop().match(/(.*)\.[^.]+$/).pop()
	},

	template: function( view, data ){
		var keys = view.match(/\{\{(.+?)\}\}/g);
		// loop through keys
		for( var i in keys ){
			var key = keys[i].replace(/{{|}}/g, "");
			var value = data[key] || 0 ;
			//view.replace(keys[i], JSON.stringify(value) );
			view = view.replace(keys[i], value );
		}
		return view;
	},

	main_version: function( version ){
		// JSON.stringify has a problem with Major.Minor.Bugfix versioning...
		return version.match(/^(.*)\.\d/).pop();
	},
	// Approximate implementation of Python's builtin xrange()
	xrange: function(b0, b1, quanta) {
		if (!quanta) { quanta = 1; }
		if (!b1) { b1 = b0; b0 = 0; }
		out = [];
		for (var i = b0, idx = 0; i < b1; i += quanta, idx++) {
			out[idx] = i;
		}
		return out;
	},

	// replaces file extension for another ( supplied)
	file_ext: function(str, ext ){
		return str.replace(/\.[^/.]+$/, ext);
	},

	extend : function(destination, source) {
		for (var property in source) {
			if (source[property] && source[property].constructor && source[property].constructor === Object) {
				destination[property] = destination[property] || {};
				arguments.callee(destination[property], source[property]);
			} else {
				destination[property] = source[property];
			}
		}
		return destination;
	},

	// Normalize 3d vector
	normalize: function(v){

		var l = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2])
		if( l ){
			v[0] = v[0]/l;
			v[1] = v[1]/l
			v[2] = v[2]/l
		}
		return v;
	},

	// underscore's range() method : http://underscorejs.org/
	range: function(start, stop, step) {
		if (arguments.length <= 1) {
			stop = start || 0;
			start = 0;
		}
		step = arguments[2] || 1;

		var len = Math.max(Math.ceil((stop - start) / step), 0);
		var idx = 0;
		var range = new Array(len);

		while(idx < len) {
			range[idx++] = start;
			start += step;
		}

		return range;
	}

};