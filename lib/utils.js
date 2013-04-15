
module.exports = {
	
	get_name: function( path ){
		// Create model name based of filename ("path/fname.js" -> "fname").
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
	}
	
};