
// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Light (sun)
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(100,200,100);
scene.add(light);

// Ground
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(2000,2000),
  new THREE.MeshStandardMaterial({ color: 0x556655 })
);
ground.rotation.x = -Math.PI/2;
scene.add(ground);

// Camera start
camera.position.set(0,2,5);

// Controls
const keys = {};
document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// Mouse look
let yaw = 0, pitch = 0;
document.body.addEventListener("click", () => document.body.requestPointerLock());

document.addEventListener("mousemove", e => {
  if (document.pointerLockElement === document.body) {
    yaw -= e.movementX * 0.002;
    pitch -= e.movementY * 0.002;
    pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, pitch));
  }
});

// Vehicles
let vehicles = [];
let currentVehicle = null;

// Loader
const loader = new THREE.GLTFLoader();

// Load F-14
loader.load('assets/models/f14.glb', gltf => {
  const f14 = gltf.scene;
  f14.position.set(20,5,0);
  scene.add(f14);

  vehicles.push({
    mesh: f14,
    type: "plane",
    speed: 0.5,
    entered: false
  });
});

// Load Su-34
loader.load('assets/models/su34.glb', gltf => {
  const su34 = gltf.scene;
  su34.position.set(-20,5,0);
  scene.add(su34);

  vehicles.push({
    mesh: su34,
    type: "plane",
    speed: 0.5,
    entered: false
  });
});

// Load Tank
loader.load('assets/models/tank.glb', gltf => {
  const tank = gltf.scene;
  tank.position.set(0,0,20);
  scene.add(tank);

  vehicles.push({
    mesh: tank,
    type: "tank",
    speed: 0.2,
    entered: false
  });
});

// Enter vehicle with G
document.addEventListener("keydown", e => {
  if (e.key.toLowerCase() === "g") {
    vehicles.forEach(v => {
      if (camera.position.distanceTo(v.mesh.position) < 10) {
        currentVehicle = v;
        v.entered = true;
      }
    });
  }
});

// Exit vehicle
document.addEventListener("keydown", e => {
  if (e.key.toLowerCase() === "h") {
    if (currentVehicle) {
      currentVehicle.entered = false;
      currentVehicle = null;
    }
  }
});

// Movement
function updatePlayer() {
  if (currentVehicle) return;

  let forward = new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));
  let right = new THREE.Vector3(-forward.z,0,forward.x);

  if(keys['w']) camera.position.add(forward.clone().multiplyScalar(0.3));
  if(keys['s']) camera.position.add(forward.clone().multiplyScalar(-0.3));
  if(keys['a']) camera.position.add(right.clone().multiplyScalar(-0.3));
  if(keys['d']) camera.position.add(right.clone().multiplyScalar(0.3));
}

// Vehicle control
function updateVehicle() {
  if (!currentVehicle) return;

  const v = currentVehicle.mesh;

  let forward = new THREE.Vector3(0,0,-1).applyQuaternion(v.quaternion);

  if (keys['w']) v.position.add(forward.clone().multiplyScalar(currentVehicle.speed));
  if (keys['s']) v.position.add(forward.clone().multiplyScalar(-currentVehicle.speed));

  if (currentVehicle.type === "plane") {
    if (keys['a']) v.rotation.z += 0.02;
    if (keys['d']) v.rotation.z -= 0.02;
  }

  if (currentVehicle.type === "tank") {
    if (keys['a']) v.rotation.y += 0.02;
    if (keys['d']) v.rotation.y -= 0.02;
  }
}

// Shooting
let bullets = [];

function shoot() {
  let dir = new THREE.Vector3(-Math.sin(yaw), -pitch, -Math.cos(yaw));

  bullets.push({
    pos: camera.position.clone(),
    dir: dir.normalize()
  });
}

setInterval(() => {
  if (keys['e']) shoot();
}, 150);

// Bullets update
function updateBullets() {
  bullets.forEach(b => {
    b.pos.add(b.dir.clone().multiplyScalar(1));

    vehicles.forEach(v => {
      if (b.pos.distanceTo(v.mesh.position) < 3) {
        scene.remove(v.mesh);
      }
    });
  });
}

// Rain
let rainGeo = new THREE.BufferGeometry();
let rainCount = 3000;
let rainPos = [];

for(let i=0;i<rainCount;i++){
  rainPos.push(
    (Math.random()-0.5)*500,
    Math.random()*200,
    (Math.random()-0.5)*500
  );
}

rainGeo.setAttribute("position", new THREE.Float32BufferAttribute(rainPos,3));

let rain = new THREE.Points(
  rainGeo,
  new THREE.PointsMaterial({ size:0.3 })
);

scene.add(rain);

// Camera
function updateCamera() {
  camera.rotation.set(pitch, yaw, 0);
}

// Loop
function animate() {
  requestAnimationFrame(animate);

  updatePlayer();
  updateVehicle();
  updateBullets();
  updateCamera();

  renderer.render(scene, camera);
}

animate();
