import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- THREE.JS CLINICAL 3D VIEWER ---
let scene, camera, renderer, controls;
let container;
let horseGroup, cowGroup, activeAnimalGroup;
let raycaster, mouse;
let hotspots = [];
let targetCameraPos = null;
let targetLookAt = null;

const HOTSPOT_DATA = {
  ortopedia: {
    title: 'Carpo y Menudillo (Mano Izquierda)',
    desc: 'Región crítica en caballos de deporte y paso fino. Frecuente en tendinitis flexora, periostitis y sinovitis.',
    coords: new THREE.Vector3(-0.65, 1.35, 0.75),
    color: 0xf43f5e, // rose
    camPos: new THREE.Vector3(-2.2, 1.4, 1.8),
    camLook: new THREE.Vector3(-0.65, 1.2, 0.75),
    tag: 'Ortopedia / Podología'
  },
  colico: {
    title: 'Fosa Paralumbar y Flanco Derecho',
    desc: 'Punto auscultatorio del ciego y válvula ileocecal. Evaluación de motilidad, timpanismo y dolor abdominal por cólico.',
    coords: new THREE.Vector3(0.85, 2.05, -0.35),
    color: 0xf59e0b, // amber
    camPos: new THREE.Vector3(2.6, 2.3, 0.4),
    camLook: new THREE.Vector3(0.6, 2.0, -0.35),
    tag: 'Clínica / Síndrome Abdominal'
  },
  dental: {
    title: 'Arcada Maxilar y Senos Paranasales',
    desc: 'Evaluación de puntas de esmalte en premolares/molares, diastemas, sarro y fístulas orosinusales.',
    coords: new THREE.Vector3(0.0, 3.25, 2.2),
    color: 0xa855f7, // purple
    camPos: new THREE.Vector3(0.0, 3.4, 3.9),
    camLook: new THREE.Vector3(0.0, 3.1, 2.0),
    tag: 'Odontología Equina'
  },
  dorso: {
    title: 'Cruz y Región Tóraco-Lumbar',
    desc: 'Evaluación del ligamento supraespinoso, atrofia muscular por mala montura y lesiones de columna.',
    coords: new THREE.Vector3(0.0, 2.55, 0.35),
    color: 0x10b981, // emerald
    camPos: new THREE.Vector3(-1.8, 3.5, 0.5),
    camLook: new THREE.Vector3(0.0, 2.4, 0.35),
    tag: 'Biomecánica y Dorso'
  },
  corvejon: {
    title: 'Corvejón Miembro Posterior Derecho',
    desc: 'Articulación tarsometatarsiana. Punto común para esparaván óseo, higroma de corvejón y distensión capsular.',
    coords: new THREE.Vector3(0.65, 1.45, -1.25),
    color: 0x0284c7, // sky
    camPos: new THREE.Vector3(2.2, 1.6, -2.1),
    camLook: new THREE.Vector3(0.65, 1.4, -1.25),
    tag: 'Ortopedia Posterior'
  }
};

export function initThreeViewer() {
  container = document.getElementById('canvas3d-container');
  if (!container) return;

  // Prevent multiple initializations
  if (renderer) return;

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x030712); // Tailwind slate-950

  // Calculate safe initial dimensions
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || Math.max(340, Math.floor(window.innerHeight * 0.7));
  const aspect = width / (height || 1);

  // Camera - Adjust FOV for vertical phone screens so the horse is completely framed
  const fov = aspect < 1.0 ? 55 : 45;
  camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 100);
  if (aspect < 1.0) {
    camera.position.set(4.5, 2.7, 4.8);
  } else {
    camera.position.set(3.8, 2.6, 4.2);
  }

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2 + 0.05; // Don't go below ground
  controls.minDistance = 1.2;
  controls.maxDistance = 12;
  controls.target.set(0, 1.8, 0);

  // Raycaster & Mouse
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  // Lighting
  setupLighting();

  // Ground and Environment Grid
  setupGround();

  // Build Procedural 3D Equine Anatomy
  horseGroup = createHorseModel();
  scene.add(horseGroup);
  activeAnimalGroup = horseGroup;

  // Hotspots / 3D Pins
  createHotspots();

  // Events
  window.addEventListener('resize', onWindowResize);
  container.addEventListener('pointerdown', onPointerDown);

  // Setup UI buttons
  setupCameraButtons();

  // Animation Loop
  animate();
}

