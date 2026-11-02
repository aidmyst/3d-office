import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const host = document.querySelector('#scene');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#1b2029');
scene.fog = new THREE.Fog('#1b2029', 18, 38);

const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 70);
camera.position.set(14, 12, 18);

const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'low-power' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
renderer.shadowMap.enabled = false;
renderer.outputColorSpace = THREE.SRGBColorSpace;
host.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.5, 0);
controls.enableDamping = false;
controls.enablePan = false;
controls.minDistance = 10;
controls.maxDistance = 24;
controls.maxPolarAngle = Math.PI / 2.05;

scene.add(new THREE.HemisphereLight(0xe1e9ff, 0x34333a, 2.2));
const sun = new THREE.DirectionalLight(0xffe5c1, 2.1);
sun.position.set(-5, 10, 7);
scene.add(sun);

const mats = {
  floor: new THREE.MeshLambertMaterial({ color: 0x3a414b }),
  wall: new THREE.MeshLambertMaterial({ color: 0x252c36 }),
  trim: new THREE.MeshLambertMaterial({ color: 0x657080 }),
  desk: new THREE.MeshLambertMaterial({ color: 0x936b4e }),
  deskEdge: new THREE.MeshLambertMaterial({ color: 0xb58a65 }),
  dark: new THREE.MeshLambertMaterial({ color: 0x303641 }),
  screen: new THREE.MeshLambertMaterial({ color: 0x8fc3c0, emissive: 0x234b50 }),
  green: new THREE.MeshLambertMaterial({ color: 0xc8f169 }),
  blue: new THREE.MeshLambertMaterial({ color: 0x91a7dd }),
  coral: new THREE.MeshLambertMaterial({ color: 0xe99b82 }),
  purple: new THREE.MeshLambertMaterial({ color: 0xb5a0dd }),
  skin: new THREE.MeshLambertMaterial({ color: 0xe4b995 }),
  plant: new THREE.MeshLambertMaterial({ color: 0x91a982 })
};
const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const sphereGeo = new THREE.SphereGeometry(0.23, 8, 6);
const cylinderGeo = new THREE.CylinderGeometry(0.07, 0.09, 0.38, 6);
const addBox = (parent, material, position, scale) => {
  const mesh = new THREE.Mesh(boxGeo, material);
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  parent.add(mesh);
  return mesh;
};

addBox(scene, mats.floor, [0, -0.16, 0], [18, 0.3, 14]);
addBox(scene, mats.wall, [-8.85, 1.75, 0], [0.3, 3.5, 14]);
addBox(scene, mats.wall, [0, 1.75, -6.85], [18, 3.5, 0.3]);
addBox(scene, mats.trim, [0, 0.04, -6.65], [17.5, 0.12, 0.08]);
addBox(scene, mats.trim, [-8.67, 0.04, 0], [0.08, 0.12, 13.5]);

