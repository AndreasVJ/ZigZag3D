// Scene and camera
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)


const playerSize = 0.25
const cubeSize = 1

let currentCubeIndex = 0

const playerSpeed = 5
const cameraSpeed = playerSpeed/2

const pathLength = 500

let cameraDistance = 5

let cameraθ1 = 5*Math.PI/4
let cameraθ2 = Math.PI/6

const cameraLookOrigin = new THREE.Vector3(0, (cubeSize+playerSize)/2, 0)
const cameraLookPoint = new THREE.Vector3(0, (cubeSize+playerSize)/2, 0)
let cameraLerpAlpha = 0

let playerVelVec

// Renderer
const renderer = new THREE.WebGLRenderer({alpha: true})
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// Light
const ambientLight = new THREE.AmbientLight( 0x505050 )
scene.add(ambientLight);

const light = new THREE.DirectionalLight(0xFFFFFF, 1)
light.position.set(-50, 100, 0)
scene.add(light)


// Player
const playerGeometry = new THREE.BoxGeometry(playerSize, playerSize, playerSize)
const playerMaterial = new THREE.MeshPhysicalMaterial({ color: "orange" })
const player = new THREE.Mesh(playerGeometry, playerMaterial)
player.position.y = (cubeSize+playerSize)/2
player.name = "player"
scene.add(player)


// Add cubes
const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize)
const cubeMaterial = new THREE.MeshPhongMaterial({color: 0x00ff00})
let cubes = []

function createPath() {
	cubes = []
	cubes.push(new THREE.Mesh(cubeGeometry, cubeMaterial))
	cubes[0].name = "cube0"
	scene.add(cubes[0])
	
	for (let i = 0; i < pathLength; i++) {
		const cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
		if (Math.round(Math.random())) {
			cube.position.x = cubes[cubes.length - 1].position.x + 1
			cube.position.z = cubes[cubes.length - 1].position.z
		}
		else {
			cube.position.x = cubes[cubes.length - 1].position.x
			cube.position.z = cubes[cubes.length - 1].position.z + 1
		}
		cube.name = "cube" + i+1
		cubes.push(cube)
		scene.add(cubes[i+1])
	}
	playerVelVec = new THREE.Vector3(cubes[1].position.x ? playerSpeed : 0, 0, cubes[1].position.z ? playerSpeed : 0)  
}

function deletePath() {
	for (let cube of cubes) {
		let selectedCube = scene.getObjectByName(cube.name)
    	scene.remove(selectedCube)
	}
}


window.addEventListener('resize', () => {

    // Update camera
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

	renderer.render(scene, camera)
	
})


// Key presses
function keyPress(event) {
	if (event.key == " ") {
		if (gameStarted) {
			if (playerVelVec.x) {
				playerVelVec = new THREE.Vector3(0, 0, playerSpeed)
			}
			else {
				playerVelVec = new THREE.Vector3(playerSpeed, 0, 0)
			}
		}
		else {
			gameStarted = true
			animateGame()
		}
	}
}


document.addEventListener('keypress', keyPress)

const clock = new THREE.Clock()

let gameStarted = false
let gameOver = false


function repositionCamera() {
	camera.position.x = player.position.x + cameraDistance*Math.cos(cameraθ1)*Math.cos(cameraθ2)
	camera.position.y = player.position.y + cameraDistance*Math.sin(cameraθ2)
	camera.position.z = player.position.z + cameraDistance*Math.sin(cameraθ1)*Math.cos(cameraθ2)

	camera.lookAt(cameraLookPoint)
}

repositionCamera()


function animateGame() {
	if (!gameOver) {

		const Δt = clock.getDelta()

		// Move player and camera
		player.position.addScaledVector(playerVelVec, Δt)
		camera.position.addScaledVector(new THREE.Vector3(cameraSpeed, 0, cameraSpeed), Δt)
		cameraLookPoint.addScaledVector(new THREE.Vector3(cameraSpeed, 0, cameraSpeed), Δt)

		const playerToCameraLookPoint = cameraLookPoint.distanceTo(new THREE.Vector3(player.position.x, player.position.y, player.position.z))


		if (playerToCameraLookPoint > camera.aspect) {
			const v = playerToCameraLookPoint - camera.aspect
			if (player.position.x - cameraLookPoint.x > 0) {
				camera.position.addScaledVector(new THREE.Vector3(cameraSpeed*v, 0, -cameraSpeed*v), Δt)
				cameraLookPoint.addScaledVector(new THREE.Vector3(cameraSpeed*v, 0, -cameraSpeed*v), Δt)
			}
			else {
				camera.position.addScaledVector(new THREE.Vector3(-cameraSpeed*v, 0, cameraSpeed*v), Δt)
				cameraLookPoint.addScaledVector(new THREE.Vector3(-cameraSpeed*v, 0, cameraSpeed*v), Δt)
			}
		}
		
		camera.lookAt(cameraLookPoint)

		// Check if player falls off the cubes
		if (player.position.x + playerSize/2 > cubes[currentCubeIndex].position.x + cubeSize/2) {
			if (cubes[currentCubeIndex+1].position.x > cubes[currentCubeIndex].position.x) {
				currentCubeIndex++
			}
			else if (player.position.x - playerSize/2 > cubes[currentCubeIndex].position.x + cubeSize/2){
				gameOver = true
				document.removeEventListener('keypress', keyPress)
			}
		}
		if (player.position.z + playerSize/2 > cubes[currentCubeIndex].position.z + cubeSize/2) {
			if (cubes[currentCubeIndex+1].position.z > cubes[currentCubeIndex].position.z) {
				currentCubeIndex++
			}
			else if (player.position.z - playerSize/2 > cubes[currentCubeIndex].position.z + cubeSize/2) {
				gameOver = true
				document.removeEventListener('keypress', keyPress)
			}
		}


		renderer.render(scene, camera)
		
		requestAnimationFrame(animateGame)
	}
	else {
		animateGameOver()
	}

}

function animateGameOver() {
	const Δt = clock.getDelta()
	playerVelVec.y -= 20 * Δt
	player.position.addScaledVector(playerVelVec, Δt)
	renderer.render(scene, camera)
	if (player.position.y > -100) {
		requestAnimationFrame(animateGameOver)
	}
}

createPath()
renderer.render(scene, camera)
