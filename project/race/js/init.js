import * as THREE from 'https://cdn.skypack.dev/three@0.150.1'; // Use a recent version

// --- DOM Elements ---
const uiContainer = document.getElementById('ui-container');
const inputSection = document.getElementById('input-section');
const companyNamesInput = document.getElementById('companyNames');
const autoGenerateNamesButton = document.getElementById('autoGenerateNames');
const submitNamesButton = document.getElementById('submitNames');
const controlsSection = document.getElementById('controls-section');
const startRaceButton = document.getElementById('startRace');
const resetRaceButton = document.getElementById('resetRace');
const changeNamesButton = document.getElementById('changeNames');
const winnerDisplay = document.getElementById('winner-display');
const winnerElements = [
    document.getElementById('winner1'),
    document.getElementById('winner2'),
    document.getElementById('winner3'),
];
const raceContainer = document.getElementById('raceContainer');
// Removed loadingOverlay reference

// --- Three.js Setup ---
let scene, camera, renderer, clock;
let racers = []; // Now holds objects { mesh: THREE.Mesh, labelSprite: THREE.Sprite }
let companyNames = [];
let winners = []; // Array holds winning RACER OBJECTS {mesh, labelSprite}
let targetCameraPosition = new THREE.Vector3();
let targetCameraLookAt = new THREE.Vector3();
const currentCameraPosition = new THREE.Vector3();
const currentCameraLookAt = new THREE.Vector3();


// --- Game State ---
let isRacePrepared = false;
let isRacing = false;
let raceOver = false;
// Removed assetsLoaded / soundsReady flags

// --- Race Config ---
const RACER_COUNT = 4;
const TRACK_LENGTH = 1000;
const FINISH_LINE_Z = -TRACK_LENGTH;
const START_LINE_Z = 0;
const TRACK_WIDTH = 40;
const RACER_LABEL_Y_OFFSET = 2.5; // How far above the mesh the label is

// --- Camera States ---
const CameraState = {
    PRE_RACE: 'PRE_RACE',
    START_ZOOM: 'START_ZOOM',
    FOLLOW_LEAD: 'FOLLOW_LEAD',
    SIDE_VIEW: 'SIDE_VIEW',
    FINISH_APPROACH: 'FINISH_APPROACH',
    FINISH_LINE: 'FINISH_LINE',
    WINNER_FOCUS: 'WINNER_FOCUS',
};
let currentCameraState = CameraState.PRE_RACE;
let sideViewTimer = 0;
const SIDE_VIEW_DURATION = 5; // seconds

// --- Particles ---
let speedParticlesMesh;
const MAX_SPEED_PARTICLES = RACER_COUNT * 30;
let speedParticlesGeometry;
let speedParticlesMaterial;
let finishParticlesMesh;
const FINISH_PARTICLE_COUNT = 400;
let finishParticlesGeometry;
let finishParticlesMaterial;
let finishParticlesActive = false;
let finishParticleTimer = 0;

// --- Audio Removed ---

// --- Auto Name Generation Data ---
const namePrefixes = ["Quantum", "Apex", "Stellar", "Nova", "Cyber", "Eco", "Vertex", "Pinnacle", "Horizon", "Fusion", "Zenith", "Pulse", "Syntho", "Geo", "Aero", "Chrono", "Omega"];
const nameMiddles = ["Dynamics", "Solutions", "Systems", "Tech", "Labs", "Industries", "Enterprises", "Group", "Works", "Robotics", "Logistics", "Innovations", "Digital", "Data", "Energy", "Media"];
const nameSuffixes = ["Corp", "Inc", "Ltd", "LLC", "Global", "Intl", "One", "Prime", "Core", "Net"];

// --- Initial Setup ---
initThreeJS();
// Removed initAudio() call

// --- Initialization Functions ---