function setupLighting() {
  // Soft ambient
  const ambientLight = new THREE.AmbientLight(0xe2e8f0, 0.7);
  scene.add(ambientLight);

  // Key light (Sun / Studio light)
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
  dirLight.position.set(5, 8, 5);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 25;
  const d = 4;
  dirLight.shadow.camera.left = -d;
  dirLight.shadow.camera.right = d;
  dirLight.shadow.camera.top = d;
  dirLight.shadow.camera.bottom = -d;
  scene.add(dirLight);

  // Rim light (Cyan clinical accent)
  const rimLight = new THREE.DirectionalLight(0x06b6d4, 1.2);
  rimLight.position.set(-5, 4, -4);
  scene.add(rimLight);

  // Bottom soft bounce
  const bounceLight = new THREE.DirectionalLight(0x0f172a, 0.5);
  bounceLight.position.set(0, -3, 0);
  scene.add(bounceLight);
}

function setupGround() {
  // Ground grid
  const gridHelper = new THREE.GridHelper(14, 28, 0x1e293b, 0x0f172a);
  gridHelper.position.y = 0.01;
  scene.add(gridHelper);

  // Floor plane for shadow receiving
  const floorGeo = new THREE.PlaneGeometry(30, 30);
  const floorMat = new THREE.ShadowMaterial({ opacity: 0.35 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Subtle circular soft shadow disc under horse
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 128;
  shadowCanvas.height = 128;
  const ctx = shadowCanvas.getContext('2d');
  const grad = ctx.createRadialGradient(64, 64, 10, 64, 64, 60);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);

  const shadowTex = new THREE.CanvasTexture(shadowCanvas);
  const shadowGeo = new THREE.PlaneGeometry(3.5, 4.5);
  const shadowMesh = new THREE.Mesh(shadowGeo, new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    opacity: 0.7,
    depthWrite: false
  }));
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = 0.02;
  scene.add(shadowMesh);
}

