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
var threeOBJ = require("../three-obj");

```
then load any OBJ file to convert it to a JSON object
```
threeOBJ.load("obj/palm.obj", function( response ){
	
	console.log("JSON:", response );
	
});

```
Note that the MTL file is currently expected to be is the same folder. 

View the [examples](./examples) folder for more specific use cases


## Methods

### load(file, callback)

Loads the OBJ file and returns the JSON ojbect


## Credits

Created by Makis Tracend ( [@tracend](http://twitter.com/tracend) )

Based on: [OBJLoader](https://github.com/mrdoob/three.js/blob/master/examples/js/loaders/OBJLoader.js), [MTLLoader](https://github.com/mrdoob/three.js/blob/master/examples/js/loaders/MTLLoader.js), [convert_obj_three](https://github.com/mrdoob/three.js/blob/master/utils/converters/obj/convert_obj_three.py)

Distributed through [Makesites.org](http://makesites.org/)

Released under the [MIT license](http://makesites.org/licenses/MIT)