function initThreeJS() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x101020);
    // Adjusted Fog: Start slightly further, end slightly further to better see finish line
    scene.fog = new THREE.Fog(0x101020, TRACK_LENGTH * 0.6, TRACK_LENGTH * 1.5);
    clock = new THREE.Clock();

    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    setCameraState(CameraState.PRE_RACE);
    currentCameraPosition.copy(targetCameraPosition);
    currentCameraLookAt.copy(targetCameraLookAt);
    camera.position.copy(currentCameraPosition);
    camera.lookAt(currentCameraLookAt);


    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    raceContainer.appendChild(renderer.domElement);

    // Lighting (no changes)
    const ambientLight = new THREE.AmbientLight(0x606080, 0.8);
    scene.add(ambientLight);
    const hemiLight = new THREE.HemisphereLight(0x8090ff, 0x404020, 0.6);
    scene.add(hemiLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(80, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 10;
    directionalLight.shadow.camera.far = 250;
    directionalLight.shadow.camera.left = -TRACK_WIDTH * 1.5;
    directionalLight.shadow.camera.right = TRACK_WIDTH * 1.5;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    scene.add(directionalLight);


    // Track (no changes)
    const trackGeometry = new THREE.PlaneGeometry(TRACK_WIDTH * 2.5, TRACK_LENGTH * 1.2, 10, 50);
    const trackMaterial = new THREE.MeshStandardMaterial({
        color: 0x444455, roughness: 0.8, metalness: 0.1, envMapIntensity: 0.2
     });
    const track = new THREE.Mesh(trackGeometry, trackMaterial);
    track.rotation.x = -Math.PI / 2;
    track.position.z = (FINISH_LINE_Z + START_LINE_Z)/2 - TRACK_LENGTH * 0.1;
    track.receiveShadow = true;
    scene.add(track);

    // Finish Line (no changes)
    const finishLineMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, map: createCheckerboardTexture(), transparent: true, opacity: 0.8 }); // Slightly transparent maybe?
    const finishLineGeo = new THREE.PlaneGeometry(TRACK_WIDTH * 1.1, 3);
    const finishLine = new THREE.Mesh(finishLineGeo, finishLineMat);
    finishLine.rotation.x = -Math.PI / 2;
    finishLine.position.y = 0.05;
    finishLine.position.z = FINISH_LINE_Z;
    scene.add(finishLine);


    // Particles
    initSpeedParticles();
    initFinishParticles();

    // Event Listeners
    window.addEventListener('resize', onWindowResize, false);
    autoGenerateNamesButton.addEventListener('click', generateAndFillNames);
    submitNamesButton.addEventListener('click', handleNameSubmit);
    startRaceButton.addEventListener('click', startRace);
    resetRaceButton.addEventListener('click', resetRaceVisuals); // Ensure this works now
    changeNamesButton.addEventListener('click', handleChangeNames);

    animate();
}

function createCheckerboardTexture() {
    // Function remains the same
    const size = 64;
    const data = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const i = (y * size + x) * 4;
            const isBlack = ((x & 8) ^ (y & 8)) !== 0;
            const color = isBlack ? 0 : 255;
            data[i] = color; data[i + 1] = color; data[i + 2] = color; data[i + 3] = 200; // Slightly less opaque?
        }
    }
    const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    texture.needsUpdate = true;
    texture.wrapS = THREE.RepeatWrapping; texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(TRACK_WIDTH * 1.1 / 4, 3 / 4);
    return texture;
}

// --- Audio Functions Removed ---

// --- Name Generation ---
function generateAndFillNames() {
    // Function remains the same
    companyNames = [];
    const usedNames = new Set();
    while(companyNames.length < RACER_COUNT) {
        const prefix = namePrefixes[Math.floor(Math.random() * namePrefixes.length)];
        const middle = nameMiddles[Math.floor(Math.random() * nameMiddles.length)];
        const suffix = Math.random() < 0.4 ? nameSuffixes[Math.floor(Math.random() * nameSuffixes.length)] : "";
        let name = `${prefix} ${middle}${suffix ? ' ' + suffix : ''}`;
        if (!usedNames.has(name)) {
             companyNames.push(name);
             usedNames.add(name);
        }
    }
    companyNamesInput.value = companyNames.join('\n');
}

// --- Racer Label Creation ---
function createRacerLabel(fullName) {
    // Shorten Name (e.g., first 8 chars + ...)
    const shortName = fullName.length > 8 ? fullName.substring(0, 8) + '...' : fullName;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const fontSize = 24;
    context.font = `Bold ${fontSize}px Poppins, Arial, sans-serif`;

    // Measure text width for canvas size
    const textWidth = context.measureText(shortName).width;
    canvas.width = textWidth + 20; // Add padding
    canvas.height = fontSize + 10; // Add padding

    // Redraw text on potentially resized canvas
    context.font = `Bold ${fontSize}px Poppins, Arial, sans-serif`; // Re-set font after resize
    context.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Semi-transparent black background
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = 'white'; // White text
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(shortName, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: true, // Render in front
        depthWrite: false,
    });

    const sprite = new THREE.Sprite(material);
    // Adjust scale based on canvas aspect ratio to avoid distortion
    const aspect = canvas.width / canvas.height;
    sprite.scale.set(3 * aspect, 3, 1); // Adjust base scale as needed

    return sprite;
}