function makeDesk(x, z, color, name, idle = false) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  scene.add(group);
  addBox(group, mats.desk, [0, 0.92, 0], [1.9, 0.14, 1.05]);
  for (const dx of [-0.78, 0.78]) for (const dz of [-0.38, 0.38]) addBox(group, mats.dark, [dx, 0.46, dz], [0.09, 0.92, 0.09]);
  addBox(group, mats.dark, [0, 1.13, -0.3], [0.72, 0.5, 0.08]);
  addBox(group, mats.screen, [0, 1.13, -0.245], [0.59, 0.37, 0.025]);
  addBox(group, mats.dark, [0, 0.99, 0.2], [0.4, 0.025, 0.28]);
  const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.16, 6), mats.green);
  lamp.position.set(0.6, 1.18, -0.35);
  lamp.material.emissive.setHex(0x8a9e4a);
  group.add(lamp);
  const chair = new THREE.Group();
  chair.position.set(0, 0, 0.95);
  group.add(chair);
  addBox(chair, mats.dark, [0, 0.58, 0], [0.7, 0.12, 0.62]);
  addBox(chair, mats.dark, [0, 0.93, 0.28], [0.7, 0.62, 0.12]);
  addBox(chair, mats.dark, [0, 0.28, 0], [0.08, 0.5, 0.08]);
  const person = new THREE.Group();
  person.position.set(0, 1.06, 0.7);
  group.add(person);
  const shirt = new THREE.MeshLambertMaterial({ color });
  addBox(person, shirt, [0, 0.12, 0.14], [0.48, 0.42, 0.3]);
  const head = new THREE.Mesh(sphereGeo, mats.skin);
  head.position.set(0, 0.55, -0.05);
  person.add(head);
  const armL = addBox(person, shirt, [-0.29, 0.02, 0.2], [0.13, 0.36, 0.13]);
  const armR = addBox(person, shirt, [0.29, 0.02, 0.2], [0.13, 0.36, 0.13]);
  const pants = new THREE.MeshLambertMaterial({ color: 0x5d6572 });
  const makeLeg = (x) => {
    const hip = new THREE.Group();
    hip.position.set(x, -0.18, 0.12);
    person.add(hip);
    const thigh = addBox(hip, pants, [0, -0.12, 0], [0.15, 0.24, 0.18]);
    const knee = new THREE.Group();
    knee.position.set(0, -0.24, 0);
    hip.add(knee);
    const shin = addBox(knee, pants, [0, -0.12, 0], [0.14, 0.24, 0.16]);
    const foot = addBox(knee, mats.dark, [0, -0.25, -0.12], [0.14, 0.07, 0.24]);
    return { hip, knee, thigh, shin, foot };
  };
  const legL = makeLeg(-0.11);
  const legR = makeLeg(0.11);
  const frame = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.95, 0.95, 0.66)), new THREE.LineBasicMaterial({ color: 0xffffff }));
  frame.position.set(0, 0.37, 0.08);
  frame.visible = false;
  person.add(frame);
  person.userData = { name, role: name === 'Joko' ? 'Ketua Tim' : 'Anggota Tim', agentData: null };
  for (const child of person.children) child.userData = person.userData;
  return { group: person, desk: group, hitMeshes: [head, person.children[0], armL, armR, legL.thigh, legL.shin, legL.foot, legR.thigh, legR.shin, legR.foot], head, armL, armR, legL, legR, name, idle, phase: Math.random() * 6.28, frame };
}

const workers = [
  makeDesk(-6.4, -4.8, 0xc8f169, 'Joko'),
  makeDesk(-3.9, -5.7, 0x91a7dd, 'Budi'),
  makeDesk(-1.7, -5.7, 0xe99b82, 'Sari'),
  makeDesk(-3.9, -3.4, 0xb5a0dd, 'Agus'),
  makeDesk(-1.7, -3.4, 0x83b9ad, 'Rina')
];
workers[0].desk.rotation.y = -Math.PI / 2;
for (const worker of workers) {
  worker.desk.updateMatrixWorld(true);
  const worldPosition = worker.group.getWorldPosition(new THREE.Vector3());
  const worldQuaternion = worker.group.getWorldQuaternion(new THREE.Quaternion());
  scene.attach(worker.group);
  worker.homePosition = worldPosition;
  worker.homeQuaternion = worldQuaternion;
  worker.targetPosition = worldPosition.clone();
  worker.walking = false;
  worker.pauseUntil = 0;
  worker.watchingTv = false;
  worker.roamTarget = null;
  worker.nextWander = performance.now() + 400 + Math.random() * 800;
}

const gltfLoader = new GLTFLoader();
const addModel = (file, scale, position, rotY = 0) => gltfLoader.loadAsync(`assets/kenney/${file}`).then(({ scene: model }) => {
  model.scale.setScalar(scale);
  model.position.set(...position);
  model.rotation.y = rotY;
  scene.add(model);
  return model;
}).catch(() => null);

const lounge = new THREE.Group();
lounge.position.set(5.45, 0, 4.9);
scene.add(lounge);
const addLoungeModel = (file, scale, position, rotY = 0) => gltfLoader.loadAsync(`assets/kenney/${file}`).then(({ scene: model }) => {
  model.scale.setScalar(scale);
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  model.position.set(-center.x, -box.min.y, -center.z);
  const holder = new THREE.Group();
  holder.position.set(...position);
  holder.rotation.y = rotY;
  holder.add(model);
  lounge.add(holder);
}).catch(() => null);

