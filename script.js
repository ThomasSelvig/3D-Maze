var ANIMATION_DELAY = 100;  // sleep length
var ANIMATION_DELAY_ALT = 25;

// setup scene, camera, renderer, and orbiting controls
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x4ad188)

const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.autoRotate = true;

// add wireframe border
// const _maze_area_geo = new THREE.BoxGeometry(width=21, height=21, depth=21);
// const maze_area = new THREE.Mesh(
// 	_maze_area_geo,
// 	new THREE.MeshBasicMaterial({wireframe: true, color: 0xff0000})
// );

const _maze_area_geo = new THREE.EdgesGeometry(new THREE.BoxBufferGeometry(21, 21, 21));
const maze_area = new THREE.LineSegments(
	_maze_area_geo,
	new THREE.LineBasicMaterial({color: 0xffffff})
);
// make the objects in maze_area use bottom left inner corner as (0, 0, 0)
_maze_area_geo.applyMatrix4(new THREE.Matrix4().makeTranslation(10, 10, 10))
//maze_area.position.set(11, 11, 11)
maze_area.position.set(-10, -10, -10);  // to center camera on the middle of maze_area
scene.add(maze_area)

// todo: add lighting, this doesn't work for some reason Æ

// move camera out of "cube"
camera.position.z = 20;
controls.update();  // needs to be called after camera transformation

function update_mesh(node) {
	if (node.data("mesh_obj")) {
		// this node already has a 3d mesh assigned to it, update it's data
		let {x, y, z} = node.position();
		node.data("mesh_obj").position.set(x, y, z);  // edit mesh location to match node data
		// console.log(`Updated mesh for node @ (${x} ${y} ${z})`)
	}
	else {
		// this node has no 3d mesh, make one and append it to node.data("mesh_obj", *data*)
		if (true) {  // this bool represents "use cube model"
			// cube model
			node.data("mesh_obj", new THREE.Mesh(
				new THREE.BoxGeometry(),
				new THREE.MeshBasicMaterial({transparent: true})
			));
		}
		else {
			// wireframe model
			node.data("mesh_obj", new THREE.LineSegments(
				new THREE.EdgesGeometry(new THREE.BoxBufferGeometry()),
				new THREE.LineBasicMaterial({color: 0xffffff})
			));
		}
		let {x, y, z} = node.position();
		node.data("mesh_obj").position.set(x, y, z);  // edit mesh location to match node data
		maze_area.add(node.data("mesh_obj"));
		
		// console.log(`Added mesh for node @ (${x} ${y} ${z})`);
	}
	
	const mat = node.data("mesh_obj").material;
	
	if (node.data("type") && node.data("type") == "road") {
		// if it's a road
		mat.color.set(0x008b70);  // make roads slightly more cyan than nodes
		mat.opacity = .5;
	}
	else if (node.data("visited")) {
		// if it's visited, make it red and more opaque
		mat.color.set(0x008b8b);
		mat.opacity = .5;
	}
	else {
		// if it's just a default one
		mat.color.set(0x404040);
		mat.opacity = .025;
	}
	
	if (node.data("is_index")) {
		mat.color.set(0xff0000);
		mat.opacity = 1;
	}
	
	// color override
	if (c = node.data("color")) {  // update color if it's defined
		mat.color.set(c);
	}
	
	// opacity override
	if (o = node.data("opacity")) {  // update opacity if it's defined
		mat.opacity = c;
	}
}

function update_all_nodes() {
	for (let node of cy.nodes()) {
		update_mesh(node);
	}
}

document.addEventListener("keydown", (e) => {
	if (e.code == "Comma") {
		for (let node of cy.nodes()) {
			//console.log("toggled wireframe");
			if (m = node.data("mesh_obj")) {
				m.material.wireframe = !m.material.wireframe;
			}
		}
	}
	// if (e.code == "Period") {
	// 	maze_gen(cy.$id("gz_node"));
	// 	update_all_nodes();
	// }
	if (e.code == "Space") {
		// swap variables
		[ANIMATION_DELAY, ANIMATION_DELAY_ALT] = [ANIMATION_DELAY_ALT, ANIMATION_DELAY];
	}
	if (e.code == "KeyR") {
		controls.autoRotate = !controls.autoRotate;
	}
}, false);

// last changes before anim loop
update_all_nodes();
maze_gen(cy.$id("gz_node"));
update_all_nodes();

// main render loop
function animate() {
	requestAnimationFrame(animate);
	
	controls.update()
	
	renderer.render(scene, camera);
}

animate();