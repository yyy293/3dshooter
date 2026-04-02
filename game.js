let scene, camera, renderer;

let player = {
  velocity: new THREE.Vector3(),
  health: 100
};

let bullets = [];
let keys = {};

let yaw = 0, pitch = 0;

// Init
function initGame() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Light
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(50,100,50);
  scene.add(light);

  // Ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(1000,1000),
    new THREE.MeshStandardMaterial({ color: 0x556655 })
  );
  ground.rotation.x = -Math.PI/2;
  scene.add(ground);

  camera.position.set(0,2,5);

  animate();
}

// Controls
document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

document.body.addEventListener("click", () => document.body.requestPointerLock());

document.addEventListener("mousemove", e => {
  if (document.pointerLockElement === document.body) {
    yaw -= e.movementX * 0.002;
    pitch -= e.movementY * 0.002;
    pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, pitch));
  }
});

// Movement
function updatePlayer() {
  let forward = new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));
  let right = new THREE.Vector3(-forward.z,0,forward.x);

  if(keys['w']) player.velocity.add(forward.multiplyScalar(0.2));
  if(keys['s']) player.velocity.add(forward.multiplyScalar(-0.2));
  if(keys['a']) player.velocity.add(right.multiplyScalar(-0.2));
  if(keys['d']) player.velocity.add(right.multiplyScalar(0.2));

  if(keys[' ']) player.velocity.y = 0.2;

  player.velocity.y -= 0.01;

  camera.position.add(player.velocity);
  player.velocity.multiplyScalar(0.9);
}

// Shooting
function shoot() {
  const bullet = {
    pos: camera.position.clone(),
    dir: new THREE.Vector3(-Math.sin(yaw), -pitch, -Math.cos(yaw))
  };

  bullets.push(bullet);

  multiplayer.sendShoot(bullet.pos, bullet.dir);
}

// Fire key
setInterval(() => {
  if(keys['e']) shoot();
}, 150);

// Bullets update
function updateBullets() {
  bullets.forEach(b => {
    b.pos.add(b.dir.clone().multiplyScalar(0.8));
  });
}

// Camera
function updateCamera() {
  camera.rotation.set(pitch, yaw, 0);
}

// Render loop
function animate() {
  requestAnimationFrame(animate);

  updatePlayer();
  updateBullets();
  updateCamera();

  renderer.render(scene, camera);
}

// Start
initGame();