// --- PROCEDURAL ANATOMICAL HORSE GENERATOR ---
function createHorseModel() {
  const horse = new THREE.Group();
  horse.name = 'Equino';

  // Materials
  // Sleek warm chestnut / bay clinical material
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x5c3218, // Warm bay horse coat
    roughness: 0.55,
    metalness: 0.1,
    flatShading: false
  });

  const muscleMaterial = new THREE.MeshStandardMaterial({
    color: 0x482410,
    roughness: 0.6,
    metalness: 0.05
  });

  const hoofMaterial = new THREE.MeshStandardMaterial({
    color: 0x1c1917,
    roughness: 0.8
  });

  const jointMaterial = new THREE.MeshStandardMaterial({
    color: 0x6e3d20,
    roughness: 0.4
  });

  // 1. Ribcage / Chest (Tórax)
  const chestGeo = new THREE.CapsuleGeometry(0.55, 1.2, 8, 16);
  const chest = new THREE.Mesh(chestGeo, bodyMaterial);
  chest.rotation.x = Math.PI / 2;
  chest.position.set(0, 2.05, 0.3);
  chest.castShadow = true;
  chest.receiveShadow = true;
  horse.add(chest);

  // 2. Abdomen & Flank (Vientre / Flanco)
  const bellyGeo = new THREE.SphereGeometry(0.58, 16, 16);
  bellyGeo.scale(0.9, 0.95, 1.3);
  const belly = new THREE.Mesh(bellyGeo, bodyMaterial);
  belly.position.set(0, 1.95, -0.2);
  belly.castShadow = true;
  horse.add(belly);

  // 3. Withers (Cruz)
  const withersGeo = new THREE.ConeGeometry(0.35, 0.45, 8);
  withersGeo.scale(0.7, 1.0, 1.6);
  const withers = new THREE.Mesh(withersGeo, muscleMaterial);
  withers.position.set(0, 2.45, 0.5);
  withers.castShadow = true;
  horse.add(withers);

  // 4. Croup / Pelvis (Grupa / Cuartos traseros)
  const croupGeo = new THREE.SphereGeometry(0.62, 16, 16);
  croupGeo.scale(0.95, 0.9, 1.1);
  const croup = new THREE.Mesh(croupGeo, muscleMaterial);
  croup.position.set(0, 2.05, -0.85);
  croup.castShadow = true;
  horse.add(croup);

  // 5. Neck (Cuello con arco / cresta)
  const neckGeo = new THREE.CylinderGeometry(0.24, 0.42, 1.35, 12);
  neckGeo.scale(0.75, 1.0, 1.2);
  const neck = new THREE.Mesh(neckGeo, bodyMaterial);
  neck.position.set(0, 2.75, 1.1);
  neck.rotation.x = Math.PI / 3.2; // Tilted forward-up
  neck.castShadow = true;
  horse.add(neck);

  // 6. Head (Cabeza / Cara / Mandíbula)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 3.25, 1.65);

  // Cranium
  const craniumGeo = new THREE.BoxGeometry(0.32, 0.35, 0.5);
  const cranium = new THREE.Mesh(craniumGeo, bodyMaterial);
  headGroup.add(cranium);

  // Muzzle (Hocico y ollares)
  const muzzleGeo = new THREE.ConeGeometry(0.22, 0.65, 8);
  muzzleGeo.scale(0.65, 1.0, 0.9);
  const muzzle = new THREE.Mesh(muzzleGeo, bodyMaterial);
  muzzle.position.set(0, -0.22, 0.45);
  muzzle.rotation.x = -Math.PI / 3.4;
  headGroup.add(muzzle);

  // Ears
  const earGeo = new THREE.ConeGeometry(0.06, 0.22, 5);
  const earLeft = new THREE.Mesh(earGeo, bodyMaterial);
  earLeft.position.set(-0.12, 0.26, -0.05);
  earLeft.rotation.z = -0.15;
  const earRight = new THREE.Mesh(earGeo, bodyMaterial);
  earRight.position.set(0.12, 0.26, -0.05);
  earRight.rotation.z = 0.15;
  headGroup.add(earLeft);
  headGroup.add(earRight);

  horse.add(headGroup);

  // 7. Four Articulated Limbs with Joints and Hooves
  // FRONT LEFT LEG (Mano Izquierda - Target of orthopedic demo)
  createHorseLeg(horse, -0.45, 0.85, true, bodyMaterial, jointMaterial, hoofMaterial, 'mano_izq');
  // FRONT RIGHT LEG (Mano Derecha)
  createHorseLeg(horse, 0.45, 0.85, true, bodyMaterial, jointMaterial, hoofMaterial, 'mano_der');
  // HIND LEFT LEG (Pata Trasera Izquierda)
  createHorseLeg(horse, -0.42, -0.95, false, bodyMaterial, jointMaterial, hoofMaterial, 'pata_izq');
  // HIND RIGHT LEG (Pata Trasera Derecha)
  createHorseLeg(horse, 0.42, -0.95, false, bodyMaterial, jointMaterial, hoofMaterial, 'pata_der');

  // 8. Tail (Cola fluida)
  const tailGeo = new THREE.CylinderGeometry(0.06, 0.18, 1.1, 8);
  const tail = new THREE.Mesh(tailGeo, hoofMaterial);
  tail.position.set(0, 1.6, -1.5);
  tail.rotation.x = -0.3;
  horse.add(tail);

  return horse;
}