addLoungeModel('loungeSofa.glb', 3.0, [0, 0, 0], Math.PI / 2);
addLoungeModel('cabinetTelevision.glb', 2.8, [2.8, 0, 0], -Math.PI / 2);
addLoungeModel('televisionModern.glb', 2.6, [2.8, 0.88, 0], -Math.PI / 2);
addLoungeModel('bookcaseOpen.glb', 2.0, [2.8, 0, -1.6], -Math.PI / 2);
addLoungeModel('bookcaseOpen.glb', 2.0, [2.8, 0, -2.4], -Math.PI / 2);
addModel('kitchenFridge.glb', 2.3, [6.8, 0, -6.3], 0);

const carpet = addBox(scene, mats.coral, [0.0, 0.01, 0.5], [7.5, 0.02, 4.2]);
carpet.material.transparent = true;
carpet.material.opacity = 0.15;

addBox(scene, mats.desk, [-8.4, 1.8, 1.5], [0.12, 1.2, 2.8]);
for (let i = 0; i < 5; i++) addBox(scene, mats.green, [-8.32, 1.1 + i * 0.25, 1.5], [0.08, 0.18, 2.6]);

addBox(scene, mats.dark, [-8.3, 2.85, 1.5], [0.16, 0.08, 0.3]);
const clock = addBox(scene, mats.screen, [-8.25, 2.85, 1.5], [0.04, 0.22, 0.22]);
clock.material.emissive.setHex(0x456050);

const window1 = addBox(scene, mats.blue, [-8.7, 2.2, -2.5], [0.08, 1.4, 1.6]);
window1.material.transparent = true;
window1.material.opacity = 0.3;


const resize = () => {
  const width = host.clientWidth || 1;
  const height = host.clientHeight || 1;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
};
new ResizeObserver(resize).observe(host);
resize();
document.querySelector('#focus').addEventListener('click', () => {
  camera.position.set(14, 12, 18);
  controls.target.set(0, 0.5, 0);
  controls.update();
});
const time = document.querySelector('#clock');
const activity = document.querySelector('#activity');
const connection = document.querySelector('#connection');
const modelBadge = document.querySelector('#model-badge');
const subagentList = document.querySelector('#subagent-list');
const teamActive = document.querySelector('#team-active');
const popup = document.querySelector('#agent-popup');
const popupClose = document.querySelector('#popup-close');
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hoveredWorker = null;

const updateClock = () => {
  time.textContent = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date());
};

function showAgentPopup(worker, agentData) {
  document.querySelector('#popup-avatar').textContent = worker.name[0];
  document.querySelector('#popup-name').textContent = worker.name;
  document.querySelector('#popup-role').textContent = worker.group.userData.role;
  document.querySelector('#popup-status').textContent = worker.idle ? (worker.seatedOnSofa ? 'Menonton TV' : (worker.watchingTv ? 'Menuju TV' : 'Istirahat')) : 'Bekerja';
  document.querySelector('#popup-task').textContent = agentData?.lastTool || (worker.idle ? '—' : 'Bekerja...');
  document.querySelector('#popup-model').textContent = agentData?.model || 'Tidak tersedia';
  document.querySelector('#popup-type').textContent = agentData?.type || (worker.name === 'Joko' ? 'Main Session' : 'Subagent');
  popup.hidden = false;
}

