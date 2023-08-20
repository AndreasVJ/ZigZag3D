const gameResultMenu = document.getElementById("game-result-menu")
const gameResultText = document.getElementById("game-result-text")
const progressBar = document.getElementById("progress-bar")


const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)


let clock = new THREE.Clock()

let audio

let gameStarted = false
let gameOver = false
let gameWon = false

const playerSize = 0.25
const cubeSize = 1

let currentCubeIndex = 0

let playerSpeed
let cameraSpeed

let cameraDistance = 5

let cameraθ1 = 5*Math.PI/4
let cameraθ2 = Math.PI/6

const cameraLookPoint = new THREE.Vector3(0, (cubeSize+playerSize)/2, 0)

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
const playerGeometry = new THREE.SphereGeometry(playerSize, 64, 64)
let playerMaterial = new THREE.MeshPhysicalMaterial({ color: 0x7c048f })
const player = new THREE.Mesh(playerGeometry, playerMaterial)
player.name = "player"
scene.add(player)



// Add cubes
const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize)
let cubeMaterial = new THREE.MeshPhongMaterial({color: 0xe6c69e})
let cubes = []

const goalGeometry = new THREE.BoxGeometry(cubeSize*9, cubeSize, cubeSize*9)
const goal = new THREE.Mesh(goalGeometry, cubeMaterial)
scene.add(goal)

// Particles
let particles
const textureLoader = new THREE.TextureLoader()


function addParticles(image, numParticles, size, speed) {
	
	const particleGeometry = new THREE.BufferGeometry()

	let particlePositions = []
	let particleVelocities = []
	
	for (let i = 0; i < numParticles; i++) {
		particlePositions.push(camera.position.x + Math.random() * 20, Math.random() * 10, camera.position.z + Math.random() * 20)

		particleVelocities.push((Math.random() - 0.5) * 2, -speed, (Math.random() - 0.5) * 2);
	}

	particleGeometry.setAttribute("position", new THREE.Float32BufferAttribute(particlePositions, 3))
	particleGeometry.setAttribute("velocity", new THREE.Float32BufferAttribute(particleVelocities, 3))

	const particleMaterial = new THREE.PointsMaterial({
		size : size,
		map: textureLoader.load(image),
		blending: THREE.AdditiveBlending,
		depthTest: false,
		transparent: true,
		opacity: 0.7
	})

	particles = new THREE.Points(particleGeometry, particleMaterial)
	particles.frustumCulled = false
	particles.name = "particles"
	scene.add(particles)
}


function deleteParticles() {

	let particleObject = scene.getObjectByName("particles")
	scene.remove(particleObject)
	renderer.render(scene, camera)
}


function updateParticles(Δt) {

	for (let i = 0; i < particles.geometry.attributes.position.array.length; i += 3) {
		particles.geometry.attributes.position.array[i] += particles.geometry.attributes.velocity.array[i] * Δt
		particles.geometry.attributes.position.array[i + 1] += particles.geometry.attributes.velocity.array[i + 1] * Δt
		particles.geometry.attributes.position.array[i + 2] += particles.geometry.attributes.velocity.array[i + 2] * Δt

		if (particles.geometry.attributes.position.array[i + 1] < -5) {
			particles.geometry.attributes.position.array[i] = camera.position.x + Math.random() * 20
			particles.geometry.attributes.position.array[i + 1] = Math.random() * 5
			particles.geometry.attributes.position.array[i + 2] = camera.position.z + Math.random() * 20
		}

	}

	particles.geometry.attributes.position.needsUpdate = true

}


function resetGame() {

	clock = new THREE.Clock()

	player.position.x = 0
	player.position.y = (cubeSize/2+playerSize)
	player.position.z = 0

	camera.position.x = player.position.x + cameraDistance*Math.cos(cameraθ1)*Math.cos(cameraθ2)
	camera.position.y = player.position.y + cameraDistance*Math.sin(cameraθ2)
	camera.position.z = player.position.z + cameraDistance*Math.sin(cameraθ1)*Math.cos(cameraθ2)

	cameraLookPoint.x = 0
	cameraLookPoint.y = (cubeSize/2+playerSize)
	cameraLookPoint.z = 0

	camera.lookAt(cameraLookPoint)

	currentCubeIndex = 0
}


function deletePath() {
	for (let cube of cubes) {
		let selectedCube = scene.getObjectByName(cube.name)
    	scene.remove(selectedCube)
	}
}