function createHorseLeg(parent, x, z, isFront, bodyMat, jointMat, hoofMat, legName) {
  const leg = new THREE.Group();
  leg.name = legName;
  leg.position.set(x, 0, z);

  if (isFront) {
    // Shoulder / Arm (Escápula / Brazo)
    const upperGeo = new THREE.CylinderGeometry(0.14, 0.11, 0.75, 8);
    const upper = new THREE.Mesh(upperGeo, bodyMat);
    upper.position.set(0, 1.7, 0.05);
    upper.rotation.x = -0.15;
    upper.castShadow = true;
    leg.add(upper);

    // Carpus Joint (Rodilla / Carpo) - Critical spot
    const carpusGeo = new THREE.SphereGeometry(0.11, 8, 8);
    const carpus = new THREE.Mesh(carpusGeo, jointMat);
    carpus.position.set(0, 1.32, 0.0);
    leg.add(carpus);

    // Cannon / Shin (Caña)
    const cannonGeo = new THREE.CylinderGeometry(0.08, 0.075, 0.7, 8);
    const cannon = new THREE.Mesh(cannonGeo, bodyMat);
    cannon.position.set(0, 0.95, 0.0);
    cannon.castShadow = true;
    leg.add(cannon);

    // Fetlock Joint (Nudo)
    const fetlockGeo = new THREE.SphereGeometry(0.09, 8, 8);
    const fetlock = new THREE.Mesh(fetlockGeo, jointMat);
    fetlock.position.set(0, 0.58, 0.0);
    leg.add(fetlock);

    // Pastern & Hoof (Cuartilla y Casco)
    const pasternGeo = new THREE.CylinderGeometry(0.065, 0.075, 0.28, 8);
    const pastern = new THREE.Mesh(pasternGeo, bodyMat);
    pastern.position.set(0, 0.42, 0.04);
    pastern.rotation.x = -0.25;
    leg.add(pastern);

    // Hoof
    const hoofGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.22, 10);
    const hoof = new THREE.Mesh(hoofGeo, hoofMat);
    hoof.position.set(0, 0.12, 0.08);
    hoof.castShadow = true;
    leg.add(hoof);

  } else {
    // Hind Leg (Gaskin, Stifle, Hock)
    // Thigh (Muslo / Fémur)
    const thighGeo = new THREE.CylinderGeometry(0.18, 0.13, 0.85, 8);
    const thigh = new THREE.Mesh(thighGeo, bodyMat);
    thigh.position.set(0, 1.75, 0.08);
    thigh.rotation.x = 0.25;
    thigh.castShadow = true;
    leg.add(thigh);

    // Hock Joint (Corvejón) - Angled backwards
    const hockGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const hock = new THREE.Mesh(hockGeo, jointMat);
    hock.position.set(0, 1.38, -0.06);
    leg.add(hock);

    // Hind Cannon (Caña trasera)
    const hCannonGeo = new THREE.CylinderGeometry(0.08, 0.075, 0.75, 8);
    const hCannon = new THREE.Mesh(hCannonGeo, bodyMat);
    hCannon.position.set(0, 0.98, -0.04);
    hCannon.castShadow = true;
    leg.add(hCannon);

    // Fetlock & Hoof
    const fetlockGeo = new THREE.SphereGeometry(0.09, 8, 8);
    const fetlock = new THREE.Mesh(fetlockGeo, jointMat);
    fetlock.position.set(0, 0.58, -0.04);
    leg.add(fetlock);

    const hoofGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.22, 10);
    const hoof = new THREE.Mesh(hoofGeo, hoofMat);
    hoof.position.set(0, 0.12, 0.02);
    hoof.castShadow = true;
    leg.add(hoof);
  }

  parent.add(leg);
}