popupClose.addEventListener('click', () => { popup.hidden = true; });
host.addEventListener('mousemove', (event) => {
  const rect = host.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const allObjects = workers.flatMap(w => w.hitMeshes);
  const intersects = raycaster.intersectObjects(allObjects, false);
  let newHovered = null;
  if (intersects.length > 0) {
    const obj = intersects[0].object;
    let parent = obj;
    while (parent && !parent.userData.name) parent = parent.parent;
    if (parent && parent.userData.name) {
      newHovered = workers.find(w => w.name === parent.userData.name);
    }
  }
  if (newHovered !== hoveredWorker) {
    if (hoveredWorker) hoveredWorker.frame.visible = false;
    if (newHovered) newHovered.frame.visible = true;
    hoveredWorker = newHovered;
  }
});
host.addEventListener('click', (event) => {
  if (!popup.hidden) return;
  const rect = host.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const allObjects = workers.flatMap(w => w.hitMeshes);
  const intersects = raycaster.intersectObjects(allObjects, false);
  if (intersects.length > 0) {
    const obj = intersects[0].object;
    let parent = obj;
    while (parent && !parent.userData.name) parent = parent.parent;
    if (parent && parent.userData.name) {
      const worker = workers.find(w => w.name === parent.userData.name);
      if (worker) showAgentPopup(worker, worker.group.userData.agentData);
    }
  }
});

function renderSubagents(agents) {
  subagentList.replaceChildren();
  const entries = agents?.length ? agents.slice(0, 4) : [{ type: 'Tim', lastTool: 'Menunggu subagent', model: null }];
  const colors = ['B', 'S', 'A', 'R'];
  for (const [i, agent] of entries.entries()) {
    const row = document.createElement('div');
    row.className = 'subagent-item';
    const avatar = document.createElement('span');
    avatar.className = 'subagent-avatar';
    avatar.textContent = colors[i] || '?';
    const info = document.createElement('div');
    info.className = 'subagent-info';
    const title = document.createElement('strong');
    title.textContent = agent.type.replace(/([A-Z])/g, ' $1').trim();
    const detail = document.createElement('small');
    detail.textContent = agent.lastTool || (agent.working ? 'Bekerja...' : 'Istirahat');
    const model = document.createElement('span');
    model.className = 'model-tag';
    model.textContent = agent.model || 'model tidak tersedia';
    info.append(title, detail);
    row.append(avatar, info, model);
    subagentList.append(row);
  }
}

async function updateActivity() {
  try {
    const status = await fetch('/api/activity', { cache: 'no-store' }).then(response => response.json());
    connection.textContent = status.connected ? 'ANTIGRAVITY TERHUBUNG' : 'SESSION TIDAK DITEMUKAN';
    activity.textContent = status.lastAction || 'Menunggu aktivitas agent';
    modelBadge.textContent = status.model || 'MODEL TIDAK TERSEDIA';
    modelBadge.title = status.modelSource || '';
    teamActive.textContent = `${status.activeAgents || 0} / ${workers.length - 1}`;
    renderSubagents(status.agents);
    const agents = status.agents || [];
    for (let i = 1; i < workers.length; i++) {
      const isWorking = Boolean(agents[i - 1]?.working);
      workers[i].idle = !isWorking;
      if (isWorking) {
        workers[i].watchingTv = false;
        workers[i].seatedOnSofa = false;
        workers[i].walking = false;
        poseLegs(workers[i], 'stand', 0);
        workers[i].group.position.copy(workers[i].homePosition);
        workers[i].group.quaternion.copy(workers[i].homeQuaternion);
      }
      workers[i].group.userData.agentData = agents[i - 1] || null;
    }
    workers[0].idle = !status.working;
    workers[0].group.userData.agentData = { type: 'Main Session', lastTool: status.lastAction, model: status.model };
    if (!workers[0].idle) {
      workers[0].walking = false;
      workers[0].watchingTv = false;
      workers[0].seatedOnSofa = false;
      workers[0].group.position.copy(workers[0].homePosition);
      workers[0].group.quaternion.copy(workers[0].homeQuaternion);
    }
  } catch {
    connection.textContent = 'SERVER BELUM JALAN';
  }
}
updateClock();
updateActivity();
setInterval(updateClock, 30000);
setInterval(updateActivity, 5000);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const start = performance.now();
const STAND_HEIGHT = 0.72;
const ROAM = { minX: -7.6, maxX: 7.2, minZ: -5.6, maxZ: 6.2 };
const obstacles = workers.map(worker => {
  const center = worker.desk.getWorldPosition(new THREE.Vector3());
  const rotated = Math.abs(worker.desk.rotation.y) > 0.1;
  return { x: center.x, z: center.z, hx: rotated ? 0.53 : 0.95, hz: rotated ? 0.95 : 0.53 };
});
obstacles.push(
  { x: -8.4, z: 1.5, hx: 0.1, hz: 1.4 },
  { x: 6.8, z: -6.3, hx: 0.5, hz: 0.37 },
  { x: 5.45, z: 4.9, hx: 0.62, hz: 1.47, isSofa: true },
  { x: 8.25, z: 4.9, hx: 0.35, hz: 1.12 },
  { x: 8.25, z: 3.3, hx: 0.25, hz: 0.4 },
  { x: 8.25, z: 2.5, hx: 0.25, hz: 0.4 }
);
const BODY = 0.32;
const insideObstacle = (o, x, z) => Math.abs(x - o.x) < o.hx + BODY && Math.abs(z - o.z) < o.hz + BODY;
const blockedAt = (x, z, allowSofa = false) => x < -8.2 || x > 8.55 || z < -6.35 || z > 6.55 ||
  obstacles.some(o => (allowSofa && o.isSofa ? false : insideObstacle(o, x, z)));