// --- Race Logic ---

function handleNameSubmit() {
    const namesRaw = companyNamesInput.value.split('\n');
    companyNames = namesRaw.map(name => name.trim()).filter(name => name !== '');

    if (companyNames.length !== RACER_COUNT) {
        alert(`Please enter exactly ${RACER_COUNT} company names.`);
        return;
    }

    isRacePrepared = true;
    raceOver = false;
    inputSection.classList.add('hidden');
    controlsSection.classList.remove('hidden');
    winnerDisplay.classList.add('hidden');

    // Enable start button now that names are ready (no sound check needed)
    startRaceButton.disabled = false;
    startRaceButton.textContent = 'Start Race!';


    clearRacers();
    createRacers();
    resetRaceVisuals(); // Position racers at start
}


function handleChangeNames() {
     isRacePrepared = false;
     raceOver = true;
     isRacing = false;
     clearRacers(); // This now also removes labels
     controlsSection.classList.add('hidden');
     winnerDisplay.classList.add('hidden');
     inputSection.classList.remove('hidden');
     companyNames = [];
     winners = [];
     startRaceButton.disabled = true; // Disable until names submitted again
     startRaceButton.textContent = 'Start Race!';
     // stopSound removed
     resetParticles(speedParticlesGeometry);
     resetParticles(finishParticlesGeometry, true);
     setCameraState(CameraState.PRE_RACE);
}


function createRacers() {
    const racerGeometry = new THREE.BoxGeometry(1.5, 1.5, 3.5);

    for (let i = 0; i < RACER_COUNT; i++) {
        const color = new THREE.Color().setHSL(i / RACER_COUNT, 0.9, 0.6);
        const racerMaterial = new THREE.MeshStandardMaterial({
            color: color, roughness: 0.4, metalness: 0.2, envMapIntensity: 0.5
        });
        const racerMesh = new THREE.Mesh(racerGeometry, racerMaterial);

        const posX = (i - (RACER_COUNT - 1) / 2) * (TRACK_WIDTH / RACER_COUNT) * 1.6;
        racerMesh.position.set(posX, 0.75, START_LINE_Z);
        racerMesh.castShadow = true;
        racerMesh.receiveShadow = true;
        racerMesh.rotation.y = Math.PI;

        // Create the label sprite
        const labelSprite = createRacerLabel(companyNames[i]);
        labelSprite.position.set(posX, 0.75 + RACER_LABEL_Y_OFFSET, START_LINE_Z); // Position above mesh
        scene.add(labelSprite); // Add label to scene


        // Store mesh and label together
        const racerObject = {
             mesh: racerMesh,
             labelSprite: labelSprite, // Store reference to label
             userData: { // Keep game logic data here
                id: i,
                name: companyNames[i],
                baseSpeed: 0.35 + Math.random() * 0.2,
                currentSpeed: 0,
                progress: 0,
                isWinner: false,
                finishPlace: -1,
                color: color,
                lastPosition: racerMesh.position.clone()
             }
        };

        racers.push(racerObject);
        scene.add(racerMesh); // Add mesh to scene
    }
}

function clearRacers() {
    racers.forEach(racerObj => {
        scene.remove(racerObj.mesh);
        scene.remove(racerObj.labelSprite); // Remove label sprite from scene
        // Dispose label resources if needed (usually handled by GC, but good practice for complex apps)
         if (racerObj.labelSprite.material.map) racerObj.labelSprite.material.map.dispose();
         racerObj.labelSprite.material.dispose();
    });
    racers = [];
}