// --- 3D INTERACTIVE HOTSPOTS / ANATOMICAL PINS ---
function createHotspots() {
  // Clear any existing
  hotspots.forEach(h => scene.remove(h.mesh));
  hotspots = [];

  Object.entries(HOTSPOT_DATA).forEach(([key, data]) => {
    const pinGroup = new THREE.Group();
    pinGroup.position.copy(data.coords);

    // Central pulsing sphere
    const sphereGeo = new THREE.SphereGeometry(0.09, 16, 16);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: data.color,
      transparent: true,
      opacity: 0.95
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    pinGroup.add(sphere);

    // Outer glow ring
    const ringGeo = new THREE.RingGeometry(0.11, 0.17, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: data.color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    pinGroup.add(ring);

    // Tag user data for raycaster detection
    pinGroup.userData = {
      hotspotKey: key,
      ...data,
      ringMesh: ring,
      sphereMesh: sphere
    };

    scene.add(pinGroup);
    hotspots.push({ mesh: pinGroup, key, data, ring });
  });
}

// --- POINTER / CLICK INTERACTION ---
function onPointerDown(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  // Check intersection with hotspot pins first
  const pinMeshes = hotspots.map(h => h.mesh.children[0]);
  const pinIntersects = raycaster.intersectObjects(pinMeshes);

  if (pinIntersects.length > 0) {
    const parentPin = pinIntersects[0].object.parent;
    if (parentPin && parentPin.userData.hotspotKey) {
      focusHotspot(parentPin.userData.hotspotKey);
      return;
    }
  }

  // Check intersection with the horse body
  const bodyIntersects = raycaster.intersectObject(horseGroup, true);
  if (bodyIntersects.length > 0) {
    const hitPoint = bodyIntersects[0].point;
    handleBodyTap(hitPoint);
  }
}

function handleBodyTap(hitPoint) {
  // Find nearest hotspot or create dynamic lesion pin
  let nearest = null;
  let minDist = 999;

  Object.entries(HOTSPOT_DATA).forEach(([k, h]) => {
    const d = hitPoint.distanceTo(h.coords);
    if (d < minDist) {
      minDist = d;
      nearest = k;
    }
  });

  if (minDist < 0.9 && nearest) {
    focusHotspot(nearest);
  } else {
    // Show generic selected coordinate tag
    showZoneInfoTag({
      title: 'Punto Anatómico Personalizado',
      desc: `Coordenadas 3D registradas: X: ${hitPoint.x.toFixed(2)}, Y: ${hitPoint.y.toFixed(2)}, Z: ${hitPoint.z.toFixed(2)}. Listo para vincular hallazgo clínico o fotografía.`,
      color: 0x06b6d4
    });
  }
}

// --- CAMERA TRANSITIONS & FOCUS ---
export function focusHotspot(key) {
  const data = HOTSPOT_DATA[key];
  if (!data) return;

  targetCameraPos = data.camPos.clone();
  targetLookAt = data.camLook.clone();

  // Show UI popup tag
  showZoneInfoTag(data);

  // Trigger pulse highlight
  hotspots.forEach(h => {
    if (h.key === key) {
      h.mesh.scale.set(1.4, 1.4, 1.4);
    } else {
      h.mesh.scale.set(1.0, 1.0, 1.0);
    }
  });
}

function showZoneInfoTag(data) {
  const tag = document.getElementById('zoneInfoTag');
  const title = document.getElementById('zoneTagTitle');
  const desc = document.getElementById('zoneTagDesc');
  const dot = document.getElementById('zoneTagDot');

  if (tag && title && desc) {
    title.textContent = data.title;
    desc.textContent = data.desc;
    if (dot && data.color) {
      const hex = '#' + data.color.toString(16).padStart(6, '0');
      dot.style.backgroundColor = hex;
    }
    tag.classList.remove('hidden');
  }
}

// --- CAMERA VIEW PRESETS ---
function setupCameraButtons() {
  document.querySelectorAll('.cam-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const view = e.target.dataset.view;
      setCameraView(view);
    });
  });

  // Especie buttons
  const btnEquino = document.getElementById('btnEspecieEquino');
  const btnBovino = document.getElementById('btnEspecieBovino');

  if (btnEquino && btnBovino) {
    btnEquino.addEventListener('click', () => {
      btnEquino.className = 'px-2.5 py-1 text-xs font-medium rounded-lg bg-cyan-600 text-white shadow-sm transition';
      btnBovino.className = 'px-2.5 py-1 text-xs font-medium rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition';
      setAnimalSpecies('equino');
    });

    btnBovino.addEventListener('click', () => {
      btnBovino.className = 'px-2.5 py-1 text-xs font-medium rounded-lg bg-cyan-600 text-white shadow-sm transition';
      btnEquino.className = 'px-2.5 py-1 text-xs font-medium rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition';
      setAnimalSpecies('bovino');
    });
  }
}