const GRID = 0.3;
const GRID_X = Math.round((-8.0) / GRID);
const GRID_Z = Math.round((-6.1) / GRID);
const toCell = (x, z) => [Math.round(x / GRID) - GRID_X, Math.round(z / GRID) - GRID_Z];
const fromCell = (x, z) => [(x + GRID_X) * GRID, (z + GRID_Z) * GRID];
function findPath(start, goal, allowSofa = false) {
  const [sx, sz] = toCell(start.x, start.z);
  const [gx, gz] = toCell(goal.x, goal.z);
  const key = (x, z) => `${x},${z}`;
  const startKey = key(sx, sz), goalKey = key(gx, gz);
  const open = [{ x: sx, z: sz, g: 0, f: Math.hypot(gx - sx, gz - sz) }];
  const came = new Map(), costs = new Map([[startKey, 0]]), closed = new Set();
  const dirs = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
  const containing = obstacles.find(o => insideObstacle(o, start.x, start.z));
  const escapeDepth = (o, x, z) => Math.min(o.hx + BODY - Math.abs(x - o.x), o.hz + BODY - Math.abs(z - o.z));
  while (open.length) {
    open.sort((a, b) => a.f - b.f);
    const current = open.shift(), ck = key(current.x, current.z);
    if (closed.has(ck)) continue;
    if (ck === goalKey) {
      const path = [];
      let step = ck;
      while (step !== startKey) {
        const [x, z] = step.split(',').map(Number);
        const [wx, wz] = fromCell(x, z);
        path.push(new THREE.Vector3(wx, 0, wz));
        step = came.get(step);
        if (!step) return [];
      }
      path.reverse();
      path.push(new THREE.Vector3(goal.x, 0, goal.z));
      return path;
    }
    closed.add(ck);
    for (const [dx, dz] of dirs) {
      const x = current.x + dx, z = current.z + dz, nk = key(x, z);
      if (closed.has(nk)) continue;
      const [wx, wz] = fromCell(x, z);
      const insideHomeDesk = containing && insideObstacle(containing, wx, wz);
      const escaping = insideHomeDesk && escapeDepth(containing, wx, wz) < escapeDepth(containing, start.x, start.z);
      if (x < 0 || x > 55 || z < 0 || z > 42 || (nk !== startKey && blockedAt(wx, wz, allowSofa) && !escaping)) continue;
      const cost = current.g + (dx && dz ? 1.414 : 1);
      if (cost >= (costs.get(nk) ?? Infinity)) continue;
      came.set(nk, ck);
      costs.set(nk, cost);
      open.push({ x, z, g: cost, f: cost + Math.hypot(gx - x, gz - z) });
    }
  }
  return [];
}
function assignRoute(worker, target, allowSofa = false) {
  const path = findPath(worker.group.position, target, allowSofa);
  while (path.length && Math.hypot(path[0].x - worker.group.position.x, path[0].z - worker.group.position.z) < 0.25) path.shift();
  worker.route = path;
  worker.routeIndex = 0;
  return worker.route.length > 0;
}
const tvSpots = [
  { approach: new THREE.Vector3(6.7, 0, 4.4), seat: new THREE.Vector3(5.45, 0, 4.4) },
  { approach: new THREE.Vector3(6.7, 0, 5.4), seat: new THREE.Vector3(5.45, 0, 5.4) }
];
const tvTurn = { until: 0, watchers: [] };
function startTvTurn(now) {
  tvTurn.until = now + 60000;
  for (const worker of tvTurn.watchers) {
    if (worker.watchingTv) {
      worker.watchingTv = false;
      worker.seatedOnSofa = false;
      worker.tvPhase = null;
      worker.walking = false;
      worker.group.position.x = 6.7;
      worker.group.position.z = worker.seatTarget?.z ?? 4.9;
      worker.group.position.y = STAND_HEIGHT;
      worker.group.rotation.y = -Math.PI / 2;
      poseLegs(worker, 'stand', 0);
      worker.nextWander = now + 1200;
    }
  }
  const candidates = workers.filter(worker => worker.idle).sort(() => Math.random() - 0.5).slice(0, 2);
  tvTurn.watchers = candidates;
  candidates.forEach((worker, index) => {
    worker.watchingTv = true;
    worker.seatedOnSofa = false;
    worker.walkTarget = tvSpots[index].approach.clone();
    worker.seatTarget = tvSpots[index].seat.clone();
    worker.tvPhase = 'approach';
    worker.walking = assignRoute(worker, worker.walkTarget, false);
  });
}
function pickRoamTarget(worker, now) {
  worker.watchingTv = false;
  for (let attempt = 0; attempt < 12; attempt++) {
    const x = ROAM.minX + Math.random() * (ROAM.maxX - ROAM.minX);
    const z = ROAM.minZ + Math.random() * (ROAM.maxZ - ROAM.minZ);
    if (!blockedAt(x, z)) {
      worker.roamTarget = new THREE.Vector3(x, 0, z);
      worker.walking = assignRoute(worker, worker.roamTarget);
      worker.pauseUntil = now + 2500 + Math.random() * 4500;
      return;
    }
  }
  worker.walking = false;
  worker.nextWander = now + 1200;
}
function poseLegs(worker, mode, stride) {
  if (mode === 'sit') {
    worker.legL.hip.rotation.x = Math.PI / 2;
    worker.legR.hip.rotation.x = Math.PI / 2;
    worker.legL.knee.rotation.x = -Math.PI / 2;
    worker.legR.knee.rotation.x = -Math.PI / 2;
    return;
  }
  const swing = mode === 'walk' ? stride * 0.45 : 0;
  worker.legL.hip.rotation.x = -swing;
  worker.legR.hip.rotation.x = swing;
  worker.legL.knee.rotation.x = mode === 'walk' ? -Math.max(stride, 0) * 0.55 : 0;
  worker.legR.knee.rotation.x = mode === 'walk' ? -Math.max(-stride, 0) * 0.55 : 0;
}
function render(now) {
  requestAnimationFrame(render);
  const t = (now - start) * 0.001;
  if (now >= tvTurn.until) startTvTurn(now);
  for (const worker of workers) {
    if (worker.idle) {
      if (worker.watchingTv) {
        if (worker.tvPhase === 'approach') {
          const arrived = worker.walking ? stepTv(worker) : true;
          if (arrived) {
            worker.walking = false;
            worker.group.rotation.y = -Math.PI / 2;
            worker.tvPhase = 'sitting-down';
            worker.sitStartTime = now;
          }
        } else if (worker.tvPhase === 'sitting-down') {
          const duration = 900;
          const p = Math.min((now - worker.sitStartTime) / duration, 1.0);
          const ease = p * p * (3 - 2 * p);
          worker.group.position.x = THREE.MathUtils.lerp(6.7, worker.seatTarget.x, ease);
          worker.group.position.z = worker.seatTarget.z;
          worker.group.position.y = THREE.MathUtils.lerp(STAND_HEIGHT, 0.76, ease);
          worker.group.rotation.y = -Math.PI / 2;
          worker.legL.hip.rotation.x = THREE.MathUtils.lerp(0, Math.PI / 2, ease);
          worker.legR.hip.rotation.x = THREE.MathUtils.lerp(0, Math.PI / 2, ease);
          worker.legL.knee.rotation.x = THREE.MathUtils.lerp(0, -Math.PI / 2, ease);
          worker.legR.knee.rotation.x = THREE.MathUtils.lerp(0, -Math.PI / 2, ease);
          worker.armL.rotation.x = THREE.MathUtils.lerp(0, -0.15, ease);
          worker.armR.rotation.x = THREE.MathUtils.lerp(0, -0.15, ease);
          if (p >= 1.0) {
            worker.tvPhase = 'seated';
            worker.seatedOnSofa = true;
          }
        }
      } else {
        if (!worker.walking && now >= worker.nextWander) pickRoamTarget(worker, now);
        if (worker.walking && worker.roamTarget && !stepTowards(worker, worker.roamTarget)) {
          worker.walking = false;
          worker.nextWander = Math.max(worker.pauseUntil, now + 1800);
        }
      }

      if (worker.watchingTv && worker.seatedOnSofa) {
        worker.group.position.set(worker.seatTarget.x, 0.76, worker.seatTarget.z);
        worker.group.rotation.y = -Math.PI / 2;
        worker.head.position.y = 0.55 + Math.sin(t * 0.5 + worker.phase) * 0.012;
        worker.armL.rotation.x = -0.15;
        worker.armR.rotation.x = -0.15;
        poseLegs(worker, 'sit', 0);
      } else if (worker.tvPhase !== 'sitting-down') {
        const stride = Math.sin(worker.walkPhase || 0);
        const walking = worker.walking;
        worker.group.position.y = STAND_HEIGHT + (walking ? Math.abs(stride) * 0.035 : 0);
        const sway = walking ? 0 : Math.sin(t * 0.5 + worker.phase) * 0.04;
        worker.head.position.y = 0.55 + sway;
        worker.armL.rotation.x = walking ? stride * 0.45 : Math.sin(t * 0.6 + worker.phase) * 0.3;
        worker.armR.rotation.x = walking ? -stride * 0.45 : Math.cos(t * 0.6 + worker.phase) * 0.3;
        poseLegs(worker, walking ? 'walk' : 'stand', stride);
      }
    } else {
      worker.group.position.y = 0;
      const type = Math.sin(t * 3.5 + worker.phase) * 0.08;
      worker.head.position.y = 0.55 + type;
      worker.armL.rotation.x = Math.sin(t * 4.2 + worker.phase) * 0.6;
      worker.armR.rotation.x = Math.sin(t * 4.2 + worker.phase + 1.5) * 0.6;
      poseLegs(worker, 'sit', 0);
    }
  }
  controls.update();
  renderer.render(scene, camera);
}
const WALK_SPEED = 0.012;
function walkStep(worker, waypoint) {
  const dx = waypoint.x - worker.group.position.x;
  const dz = waypoint.z - worker.group.position.z;
  const distance = Math.hypot(dx, dz);
  if (distance < 0.12) return 'reach';
  const step = Math.min(distance, WALK_SPEED);
  worker.group.position.x += dx / distance * step;
  worker.group.position.z += dz / distance * step;
  worker.walkPhase = (worker.walkPhase || 0) + step * 9;
  const facing = Math.atan2(dx, dz) + Math.PI;
  worker.group.rotation.y = THREE.MathUtils.lerp(worker.group.rotation.y, facing, 0.18);
  return 'moving';
}
function stepTowards(worker, target) {
  const waypoint = worker.route?.[worker.routeIndex];
  if (!waypoint) return false;
  const result = walkStep(worker, waypoint);
  if (result === 'reach') {
    worker.routeIndex += 1;
    return worker.routeIndex < worker.route.length;
  }
  return true;
}
function stepTv(worker) {
  const waypoint = worker.route?.[worker.routeIndex];
  if (!waypoint) return true;
  const result = walkStep(worker, waypoint);
  if (result === 'reach') {
    worker.routeIndex += 1;
    return worker.routeIndex >= worker.route.length;
  }
  return false;
}
requestAnimationFrame(render);
