
// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
scene.add(light);

// Ground
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshStandardMaterial({ color: 0x228822 })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Cube (test object)
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(2, 2, 2),
  new THREE.MeshStandardMaterial({ color: 0xff0000 })
);
cube.position.set(0, 1, -10);
scene.add(cube);

// Player position
let player = new THREE.Vector3(0, 2, 5);

// Movement
const keys = {};
document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// Mouse look
let yaw = 0;
let pitch = 0;

document.body.addEventListener("click", () => {
  document.body.requestPointerLock();
});

document.addEventListener("mousemove", (e) => {
  if (document.pointerLockElement === document.body) {
    yaw -= e.movementX * 0.002;
    pitch -= e.movementY * 0.002;
    pitch = Math.max(-1.5, Math.min(1.5, pitch));
  }
});

// Mode toggle
let mode = "fps";
document.addEventListener("keydown", e => {
  if (e.key.toLowerCase() === "f") {
    mode = mode === "fps" ? "free" : "fps";
  }
});

// Shooting
const bullets = [];

document.addEventListener("keydown", e => {
  if (e.key.toLowerCase() === "e") {
    shoot();
  }
});

function shoot() {
  const bullet = new THREE.Mesh(
    new THREE.SphereGeometry(0.1),
    new THREE.MeshBasicMaterial({ color: 0xffff00 })
  );

  const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);

  bullet.position.copy(camera.position);
  bullet.userData.dir = dir;

  scene.add(bullet);
  bullets.push(bullet);
}

// Update bullets
function updateBullets() {
  bullets.forEach(b => {
    b.position.add(b.userData.dir.clone().multiplyScalar(1));
  });
}

// Movement logic
function updateMovement() {
  const speed = 0.2;

  const forward = new THREE.Vector3(
    -Math.sin(yaw),
    0,
    -Math.cos(yaw)
  );

  const right = new THREE.Vector3(
    Math.cos(yaw),
    0,
    -Math.sin(yaw)
  );

  if (keys["w"]) player.add(forward.clone().multiplyScalar(speed));
  if (keys["s"]) player.add(forward.clone().multiplyScalar(-speed));
  if (keys["a"]) player.add(right.clone().multiplyScalar(-speed));
  if (keys["d"]) player.add(right.clone().multiplyScalar(speed));

  camera.position.copy(player);
}

// Camera look
function updateCamera() {
  camera.rotation.order = "YXZ";
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;
}

// Render loop
function animate() {
  requestAnimationFrame(animate);

  updateMovement();
  updateCamera();
  updateBullets();

  renderer.render(scene, camera);
}

animate();