export function setCameraView(view) {
  switch (view) {
    case 'lateral':
      targetCameraPos = new THREE.Vector3(4.5, 2.0, 0);
      targetLookAt = new THREE.Vector3(0, 1.8, 0);
      break;
    case 'anterior':
      targetCameraPos = new THREE.Vector3(0, 3.2, 4.2);
      targetLookAt = new THREE.Vector3(0, 2.8, 1.4);
      break;
    case 'posterior':
      targetCameraPos = new THREE.Vector3(0, 2.4, -4.2);
      targetLookAt = new THREE.Vector3(0, 1.9, -0.6);
      break;
    case 'pata_izq':
      focusHotspot('ortopedia');
      break;
    case 'reset':
    default:
      targetCameraPos = new THREE.Vector3(3.8, 2.6, 4.2);
      targetLookAt = new THREE.Vector3(0, 1.8, 0);
      break;
  }
}

export function setAnimalSpecies(species) {
  if (species === 'bovino') {
    // Adjust proportions for bovine (stockier body, broader head, dewlap)
    horseGroup.scale.set(1.15, 0.92, 0.95);
    document.getElementById('patientBadge').innerHTML = `
      <div class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">🐮</div>
      <div class="text-left">
        <div class="text-xs font-semibold text-white flex items-center gap-1.5">
          <span>Esmeralda</span>
          <span class="text-[10px] text-slate-400 font-normal hidden md:inline">(Brahman Blanco #804)</span>
        </div>
        <div class="text-[10px] text-slate-400">Hacienda Las Delicias · Lote Gestación</div>
      </div>
      <i data-lucide="chevron-down" class="w-3.5 h-3.5 text-slate-400 ml-1"></i>
    `;
    lucide.createIcons();
  } else {
    horseGroup.scale.set(1.0, 1.0, 1.0);
    document.getElementById('patientBadge').innerHTML = `
      <div class="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">🐎</div>
      <div class="text-left">
        <div class="text-xs font-semibold text-white flex items-center gap-1.5">
          <span>Relámpago</span>
          <span class="text-[10px] text-slate-400 font-normal hidden md:inline">(Paso Fino Col.)</span>
        </div>
        <div class="text-[10px] text-slate-400">Criadero San Rafael · Pesebrera #12</div>
      </div>
      <i data-lucide="chevron-down" class="w-3.5 h-3.5 text-slate-400 ml-1"></i>
    `;
    lucide.createIcons();
  }
}

function onWindowResize() {
  if (!container || !renderer || !camera) return;
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || Math.max(340, Math.floor(window.innerHeight * 0.7));
  if (width === 0 || height === 0) return;
  const aspect = width / height;
  camera.aspect = aspect;
  camera.fov = aspect < 1.0 ? 55 : 45;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

// --- ANIMATION & RENDER LOOP ---
function animate(time) {
  requestAnimationFrame(animate);

  const t = (time || 0) * 0.001;

  // Pulse animation on hotspot rings
  hotspots.forEach((h, index) => {
    if (h.ring) {
      const pulse = 1 + Math.sin(t * 3 + index) * 0.25;
      h.ring.scale.set(pulse, pulse, 1);
    }
  });

  // Smooth camera transitions
  if (targetCameraPos && targetLookAt) {
    camera.position.lerp(targetCameraPos, 0.06);
    controls.target.lerp(targetLookAt, 0.06);

    if (camera.position.distanceTo(targetCameraPos) < 0.05 && controls.target.distanceTo(targetLookAt) < 0.05) {
      targetCameraPos = null;
      targetLookAt = null;
    }
  }

  controls.update();
  renderer.render(scene, camera);
}

// Expose to window for inline onclicks
window.focusHotspot = focusHotspot;
window.setCameraView = setCameraView;
window.setAnimalSpecies = setAnimalSpecies;
window.initThreeViewer = initThreeViewer;

// Auto-initialize even if DOMContentLoaded already fired
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(initThreeViewer, 10);
} else {
  window.addEventListener('DOMContentLoaded', initThreeViewer);
}
// Safety retries for async container layout
window.addEventListener('load', () => setTimeout(onWindowResize, 100));

