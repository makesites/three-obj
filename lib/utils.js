
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
	}
	
};