function shuffleArray(array) {
    // Function remains the same
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function selectWinners() {
    winners = [];
    racers.forEach(r => { r.userData.isWinner = false; r.userData.finishPlace = -1; });

    const indices = Array.from(Array(RACER_COUNT).keys());
    shuffleArray(indices);

    for (let i = 0; i < 3; i++) {
        const winnerIndex = indices[i];
        const winnerRacerObj = racers[winnerIndex]; // Get the racer object {mesh, label}
        winnerRacerObj.userData.isWinner = true;
        winnerRacerObj.userData.finishPlace = i + 1;
        winners.push(winnerRacerObj); // Store the whole object
        winnerRacerObj.userData.baseSpeed = 0.65 + (3 - i) * 0.05 + Math.random() * 0.03;
    }
     racers.forEach(racerObj => {
        if (!racerObj.userData.isWinner) {
            racerObj.userData.baseSpeed = 0.4 + Math.random() * 0.15;
        }
     });
}


function startRace() {
    // Simplified condition: just check preparation and state
    if (!isRacePrepared || isRacing || raceOver) {
         console.warn("Cannot start race. Prepared:", isRacePrepared, "Racing:", isRacing, "Over:", raceOver);
         return;
    }

    selectWinners();

    isRacing = true;
    raceOver = false; // Ensure race is not considered over when starting
    winnerDisplay.classList.add('hidden');
    startRaceButton.disabled = true; // Disable during race
    resetRaceButton.disabled = true;
    changeNamesButton.disabled = true;

    racers.forEach(racerObj => {
        racerObj.userData.currentSpeed = 0;
        racerObj.userData.lastPosition.copy(racerObj.mesh.position);
    });

    // playSound('start') removed
    // setTimeout for background sound removed

    setCameraState(CameraState.START_ZOOM);
    resetParticles(speedParticlesGeometry);
    resetParticles(finishParticlesGeometry, true);
    finishParticlesActive = false;
    finishParticleTimer = 0;
}

function resetRaceVisuals() {
    isRacing = false;
    raceOver = false; // <<< FIX: Reset raceOver state to allow restarting

    racers.forEach((racerObj, i) => {
        const posX = (i - (RACER_COUNT - 1) / 2) * (TRACK_WIDTH / RACER_COUNT) * 1.6;
        // Reset mesh position
        racerObj.mesh.position.set(posX, 0.75, START_LINE_Z);
        // Reset label position
        racerObj.labelSprite.position.set(posX, 0.75 + RACER_LABEL_Y_OFFSET, START_LINE_Z);

        // Reset user data
        racerObj.userData.progress = 0;
        racerObj.userData.currentSpeed = 0;
        racerObj.userData.lastPosition.copy(racerObj.mesh.position);
        // Keep winner flags if needed for immediate display, but they aren't shown until race ends
    });

    winnerDisplay.classList.add('hidden');
    startRaceButton.disabled = !isRacePrepared; // Enable if prepared
    resetRaceButton.disabled = false;
    changeNamesButton.disabled = false;

    setCameraState(CameraState.PRE_RACE);
    // stopSound removed
    resetParticles(speedParticlesGeometry);
    resetParticles(finishParticlesGeometry, true);
    finishParticlesActive = false;
}

// --- Update Loop ---

function updateRace(deltaTime) {
    if (!isRacing) return;

    let finishedCount = 0;
    let leadZ = START_LINE_Z;
    let activeRacers = 0;

    racers.forEach(racerObj => {
        const racerMesh = racerObj.mesh; // Get the mesh
        const userData = racerObj.userData; // Get the user data

        if (userData.progress < 1) {
             activeRacers++;
            const targetSpeed = userData.baseSpeed * (0.8 + Math.random() * 0.9);
            const acceleration = 0.1;

            if (userData.currentSpeed < targetSpeed) {
                userData.currentSpeed += acceleration * deltaTime * 60;
                userData.currentSpeed = Math.min(userData.currentSpeed, targetSpeed);
            } else {
                userData.currentSpeed -= acceleration * deltaTime * 30;
                userData.currentSpeed = Math.max(userData.currentSpeed, targetSpeed * 0.7);
            }

            userData.lastPosition.copy(racerMesh.position); // Store last MESH position

            const moveDistance = userData.currentSpeed * deltaTime * 60;
            racerMesh.position.z -= moveDistance; // Move MESH forward

            // Update label sprite position to follow the mesh
            racerObj.labelSprite.position.x = racerMesh.position.x;
            racerObj.labelSprite.position.y = racerMesh.position.y + RACER_LABEL_Y_OFFSET;
            racerObj.labelSprite.position.z = racerMesh.position.z;


            if (racerMesh.position.z <= FINISH_LINE_Z) {
                racerMesh.position.z = FINISH_LINE_Z; // Clamp mesh
                 racerObj.labelSprite.position.z = FINISH_LINE_Z; // Clamp label too
                userData.progress = 1;
                userData.currentSpeed = 0;
                finishedCount++;
            } else {
                userData.progress = (START_LINE_Z - racerMesh.position.z) / (START_LINE_Z - FINISH_LINE_Z);
            }

            if (racerMesh.position.z < leadZ) {
                leadZ = racerMesh.position.z;
            }
        } else {
            finishedCount++;
        }
    });

    // --- Camera Logic ---
    updateCameraState(deltaTime, leadZ);


    // --- Check Race End Condition ---
    // Check progress on the racer's userData
    const winnersFinished = winners.every(winnerRacerObj => winnerRacerObj.userData.progress >= 1);

    if (winnersFinished && finishedCount >= 3) {
        isRacing = false;
        raceOver = true;
        displayWinners();
        // stopSound removed
        // playSound('win') removed
        resetRaceButton.disabled = false;
        changeNamesButton.disabled = false;
        setCameraState(CameraState.WINNER_FOCUS);
        finishParticlesActive = true;
        finishParticleTimer = 0;
    }
}

function displayWinners() {
    // Sort the array of winner RACER OBJECTS
    winners.sort((a, b) => a.userData.finishPlace - b.userData.finishPlace);

    // Access name from userData
    winnerElements[0].innerHTML = `🥇 1st: ${winners[0]?.userData.name || '---'}`;
    winnerElements[1].innerHTML = `🥈 2nd: ${winners[1]?.userData.name || '---'}`;
    winnerElements[2].innerHTML = `🥉 3rd: ${winners[2]?.userData.name || '---'}`;

    winnerDisplay.classList.remove('hidden');
}


// --- Particle Systems (Functions initSpeedParticles, updateSpeedParticles, initFinishParticles, updateFinishParticles, resetParticles remain largely the same) ---
// Minor tweak: Use racerObj.mesh.position and racerObj.userData where appropriate in particle updates

function initSpeedParticles() {
    // ... (same geometry/material setup) ...
    speedParticlesGeometry = new THREE.BufferGeometry();
    // ... (attribute setup) ...
    speedParticlesGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAX_SPEED_PARTICLES * 3).fill(-1000), 3)); // Start hidden
    speedParticlesGeometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(MAX_SPEED_PARTICLES * 3), 3));
    speedParticlesGeometry.setAttribute('alpha', new THREE.BufferAttribute(new Float32Array(MAX_SPEED_PARTICLES).fill(0.0), 1));
    speedParticlesGeometry.setAttribute('velocity', new THREE.BufferAttribute(new Float32Array(MAX_SPEED_PARTICLES * 3), 3));
    speedParticlesGeometry.setAttribute('lifetime', new THREE.BufferAttribute(new Float32Array(MAX_SPEED_PARTICLES).fill(0.0), 1));

    speedParticlesMaterial = new THREE.ShaderMaterial({ /* ... same shaders ... */
        uniforms: { pointTexture: { value: new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/spark1.png') }, size: { value: 1.5 } },
        vertexShader: `...`, fragmentShader: `...`, // Same shaders as before
        blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, vertexColors: true
     });
    speedParticlesMesh = new THREE.Points(speedParticlesGeometry, speedParticlesMaterial);
    scene.add(speedParticlesMesh);
}

function updateSpeedParticles(deltaTime) {
    if (!speedParticlesGeometry) return;
    // ... (get attributes) ...
    const positions = speedParticlesGeometry.attributes.position.array;
    const colors = speedParticlesGeometry.attributes.color.array;
    const alphas = speedParticlesGeometry.attributes.alpha.array;
    const velocities = speedParticlesGeometry.attributes.velocity.array;
    const lifetimes = speedParticlesGeometry.attributes.lifetime.array;

    const particlesPerRacer = MAX_SPEED_PARTICLES / RACER_COUNT;
    const maxLifetime = 0.8;

    racers.forEach((racerObj, racerIndex) => { // Use racerObj now
        const baseIndex = racerIndex * particlesPerRacer;
        const racerSpeed = racerObj.userData.currentSpeed;
        const emitRate = Math.min(1.0, racerSpeed * 2.0);
        const racerColor = racerObj.userData.color;
        const racerMesh = racerObj.mesh; // Get mesh for position

        const racerVelocity = new THREE.Vector3().subVectors(racerMesh.position, racerObj.userData.lastPosition);
        racerVelocity.normalize().multiplyScalar(-1);

        for (let i = 0; i < particlesPerRacer; i++) {
             const idx = baseIndex + i;
             // ... (indices calculation) ...
            const lifeIdx = idx; const posIdx = idx * 3; const colIdx = idx * 3; const velIdx = idx * 3;

            if (lifetimes[lifeIdx] > 0) {
                // ... (update existing particle logic) ...
                 lifetimes[lifeIdx] -= deltaTime;
                 alphas[lifeIdx] = Math.max(0.0, lifetimes[lifeIdx] / maxLifetime);
                 positions[posIdx + 0] += velocities[velIdx + 0] * deltaTime * 30;
                 positions[posIdx + 1] += velocities[velIdx + 1] * deltaTime * 30;
                 positions[posIdx + 2] += velocities[velIdx + 2] * deltaTime * 30;
            } else if (isRacing && racerObj.userData.progress < 1 && Math.random() < emitRate * deltaTime * 15) {
                // ... (respawn particle logic using racerMesh.position) ...
                 const offset = racerVelocity.clone().multiplyScalar(1.8);
                 positions[posIdx + 0] = racerMesh.position.x + offset.x + (Math.random() - 0.5) * 0.5;
                 positions[posIdx + 1] = racerMesh.position.y + (Math.random() - 0.5) * 0.5;
                 positions[posIdx + 2] = racerMesh.position.z + offset.z + (Math.random() - 0.5) * 0.5;
                 lifetimes[lifeIdx] = maxLifetime * (0.5 + Math.random() * 0.5);
                 alphas[lifeIdx] = 1.0;
                 velocities[velIdx + 0] = racerVelocity.x * 0.5 + (Math.random() - 0.5) * 0.3;
                 velocities[velIdx + 1] = racerVelocity.y * 0.5 + (Math.random() - 0.5) * 0.3;
                 velocities[velIdx + 2] = racerVelocity.z * 0.5 + (Math.random() - 0.5) * 0.3;
                 colors[colIdx + 0] = racerColor.r; colors[colIdx + 1] = racerColor.g; colors[colIdx + 2] = racerColor.b;
            } else {
                // ... (hide dead particle) ...
                 alphas[lifeIdx] = 0.0;
                 positions[posIdx + 1] = -1000;
            }
        }
    });
    // ... (flag attributes for update) ...
     speedParticlesGeometry.attributes.position.needsUpdate = true;
     speedParticlesGeometry.attributes.color.needsUpdate = true;
     speedParticlesGeometry.attributes.alpha.needsUpdate = true;
     speedParticlesGeometry.attributes.velocity.needsUpdate = true;
     speedParticlesGeometry.attributes.lifetime.needsUpdate = true;
}

function initFinishParticles() {
    // Function remains the same
    finishParticlesGeometry = new THREE.BufferGeometry();
    // ... (attribute setup) ...
     finishParticlesGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(FINISH_PARTICLE_COUNT * 3).fill(-1000), 3));
     finishParticlesGeometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(FINISH_PARTICLE_COUNT * 3), 3));
     finishParticlesGeometry.setAttribute('alpha', new THREE.BufferAttribute(new Float32Array(FINISH_PARTICLE_COUNT).fill(0.0), 1));
     finishParticlesGeometry.setAttribute('velocity', new THREE.BufferAttribute(new Float32Array(FINISH_PARTICLE_COUNT * 3), 3));
     finishParticlesGeometry.setAttribute('lifetime', new THREE.BufferAttribute(new Float32Array(FINISH_PARTICLE_COUNT).fill(0.0), 1));

    finishParticlesMaterial = new THREE.ShaderMaterial({ /* ... same shaders ... */
        uniforms: { pointTexture: { value: new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/disc.png') }, size: { value: 2.5 } },
        vertexShader: `...`, fragmentShader: `...`, // Same shaders as before
        blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, vertexColors: true
    });
    finishParticlesMesh = new THREE.Points(finishParticlesGeometry, finishParticlesMaterial);
    scene.add(finishParticlesMesh);
}

function updateFinishParticles(deltaTime) {
    // Function remains largely the same, no direct racer interaction needed here
    if (!finishParticlesGeometry || !finishParticlesActive) {
         // ... (fade out logic if inactive) ...
         if(finishParticlesGeometry && finishParticlesGeometry.attributes.alpha.array[0] > 0) {
              const alphas = finishParticlesGeometry.attributes.alpha.array; let needsUpdate = false;
              for (let i = 0; i < FINISH_PARTICLE_COUNT; i++) { if (alphas[i] > 0) { alphas[i] -= deltaTime * 3.0; alphas[i] = Math.max(0.0, alphas[i]); needsUpdate = true; } }
              if (needsUpdate) finishParticlesGeometry.attributes.alpha.needsUpdate = true;
         }
        return;
    }
    // ... (get attributes) ...
    const positions = finishParticlesGeometry.attributes.position.array;
    const colors = finishParticlesGeometry.attributes.color.array;
    const alphas = finishParticlesGeometry.attributes.alpha.array;
    const velocities = finishParticlesGeometry.attributes.velocity.array;
    const lifetimes = finishParticlesGeometry.attributes.lifetime.array;
    const maxLifetime = 2.5; const gravity = 9.8;
    finishParticleTimer += deltaTime; const burstDuration = 0.5;

    for (let i = 0; i < FINISH_PARTICLE_COUNT; i++) {
        // ... (indices calculation) ...
         const lifeIdx = i; const posIdx = i * 3; const colIdx = i * 3; const velIdx = i * 3;
        if (lifetimes[lifeIdx] > 0) {
            // ... (update existing particle logic) ...
             lifetimes[lifeIdx] -= deltaTime;
             alphas[lifeIdx] = Math.min(1.0, Math.max(0.0, (lifetimes[lifeIdx] / maxLifetime) * 1.5));
             velocities[velIdx + 1] -= gravity * deltaTime;
             positions[posIdx + 0] += velocities[velIdx + 0] * deltaTime;
             positions[posIdx + 1] += velocities[velIdx + 1] * deltaTime;
             positions[posIdx + 2] += velocities[velIdx + 2] * deltaTime;
        } else if (finishParticleTimer <= burstDuration) {
            // ... (respawn particle logic) ...
             lifetimes[lifeIdx] = maxLifetime * (0.6 + Math.random() * 0.4); alphas[lifeIdx] = 1.0;
             positions[posIdx + 0] = (Math.random() - 0.5) * TRACK_WIDTH * 0.8;
             positions[posIdx + 1] = 1.0 + Math.random() * 2.0;
             positions[posIdx + 2] = FINISH_LINE_Z + (Math.random() - 0.5) * 5;
             const angle = Math.random() * Math.PI * 2; const horizontalSpeed = 5 + Math.random() * 10;
             velocities[velIdx + 0] = Math.cos(angle) * horizontalSpeed;
             velocities[velIdx + 1] = 10 + Math.random() * 15;
             velocities[velIdx + 2] = Math.sin(angle) * horizontalSpeed * 0.5;
             const color = new THREE.Color().setHSL(Math.random(), 0.8, 0.6);
             colors[colIdx + 0] = color.r; colors[colIdx + 1] = color.g; colors[colIdx + 2] = color.b;
        } else {
             // ... (hide dead particle) ...
            alphas[lifeIdx] = 0.0; positions[posIdx + 1] = -1000;
        }
    }
    // ... (flag attributes for update) ...
     finishParticlesGeometry.attributes.position.needsUpdate = true;
     finishParticlesGeometry.attributes.color.needsUpdate = true;
     finishParticlesGeometry.attributes.alpha.needsUpdate = true;
     finishParticlesGeometry.attributes.velocity.needsUpdate = true;
     finishParticlesGeometry.attributes.lifetime.needsUpdate = true;
}

function resetParticles(geometry, hideImmediately = false) {
    // Function remains the same
     if (!geometry) return;
    const count = geometry.attributes.position.count;
    const positions = geometry.attributes.position.array;
    const alphas = geometry.attributes.alpha.array;
    const lifetimes = geometry.attributes.lifetime.array;
    for (let i = 0; i < count; i++) {
         lifetimes[i] = 0.0; alphas[i] = 0.0;
         if (hideImmediately) { positions[i * 3 + 1] = -1000; }
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.alpha.needsUpdate = true;
    geometry.attributes.lifetime.needsUpdate = true;
}


// --- Camera Control ---

function setCameraState(newState) {
    currentCameraState = newState;
    sideViewTimer = 0;

    switch (newState) {
        case CameraState.PRE_RACE:
            targetCameraPosition.set(0, 35, START_LINE_Z + 50);
            targetCameraLookAt.set(0, 0, START_LINE_Z - 30);
            break;
        case CameraState.START_ZOOM:
            targetCameraPosition.set(0, 15, START_LINE_Z + 25);
            targetCameraLookAt.set(0, 2, START_LINE_Z - 50);
            break;
        case CameraState.FOLLOW_LEAD:
            targetCameraPosition.set(0, 18, START_LINE_Z + 40); // Initial guess
            targetCameraLookAt.set(0, 3, START_LINE_Z - 60); // Initial guess
            break;
        case CameraState.SIDE_VIEW:
             const sideOffset = TRACK_WIDTH * 0.8;
             targetCameraPosition.set(sideOffset, 10, START_LINE_Z); // Z updated dynamically
             targetCameraLookAt.set(0, 4, START_LINE_Z); // Z updated dynamically
            break;
        case CameraState.FINISH_APPROACH:
             // Adjusted: Slightly higher, looking more directly at the line
             targetCameraPosition.set(0, 12, FINISH_LINE_Z + 40);
             targetCameraLookAt.set(0, 3, FINISH_LINE_Z);
             break;
        case CameraState.FINISH_LINE:
             // Adjusted: Higher angle behind finish, looking back slightly
             targetCameraPosition.set(0, 15, FINISH_LINE_Z + 25);
             targetCameraLookAt.set(0, 2, FINISH_LINE_Z - 15);
             break;
        case CameraState.WINNER_FOCUS:
             let focusPoint = new THREE.Vector3();
             // Use winner objects' mesh positions
             if (winners.length > 0) {
                winners.slice(0, 3).forEach(wObj => focusPoint.add(wObj.mesh.position));
                focusPoint.divideScalar(Math.min(winners.length, 3));
             } else {
                focusPoint.set(0, 2, FINISH_LINE_Z);
             }
             targetCameraPosition.set(focusPoint.x, focusPoint.y + 12, focusPoint.z + 25); // Higher, further back
             targetCameraLookAt.copy(focusPoint);
             break;
    }
}

function updateCameraState(deltaTime, leadZ) {
    // Function logic remains the same, using adjusted target positions/lookAts
    const transitionSpeed = 1.0;
    const raceProgress = leadZ <= FINISH_LINE_Z ? 1 : Math.abs( (leadZ - START_LINE_Z) / (FINISH_LINE_Z - START_LINE_Z) );


    // State Transitions (adjusted slightly for clarity/timing)
    if (isRacing) {
        if (currentCameraState === CameraState.START_ZOOM && currentCameraPosition.distanceTo(targetCameraPosition) < 2.0) {
            setCameraState(CameraState.FOLLOW_LEAD);
        }
         else if (currentCameraState === CameraState.FOLLOW_LEAD) {
             sideViewTimer += deltaTime;
             if (raceProgress > 0.3 && sideViewTimer > 3 && Math.random() < 0.005 ) { // Chance for side view mid-race
                 setCameraState(CameraState.SIDE_VIEW);
             } else if (raceProgress > 0.70) { // Approach finish earlier
                 setCameraState(CameraState.FINISH_APPROACH);
             }
         }
         else if (currentCameraState === CameraState.SIDE_VIEW) {
            sideViewTimer += deltaTime;
            if (sideViewTimer > SIDE_VIEW_DURATION) {
                setCameraState(CameraState.FOLLOW_LEAD);
             } else if (raceProgress > 0.75) {
                 setCameraState(CameraState.FINISH_APPROACH);
             }
         }
         else if (currentCameraState === CameraState.FINISH_APPROACH && raceProgress > 0.90) { // Switch to finish line view closer to end
             setCameraState(CameraState.FINISH_LINE);
         }
    } else if (raceOver && currentCameraState !== CameraState.WINNER_FOCUS) {
        // Handled explicitly when race ends now
    } else if (!isRacing && !raceOver && currentCameraState !== CameraState.PRE_RACE) {
         setCameraState(CameraState.PRE_RACE);
    }

    // Update Dynamic Targets
    if (currentCameraState === CameraState.FOLLOW_LEAD) {
        targetCameraPosition.z = leadZ + 45;
        targetCameraPosition.y = 18 + Math.sin(clock.getElapsedTime() * 0.5) * 2;
        targetCameraLookAt.set(0, 3, leadZ - 60);
    } else if (currentCameraState === CameraState.SIDE_VIEW) {
         const sideOffset = TRACK_WIDTH * (0.6 + Math.sin(clock.getElapsedTime() * 0.3) * 0.2);
         targetCameraPosition.x = sideOffset;
         targetCameraPosition.z = leadZ + 5;
         targetCameraLookAt.set(0, 4, leadZ - 20);
    }

    // Smooth Interpolation
    currentCameraPosition.lerp(targetCameraPosition, transitionSpeed * deltaTime);
    currentCameraLookAt.lerp(targetCameraLookAt, transitionSpeed * deltaTime);

    camera.position.copy(currentCameraPosition);
    camera.lookAt(currentCameraLookAt);
}


// --- Render Loop ---

function animate() {
    requestAnimationFrame(animate);
    const deltaTime = clock.getDelta();

    // Update racer logic (movement, labels)
    if (isRacing) {
        updateRace(deltaTime);
    } else {
        // Update labels even when not racing if needed (e.g., on reset)
        // updateRacerLabels(); // Or handle within updateRace/reset
    }

    // Update effects
    updateSpeedParticles(deltaTime);
    updateFinishParticles(deltaTime);

    // Update camera
    if (!isRacing) {
         updateCameraState(deltaTime, START_LINE_Z);
    } // updateCameraState is called inside updateRace when racing

    renderer.render(scene, camera);
}

// --- Utilities ---
function onWindowResize() {
    // Function remains the same
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}