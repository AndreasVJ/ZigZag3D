// Scene and camera
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

let cameraDistance = 5

let cameraθ1 = 5*Math.PI/4
let cameraθ2 = Math.PI/4

// Renderer
const renderer = new THREE.WebGLRenderer({alpha: true})
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// Light
const ambient_light = new THREE.AmbientLight( 0x505050 )
scene.add(ambient_light);

const light = new THREE.DirectionalLight(0xFFFFFF, 1)
scene.add(light)

// Axes
const axesHelper = new THREE.AxesHelper(5)
scene.add(axesHelper)

// Player
const playerGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)
const playerMaterial = new THREE.MeshPhongMaterial({color: 0xffff00})
const player = new THREE.Mesh(playerGeometry, playerMaterial)
scene.add(player)

player.position.y = 0.75


// Add cubes
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshPhongMaterial({color: 0x00ff00})

const cubes = [new THREE.Mesh(geometry, material)]
scene.add(cubes[0])

for (let i = 0; i < 500; i++) {
	const cube = new THREE.Mesh(geometry, material)
	if (Math.round(Math.random())) {
		cube.position.x = cubes[cubes.length - 1].position.x + 1
		cube.position.z = cubes[cubes.length - 1].position.z
	}
	else {
		cube.position.x = cubes[cubes.length - 1].position.x
		cube.position.z = cubes[cubes.length - 1].position.z + 1
	}
	cubes.push(cube)
	scene.add(cube)
}



function repositionCamera() {
	camera.position.x = player.position.x + cameraDistance*Math.cos(cameraθ1)*Math.cos(cameraθ2)
	camera.position.y = player.position.y + cameraDistance*Math.sin(cameraθ2)
	camera.position.z = player.position.z + cameraDistance*Math.sin(cameraθ1)*Math.cos(cameraθ2)

	camera.lookAt(player.position)
}

function repositionLight() {
	light.position.x = player.position.x - 50
	light.position.y = player.position.y + 100
	light.position.z = player.position.z + 20

	light.target.position.set(player.position.x, player.position.y, player.position.z)
}

repositionCamera()
repositionLight()


window.addEventListener('resize', () => {

    // Update camera
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})


camera.lookAt(player.position)


a = false
v = new THREE.Vector3(0, 0, 0)

// Key presses
function keyPress(event) {
	if (event.key == " ") {
		a = !a
		if (a) {
			v = new THREE.Vector3(5, 0, 0)
		}
		else {
			v = new THREE.Vector3(0, 0, 5)
		}
	}
	if (event.key == "a") {
		cameraθ1 += 0.1
	}
	if (event.key == "d") {
		cameraθ1 -= 0.1
	}
	if (event.key == "w") {
		cameraθ2 += 0.1
	}
	if (event.key == "s") {
		cameraθ2 -= 0.1
	}
	if (event.key == "q") {
		cameraDistance -= 0.1
	}
	if (event.key == "e") {
		cameraDistance += 0.1
	}
}


document.addEventListener('keypress', event => keyPress(event))

const clock = new THREE.Clock()

const animate = function () {
	requestAnimationFrame(animate)

	Δt = clock.getDelta()

	player.position.addScaledVector(v, Δt)

	repositionCamera()
	// repositionLight()

	renderer.render(scene, camera)
}

animate()