# Three OBJ

A node module to convert OBJ files to Three.js JSON format

## Install

Using npm:
```
npm install three-obj
```

## Usage

Include to a script as a dependency
```
var threeOBJ = require("three-obj")( options );
```
where options can be an bject to override the defaults

then load any OBJ file to convert it to a JSON object
```
threeOBJ.load("obj/palm.obj", function( response ){

	console.log("DATA:", response );

});
```
Note that the MTL file is currently expected to be is the same folder.

View the [examples](./examples) folder for more specific use cases


## Methods

These are the main methods to interact with the lib

### load( file, callback )

Loads an OBJ file and creates a JavaScript object

### convert( source, destination, callback )

One liner to load & output to ascii JSON

### minify( source, destination, callback)

Same as ```convert``` but saves to binary format

### set( options)

Update the options used during the processing (like scale, shading, align).


## Internal methods

In addition there are some methods used internally that you might want to use at certain cases:

### parse( obj )

Accepts a raw OBJ file and returns it as a JavaScript object

### compress( json , callback)

Get the JSON input and convert it to binary format

### output( json, callback )

Simply saves the data to a JSON file.



## Credits

Created by Makis Tracend ( [@tracend](http://twitter.com/tracend) )

Based on: [OBJLoader](https://github.com/mrdoob/three.js/blob/master/examples/js/loaders/OBJLoader.js), [MTLLoader](https://github.com/mrdoob/three.js/blob/master/examples/js/loaders/MTLLoader.js), [convert_obj_three](https://github.com/mrdoob/three.js/blob/master/utils/converters/obj/convert_obj_three.py)

Distributed through [Makesites.org](http://makesites.org/)

Released under the [MIT license](http://makesites.org/licenses/MIT)
