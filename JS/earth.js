/* ==========================================================================
   GeoVision 3D Earth Globe & SAR Radar Orbit Visualization
   Powered by Three.js & OrbitControls
   ========================================================================== */

(function () {
  const container = document.getElementById("earth");
  if (!container) return;

  // Scene Setup
  const scene = new THREE.Scene();

  // Camera Setup
  const aspect = container.clientWidth / container.clientHeight || 1;
  const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
  camera.position.set(0, 0, 3.2);

  // WebGL Renderer
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
  });

  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // OrbitControls Initialization
  let controls;
  if (typeof THREE.OrbitControls !== "undefined") {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
  } else if (typeof OrbitControls !== "undefined") {
    controls = new OrbitControls(camera, renderer.domElement);
  }
  
  if (controls) {
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.minDistance = 2.0;
    controls.maxDistance = 6.0;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.2;
  }

  // Earth Globe Geometry & Texture
  const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
  const textureLoader = new THREE.TextureLoader();

  // Procedural Earth Texture Fallback (for file:// protocol or offline fallback)
  function createProceduralEarthTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    // Ocean Gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, "#08101D");
    grad.addColorStop(0.5, "#0F2440");
    grad.addColorStop(1, "#08101D");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // Latitude & Longitude Grid Lines
    ctx.strokeStyle = "rgba(0, 229, 255, 0.18)";
    ctx.lineWidth = 1;
    for (let x = 0; x < 1024; x += 64) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke();
    }
    for (let y = 0; y < 512; y += 64) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1024, y); ctx.stroke();
    }

    // Landmass Stylized Shapes
    ctx.fillStyle = "#10B981";
    ctx.beginPath(); ctx.ellipse(560, 260, 95, 140, 0.15, 0, Math.PI * 2); ctx.fill(); // Africa
    ctx.beginPath(); ctx.ellipse(730, 170, 170, 95, -0.1, 0, Math.PI * 2); ctx.fill(); // Eurasia
    ctx.beginPath(); ctx.ellipse(270, 230, 85, 170, -0.25, 0, Math.PI * 2); ctx.fill(); // Americas
    ctx.beginPath(); ctx.ellipse(830, 360, 65, 45, 0.1, 0, Math.PI * 2); ctx.fill(); // Australia

    // GEE SAR Active Zones Highlight
    ctx.fillStyle = "#00E5FF";
    ctx.beginPath(); ctx.arc(570, 210, 22, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(710, 190, 28, 0, Math.PI * 2); ctx.fill();

    const canvasTexture = new THREE.CanvasTexture(canvas);
    canvasTexture.needsUpdate = true;
    return canvasTexture;
  }

  const earthMaterial = new THREE.MeshStandardMaterial({
    roughness: 0.65,
    metalness: 0.15
  });

  textureLoader.load(
    "images/earth.jpg",
    function (texture) {
      earthMaterial.map = texture;
      earthMaterial.needsUpdate = true;
      console.log("GeoVision 3D Earth Image Texture Loaded Successfully");
    },
    undefined,
    function () {
      console.warn("Using procedural fallback texture for 3D Earth");
      earthMaterial.map = createProceduralEarthTexture();
      earthMaterial.needsUpdate = true;
    }
  );

  const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
  scene.add(earthMesh);

  // Atmosphere Glow Shell
  const atmosphereGeometry = new THREE.SphereGeometry(1.08, 64, 64);
  const atmosphereMaterial = new THREE.MeshBasicMaterial({
    color: 0x00E5FF,
    transparent: true,
    opacity: 0.16,
    side: THREE.BackSide
  });

  const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  scene.add(atmosphereMesh);

  // SAR Radar Orbit Ring 1 (Sentinel-1 Polar Orbit)
  const ring1Geometry = new THREE.RingGeometry(1.4, 1.42, 64);
  const ring1Material = new THREE.MeshBasicMaterial({
    color: 0x00E5FF,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.4
  });

  const ring1 = new THREE.Mesh(ring1Geometry, ring1Material);
  ring1.rotation.x = Math.PI / 3.5;
  ring1.rotation.y = Math.PI / 6;
  scene.add(ring1);

  // SAR Satellite Pulse Beacon Object
  const satelliteGeometry = new THREE.SphereGeometry(0.04, 16, 16);
  const satelliteMaterial = new THREE.MeshBasicMaterial({
    color: 0x10B981
  });
  const satellite = new THREE.Mesh(satelliteGeometry, satelliteMaterial);
  scene.add(satellite);

  // Starfield Particles
  const starsGeometry = new THREE.BufferGeometry();
  const starCount = 1800;
  const starPositions = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount * 3; i += 3) {
    starPositions[i] = (Math.random() - 0.5) * 20;
    starPositions[i + 1] = (Math.random() - 0.5) * 20;
    starPositions[i + 2] = (Math.random() - 0.5) * 20;
  }

  starsGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  const starsMaterial = new THREE.PointsMaterial({
    color: 0xFFFFFF,
    size: 0.018,
    transparent: true,
    opacity: 0.7
  });

  const starfield = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(starfield);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
  sunLight.position.set(5, 3, 5);
  scene.add(sunLight);

  // Animation Loop
  let orbitAngle = 0;
  function animate() {
    requestAnimationFrame(animate);

    // Self Rotation
    earthMesh.rotation.y += 0.0015;

    // Orbit Satellite Position
    orbitAngle += 0.015;
    const r = 1.41;
    const satX = Math.cos(orbitAngle) * r;
    const satZ = Math.sin(orbitAngle) * r;
    
    // Tilt satellite orbit
    satellite.position.x = satX * Math.cos(Math.PI / 6) - satZ * Math.sin(Math.PI / 6);
    satellite.position.y = satX * Math.sin(Math.PI / 3.5);
    satellite.position.z = satZ;

    if (controls) {
      controls.update();
    }

    renderer.render(scene, camera);
  }

  animate();

  // Responsive Window Resize Handler
  window.addEventListener("resize", function () {
    if (!container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
  });
})();