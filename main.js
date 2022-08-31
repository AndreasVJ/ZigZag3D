// Scene and camera
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

const playerSize = 0.25
const cubeSize = 1

let currentCubeIndex = 0

const speed = 5

let cameraDistance = 4

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


// Player
const playerGeometry = new THREE.BoxGeometry(playerSize, playerSize, playerSize)
const playerMaterial = new THREE.MeshPhongMaterial({color: 0xffff00})
const player = new THREE.Mesh(playerGeometry, playerMaterial)
scene.add(player)

player.position.y = (cubeSize+playerSize)/2


// Add cubes
const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize)
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
	scene.add(cubes[i])
}

let direction = cubes[1].position.x ? false : true
let v = new THREE.Vector3(0, 0, 0)


function calculateCameraθ1(num) {
	let x = z = 0
	for (let i = currentCubeIndex+1; i < currentCubeIndex + num+1; i++) {
		x += cubes[i].position.x - cubes[i-1].position.x
		z += cubes[i].position.z - cubes[i-1].position.z
	}
	cameraθ1 = 5*Math.PI/4 + Math.PI/4*((x-z)/num)
	console.log(Math.PI/4*((x-z)/num), x, z)
}

// calculateCameraθ1(10)


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


// Key presses
function keyPress(event) {
	if (event.key == " ") {
		direction = !direction
		if (direction) {
			v = new THREE.Vector3(speed, 0, 0)
		}
		else {
			v = new THREE.Vector3(0, 0, speed)
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
		cameraDistance -= 0.5
	}
	if (event.key == "e") {
		cameraDistance += 0.5
	}
}


document.addEventListener('keypress', keyPress)

const clock = new THREE.Clock()

let gameOver = false

const animate = function () {
	requestAnimationFrame(animate)

	Δt = clock.getDelta()

	player.position.addScaledVector(v, Δt)


	if (!gameOver) {
		// Check if player falls off the cubes
		if (player.position.x - playerSize - (cubeSize-playerSize)/2 > cubes[currentCubeIndex].position.x) {
			if (cubes[currentCubeIndex+1].position.x > cubes[currentCubeIndex].position.x) {
				currentCubeIndex++
			}
			else {
				gameOver = true
				document.removeEventListener('keypress', keyPress)
			}
		}
		if (player.position.z - playerSize - (cubeSize-playerSize)/2 > cubes[currentCubeIndex].position.z) {
			if (cubes[currentCubeIndex+1].position.z > cubes[currentCubeIndex].position.z) {
				currentCubeIndex++
			}
			else {
				gameOver = true
				document.removeEventListener('keypress', keyPress)
			}
		}
		
		repositionCamera()
	}
	else {
		v.y -= 20 * Δt
	}

	renderer.render(scene, camera)
}

animate()