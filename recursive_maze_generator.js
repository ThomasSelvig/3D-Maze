const cy = cytoscape();


// ground-zero node for debugging / testing, + initial maze_gen trigger
// maze_gen(cy.$id("gz_node"))
cy.add({
	group: "nodes",
	data: {id: "gz_node", color: 0x00ff00, opacity: .75},  // leave out ID field, this is just for debugging atm
	position: {x: 10, y: 10, z: 10}
});

function _choose(choices) {
	var index = Math.floor(Math.random() * choices.length);
	return choices[index];
}

function set_index(node) {
	// clear index-flag from any node that might have it
	for (let i of cy.nodes()) {
		if (i.data("is_index")) {
			i.data("is_index", false);
		}
	}
	// set index-flag for node
	node.data("is_index", true);
}

async function node_at(tx, ty, tz, border={x: [0, 21], y: [0, 21], z: [0, 21]}) {  // {x: [6, 15], y: [6, 15], z: [6, 15]}
	// will return undefined if there's no node there
	// if there's no node there but there should be (it's within maze_area (border)) then add a node
	
	const nodes_found = cy.filter((ele, i) => {
		let {x, y, z} = ele.position();
		if ([ [tx, x], [ty, y], [tz, z] ].every(v => v[0] == v[1])) {return ele;}
	});
	
	if (nodes_found.length) {
		// at least one node found for this position, return the first one
		const node = nodes_found[0];
		let {x, y, z} = node.position();
		if ([[x, border.x], [y, border.y], [z, border.z]].every(v => v[0] >= v[1][0] && v[0] <= v[1][1]-1)) {
			return node;  // check that node found is within border
		}
	}
	else if ([[tx, border.x], [ty, border.y], [tz, border.z]].every(v => v[0] >= v[1][0] && v[0] <= v[1][1]-1)) {
		// this execs if there's no node but there should be one (tx, ty, tz) is within "border"
		// make a node and return it
		//console.log(`node_at: generated @ ${tx} ${ty} ${tz}`);
		const return_node = cy.add({group: "nodes", position: {x: tx, y: ty, z: tz}});
		
		// - animation stuff involving sleeping -
		
		set_index(return_node);
		// update meshes, sleep, and return generated node
		update_all_nodes();
		await new Promise(r => setTimeout(r, ANIMATION_DELAY));
		return return_node;
	}
}

async function unvisited_neighbours(node, border=undefined) {
	// https://stackoverflow.com/questions/12303989/cartesian-product-of-multiple-arrays-in-javascript
	//const cartesian = (...a) => a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));
	// was thinking of doing cartesian([-1, 0, 1], [-1, 0, 1], [-1, 0, 1])
	//		to get all sides of a node but I'm only going to use six sides, not 26
	const unvisited = [];
	for (let offset_dir of "xyz") {
		for (let offset of [-2, 2]) {
			// set pos to the coordinate of a neighbouring node
			const pos = {...node.position()};  // shallow copy to prevent pos mod of original node
			pos[offset_dir] += offset;
			
			let {x, y, z} = pos;
			let n = await node_at(x, y, z, border=border);
			if (n) {
				// n (neighbour) is a node\\\
				if (!n.data("visited")) {
					unvisited.push(n);
					// set node to visited in the maze_gen function, not here
				}
			}
		}
	}
	return unvisited
}

async function maze_gen(node, border=undefined) {
	node.data("visited", true);
	while ((nodes = await unvisited_neighbours(node, border=border)).length) {
		// pick a random unvisited neighbour
		const node_i = _choose(nodes);
		// draw a road by adding an edge between the nodes
		//cy.add({group: "edges", data: {source: node, target: node_i}})
		// nevermind, i can't be bothered, I'm doing it here instead by adding a "road" node
		const node_vector = new THREE.Vector3(...Object.values(node.position()));
		const node_i_vector = new THREE.Vector3(...Object.values(node_i.position()));
		const road_offset = node_i_vector.sub(node_vector);
		const road_pos = [..."xyz"].map(v => Math.floor(road_offset[v] / 2 + node.position(v)));
		
		const road_node = await node_at(...road_pos);
		road_node.data("type", "road");
		//cy.add({group: "nodes", data: {type: "road"}, position: {x: road_pos[0], y: road_pos[1], z: road_pos[2]}});
		
		// maze_gen from here
		await maze_gen(node_i);
	}
}
