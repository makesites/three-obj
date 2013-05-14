// Helper methods for faces

function Faces( options ){
	this.options = options;
}

Faces.prototype = {

	is_triangle_flat: function(f){
		return f['vertex'].length==3 && !(f["normal"] && this.options.shading == "smooth") && !f['uv'];
	},
	is_triangle_flat_uv: function(f){
		return f['vertex'].length==3 && !(f["normal"] && this.options.shading == "smooth") && f['uv'].length==3;
	},
	is_triangle_smooth: function(f){
		return f['vertex'].length==3 && f["normal"] && this.options.shading == "smooth" && !f['uv'];
	},
	is_triangle_smooth_uv: function(f){
		return f['vertex'].length==3 && f["normal"] && this.options.shading == "smooth" && f['uv'].length==3;
	},
	is_quad_flat: function(f){
		return f['vertex'].length==4 && !(f["normal"] && this.options.shading == "smooth") && !f['uv'];
	},
	is_quad_flat_uv: function(f){
		return f['vertex'].length==4 && !(f["normal"] && this.options.shading == "smooth") && f['uv'].length==4;
	},
	is_quad_smooth: function(f){
		return f['vertex'].length==4 && f["normal"] && this.options.shading == "smooth" && !f['uv'];
	},
	is_quad_smooth_uv: function(f){
		return f['vertex'].length==4 && f["normal"] && this.options.shading == "smooth" && f['uv'].length==4;
	},
	sort: function(faces){
		var data = {
		'triangles_flat': [],
		'triangles_flat_uv': [],
		'triangles_smooth': [],
		'triangles_smooth_uv': [],

		'quads_flat': [],
		'quads_flat_uv': [],
		'quads_smooth': [],
		'quads_smooth_uv': []
		};

		for( var i in faces ){
			var f = faces[i];
			if( this.is_triangle_flat(f) ){
				data['triangles_flat'].push(f);
			} else if( this.is_triangle_flat_uv(f) ){
				data['triangles_flat_uv'].push(f);
			} else if( this.is_triangle_smooth(f) ){
				data['triangles_smooth'].push(f);
			} else if( this.is_triangle_smooth_uv(f) ){
				data['triangles_smooth_uv'].push(f);
			} else if( this.is_quad_flat(f) ){
				data['quads_flat'].push(f);
			} else if( this.is_quad_flat_uv(f) ){
				data['quads_flat_uv'].push(f);
			} else if( this.is_quad_smooth(f) ){
				data['quads_smooth'].push(f);
			} else if( this.is_quad_smooth_uv(f) ){
				data['quads_smooth_uv'].push(f);
			}
		}
		return data;
	}
}

module.exports = Faces;