function generatePath(path) {

	deletePath()

	cubes = []
	cubes.push(new THREE.Mesh(cubeGeometry, cubeMaterial))
	cubes[0].name = "cube0"
	scene.add(cubes[0])
	
	for (let i = 0; i < path.length; i++) {
		const cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
		if (path[i] == "1") {
			cube.position.x = cubes[cubes.length - 1].position.x + 1
			cube.position.z = cubes[cubes.length - 1].position.z
		}
		else {
			cube.position.x = cubes[cubes.length - 1].position.x
			cube.position.z = cubes[cubes.length - 1].position.z + 1
		}
		cube.name = "cube" + i + 1
		cubes.push(cube)
		scene.add(cubes[i+1])
	}

	goal.position.x = cubes[cubes.length - 1].position.x
	goal.position.z = cubes[cubes.length - 1].position.z
	if (cubes[cubes.length - 1].position.x > cubes[cubes.length - 2].position.x) {
		goal.position.x += 4.5
	}
	else {
		goal.position.z += 4.5
	}

	playerVelVec = new THREE.Vector3(cubes[1].position.x ? playerSpeed : 0, 0, cubes[1].position.z ? playerSpeed : 0)  
}

cubes = []
cubes.push(new THREE.Mesh(cubeGeometry, cubeMaterial))
cubes[0].name = "cube0"
scene.add(cubes[0])


function generateRandomPath(length) {

	deletePath()

	cubes = []
	cubes.push(new THREE.Mesh(cubeGeometry, cubeMaterial))
	cubes[0].name = "cube0"
	scene.add(cubes[0])
	
	for (let i = 0; i < length; i++) {
		const cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
		// if (Math.round(Math.random())) {
		if (1) {
			cube.position.x = cubes[cubes.length - 1].position.x + 1
			cube.position.z = cubes[cubes.length - 1].position.z
		}
		else {
			cube.position.x = cubes[cubes.length - 1].position.x
			cube.position.z = cubes[cubes.length - 1].position.z + 1
		}
		cube.name = "cube" + i + 1
		cubes.push(cube)
		scene.add(cubes[i+1])
	}

	playerVelVec = new THREE.Vector3(cubes[1].position.x ? playerSpeed : 0, 0, cubes[1].position.z ? playerSpeed : 0)  
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


let a = "1"

let s = ""

prev = 0


// Key presses
function handleInput() {
	if (gameStarted) {
		if (!gameOver) {
			if (a == "1") {
				a = "0"
			}
			else {
				a = "1"
			}
			if (playerVelVec.x) {
				playerVelVec = new THREE.Vector3(0, 0, playerSpeed)
			}
			else {
				playerVelVec = new THREE.Vector3(playerSpeed, 0, 0)
			}
		}
	}
	else {
		gameStarted = true
		animateGame()
		audio.play()
	}
}

document.addEventListener('keypress', handleInput)
renderer.domElement.addEventListener("touchstart", handleInput)


function animateGame() {
	if (!gameOver) {

		const Δt = clock.getDelta()

		updateParticles(Δt)

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

		
		// Check if player falls off the cubes
		if (player.position.x + playerSize/2 > cubes[currentCubeIndex].position.x + cubeSize/2) {
			if (cubes[currentCubeIndex+1].position.x > cubes[currentCubeIndex].position.x) {
				currentCubeIndex++
				if (currentCubeIndex == cubes.length - 1) {
					gameOver = true
					gameWon = true
				}
			}
			else if (player.position.x - playerSize/3 > cubes[currentCubeIndex].position.x + cubeSize/2){
				gameOver = true
			}
		}
		if (!gameOver && player.position.z + playerSize/2 > cubes[currentCubeIndex].position.z + cubeSize/2) {
			if (cubes[currentCubeIndex+1].position.z > cubes[currentCubeIndex].position.z) {
				currentCubeIndex++
				if (currentCubeIndex == cubes.length - 1) {
					gameOver = true
					gameWon = true
				}
			}
			else if (player.position.z - playerSize/2 > cubes[currentCubeIndex].position.z + cubeSize/2) {
				gameOver = true
			}
		}


		// if (prev != currentCubeIndex) {
			// s += a
			// console.log(s)
		// }

		prev = currentCubeIndex

		progressBar.style.width = (currentCubeIndex / cubes.length * 100).toString() + "%"


		renderer.render(scene, camera)
		
		requestAnimationFrame(animateGame)
	}
	else if (!gameWon) {
		animateGameOver()
		audio.pause()
		audio.currentTime = 0
		gameResultText.innerText = "Game Over"
	}
	else {
		gameResultText.innerText = "You Won"
		animateGameWon()
	}

}

function animateGameOver() {
	const Δt = clock.getDelta()
	playerVelVec.y -= 20 * Δt
	player.position.addScaledVector(playerVelVec, Δt)
	renderer.render(scene, camera)
	if (player.position.y > -30) {
		requestAnimationFrame(animateGameOver)
	}
	else {
		gameResultMenu.style.display = "flex"
	}
}

function animateGameWon() {
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

	renderer.render(scene, camera)

	const lastCubePosition = cubes[cubes.length - 1].position

	if (player.position.distanceTo(new THREE.Vector3(lastCubePosition.x, lastCubePosition.y, lastCubePosition.z)) < 3) {
		requestAnimationFrame(animateGameWon)
	}
	else {
		gameResultMenu.style.display = "flex"
	}

}
