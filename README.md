# 3D-Maze
Recursive 3D Maze generator \
Sleep-function was added for dramatic effect

### Interactive Demo
https://ThomasSelvig.github.io/3D-Maze/

### Controls
|Key|Control|
|-|-|
|`R` | Toggle Autorotation|
|`Space` | Toggle fast speed|
|`.`| Start maze generation|
|`,`| Toggle wireframe mode|
|`Mouse1`|Orbit camera manually|

### Tech used
* Cytoscape (Node graphing library)
  * All node data / generation stores data with this library
* THREE.js (3D WebGL)
  * Used to render the Cytoscape nodes visually

### TODO
* Store maze "roads" as node connections
  * currently, these connections are (for simplicity) stored as nodes

### Disclaimer
This is my first project with any of these libraries, also, I only had a chromebook at my disposal. \
Wouldn't recommend debugging nor 3D rendering on a chromebook.
