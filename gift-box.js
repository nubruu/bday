// ========================================
// ADVANCED 3D GIFT BOX with Premium Features
// ========================================

(function () {
    let scene, camera, renderer, controls;
    let giftBox, giftLid;
    let particles = [], confettiParticles = [], fireworks = [], stars = [];
    let isOpening = false;
    let isOpened = false;
    let mouse = { x: 0, y: 0 };
    let raycaster, mouseVector;
    let clock = new THREE.Clock();
    let idleTime = 0;
    let hovered = false;

    // Mobile detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Configuration
    const CONFIG = {
        colors: {
            boxBase: 0xe63946,
            boxLid: 0xc1121f,
            ribbon: 0xffd700,
            ribbonShine: 0xffed4e,
        },
        particles: {
            sparkleCount: isMobile ? 25 : 50,
            confettiCount: isMobile ? 100 : 200,
        },
        animations: {
            openDuration: 2500,
            cameraZoom: !isMobile,
        }
    };

    function init() {
        const canvas = document.getElementById('gift-canvas');
        if (!canvas) return;

        // Scene setup
        scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x1a0a2e, 10, 50);

        // Camera
        camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 3, 10);
        camera.lookAt(0, 0, 0);

        // Renderer
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: !isMobile,
            alpha: true,
            powerPreference: isMobile ? "default" : "high-performance"
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = isMobile ? THREE.BasicShadowMap : THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;

        // Lighting
        setupLights();

        // Create elements
        createStarField();
        createGiftBox();
        createSparkleParticles();
        createConfettiSystem();

        // OrbitControls for touch/drag rotation
        controls = new THREE.OrbitControls(camera, canvas);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = true;
        controls.enablePan = false;
        controls.minDistance = 5;
        controls.maxDistance = 15;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;
        controls.touches = {
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN
        };

        // Raycaster
        raycaster = new THREE.Raycaster();
        mouseVector = new THREE.Vector2();

        // Events
        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('click', onGiftClick);
        window.addEventListener('resize', onWindowResize);

        // Start animation
        animate();
    }

    function setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
        mainLight.position.set(5, 10, 7);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 1024;
        mainLight.shadow.mapSize.height = 1024;
        scene.add(mainLight);

        const pinkLight = new THREE.PointLight(0xff6b9d, 1.5, 20);
        pinkLight.position.set(-5, 3, 5);
        scene.add(pinkLight);

        const blueLight = new THREE.PointLight(0x6bb6ff, 1.5, 20);
        blueLight.position.set(5, 3, -5);
        scene.add(blueLight);

        const topLight = new THREE.PointLight(0xffd700, 0.8, 15);
        topLight.position.set(0, 8, 0);
        scene.add(topLight);

        const hemiLight = new THREE.HemisphereLight(0x8040ff, 0x080820, 0.5);
        scene.add(hemiLight);
    }

    function createStarField() {
        const starCount = isMobile ? 150 : 400;
        const starGeometry = new THREE.BufferGeometry();
        const starPositions = new Float32Array(starCount * 3);
        const starSizes = new Float32Array(starCount);

        for (let i = 0; i < starCount; i++) {
            const r = 30 + Math.random() * 20;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;

            starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            starPositions[i * 3 + 2] = r * Math.cos(phi);
            starSizes[i] = Math.random() * 2;
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));

        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.1,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        const starField = new THREE.Points(starGeometry, starMaterial);
        scene.add(starField);
        stars.push(starField);
    }

    function createGiftBox() {
        // Texture loader for photos
        const loader = new THREE.TextureLoader();
        const textures = [
            loader.load('img1.jpeg'),
            loader.load('img2.jpeg'),
            loader.load('img3.jpeg'),
            loader.load('img4.jpeg')
        ];

        // Box base geometry
        const boxGeometry = new THREE.BoxGeometry(2.5, 2.5, 2.5);

        // Materials for each side: [pos-x, neg-x, pos-y, neg-y, pos-z, neg-z]
        // Vertical sides get photos, top/bottom stay red
        const photoMatParams = {
            roughness: 0.4,
            metalness: 0.1
        };

        const baseMatParams = {
            roughness: 0.2,
            metalness: 0.3,
            emissive: 0xff0044,
            emissiveIntensity: 0.3
        };

        const materials = [
            new THREE.MeshStandardMaterial({ ...photoMatParams, map: textures[0] }), // Right
            new THREE.MeshStandardMaterial({ ...photoMatParams, map: textures[1] }), // Left
            new THREE.MeshStandardMaterial({ ...baseMatParams, color: CONFIG.colors.boxBase }),      // Top
            new THREE.MeshStandardMaterial({ ...baseMatParams, color: CONFIG.colors.boxBase }),      // Bottom
            new THREE.MeshStandardMaterial({ ...photoMatParams, map: textures[2] }), // Front
            new THREE.MeshStandardMaterial({ ...photoMatParams, map: textures[3] })  // Back
        ];

        giftBox = new THREE.Mesh(boxGeometry, materials);
        giftBox.castShadow = true;
        giftBox.receiveShadow = true;
        scene.add(giftBox);

        // Lid
        const lidGeometry = new THREE.BoxGeometry(2.65, 0.4, 2.65);
        const lidMaterial = new THREE.MeshStandardMaterial({
            color: CONFIG.colors.boxLid,
            roughness: 0.25,
            metalness: 0.4,
            emissive: 0xff0044,
            emissiveIntensity: 0.3
        });
        giftLid = new THREE.Mesh(lidGeometry, lidMaterial);
        giftLid.castShadow = true;
        giftLid.position.y = 1.45;
        scene.add(giftLid);

        // Ribbon and Bow materials
        const ribbonMaterial = new THREE.MeshStandardMaterial({
            color: CONFIG.colors.ribbon,
            roughness: 0.3,
            metalness: 0.7,
            emissive: CONFIG.colors.ribbonShine,
            emissiveIntensity: 0.2
        });

        // Add ribbons to box and lid (omitted for brevity but normally here)
        // ... (simplified ribbons for reliability)
        const ribbon1 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 2.6, 2.6), ribbonMaterial);
        giftBox.add(ribbon1);
        const ribbon2 = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.6, 0.35), ribbonMaterial);
        giftBox.add(ribbon2);
    }

    function createSparkleParticles() {
        const particleCount = CONFIG.particles.sparkleCount;
        const positions = new Float32Array(particleCount * 3);
        const velocities = [];

        for (let i = 0; i < particleCount; i++) {
            const radius = 3 + Math.random() * 2;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = Math.random() * 3 - 1;
            positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

            velocities.push({
                x: (Math.random() - 0.5) * 0.02,
                y: Math.random() * 0.01,
                z: (Math.random() - 0.5) * 0.02
            });
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({ color: 0xffd700, size: 0.1, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending });
        const system = new THREE.Points(geometry, material);
        scene.add(system);
        particles.push({ system, velocities });
    }

    function createConfettiSystem() {
        const group = new THREE.Group();
        group.visible = false;
        scene.add(group);
        const colors = [0xff6b9d, 0x6bb6ff, 0xffd700, 0xff1744, 0x00e676];

        for (let i = 0; i < CONFIG.particles.confettiCount; i++) {
            const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.15), new THREE.MeshBasicMaterial({ color: colors[i % 5], side: THREE.DoubleSide }));
            mesh.userData = {
                velocity: new THREE.Vector3((Math.random() - 0.5) * 0.2, Math.random() * 0.3 + 0.1, (Math.random() - 0.5) * 0.2),
                rotation: new THREE.Vector3(Math.random() * 0.1, Math.random() * 0.1, Math.random() * 0.1)
            };
            group.add(mesh);
            confettiParticles.push(mesh);
        }
        window.confettiGroup = group;
    }

    function launchFireworks() {
        const colors = [0xff6b9d, 0x6bb6ff, 0xffd700, 0xffffff];
        for (let i = 0; i < (isMobile ? 3 : 5); i++) {
            setTimeout(() => createFirework(colors[i % 4]), i * 400);
        }
    }

    function createFirework(color) {
        const count = isMobile ? 40 : 80;
        const positions = new Float32Array(count * 3);
        const velocities = [];
        const origin = new THREE.Vector3((Math.random() - 0.5) * 10, 2 + Math.random() * 3, (Math.random() - 0.5) * 10);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = origin.x;
            positions[i * 3 + 1] = origin.y;
            positions[i * 3 + 2] = origin.z;
            const speed = 0.1 + Math.random() * 0.2;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            velocities.push(new THREE.Vector3(Math.sin(phi) * Math.cos(theta) * speed, Math.sin(phi) * Math.sin(theta) * speed, Math.cos(phi) * speed));
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const mat = new THREE.PointsMaterial({ color, size: 0.15, transparent: true, opacity: 1, blending: THREE.AdditiveBlending });
        const system = new THREE.Points(geo, mat);
        scene.add(system);
        fireworks.push({ system, velocities, life: 1.0 });
    }

    function onMouseMove(event) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        if (!isOpened) {
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects([giftBox, giftLid]);
            hovered = intersects.length > 0;
            document.body.style.cursor = hovered ? 'pointer' : 'default';
        }
    }

    function onGiftClick() {
        if (isOpened || isOpening) return;
        raycaster.setFromCamera(mouse, camera);
        if (raycaster.intersectObjects([giftBox, giftLid]).length > 0) {
            if (window.haptic) window.haptic.tap();
            openGiftBox();
        }
    }

    function openGiftBox() {
        isOpening = true;
        document.body.style.cursor = 'default';
        if (window.haptic) window.haptic.burst();
        const instruction = document.querySelector('.gift-instruction');
        if (instruction) instruction.style.opacity = '0';
        if (window.confettiGroup) window.confettiGroup.visible = true;
        launchFireworks();

        const startY = giftLid.position.y;
        const startTime = Date.now();
        const duration = CONFIG.animations.openDuration;

        function animateOpen() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            giftLid.position.y = startY + (4 * eased);
            giftLid.rotation.x = -Math.PI * 0.5 * eased;
            giftLid.position.z = -2 * eased;

            if (CONFIG.animations.cameraZoom) {
                camera.position.z = 10 - (3 * eased);
                camera.lookAt(0, 0, 0);
            }

            if (progress < 1) requestAnimationFrame(animateOpen);
            else {
                isOpened = true;
                if (window.onGiftBoxOpened) window.onGiftBoxOpened();
            }
        }
        animateOpen();
    }

    function animate() {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();
        idleTime += delta;

        // Update controls
        if (controls) {
            controls.update();
            // Disable auto-rotate when user is interacting
            if (controls.isUserInteracting !== undefined && controls.isUserInteracting) {
                controls.autoRotate = false;
            }
        }

        if (!isOpening && !isOpened) {
            // Gentle floating animation
            giftBox.position.y = Math.sin(idleTime * 1.5) * 0.1;
            giftLid.position.y = 1.45 + giftBox.position.y;
            const scale = hovered ? 1.05 + Math.sin(Date.now() * 0.005) * 0.02 : 1;
            giftBox.scale.set(scale, scale, scale);
            giftLid.scale.set(scale, scale, scale);
            giftBox.material.emissiveIntensity = hovered ? 0.8 : 0.4;
            giftLid.material.emissiveIntensity = hovered ? 0.7 : 0.3;
        }

        // Stars
        stars.forEach(s => s.rotation.y += delta * 0.05);

        // Sparkles
        particles.forEach(p => {
            const pos = p.system.geometry.attributes.position.array;
            for (let i = 0; i < pos.length; i += 3) {
                pos[i] += p.velocities[i / 3].x; pos[i + 1] += p.velocities[i / 3].y; pos[i + 2] += p.velocities[i / 3].z;
                if (pos[i + 1] > 5) pos[i + 1] = -2;
            }
            p.system.geometry.attributes.position.needsUpdate = true;
        });

        // Confetti
        if (window.confettiGroup && window.confettiGroup.visible) {
            confettiParticles.forEach(c => {
                c.position.add(c.userData.velocity);
                c.rotation.x += c.userData.rotation.x; c.rotation.y += c.userData.rotation.y;
                c.userData.velocity.y -= 0.005;
                if (c.position.y < -5) { c.position.set(0, 0, 0); c.userData.velocity.y = Math.random() * 0.3 + 0.1; }
            });
        }

        // Fireworks
        for (let i = fireworks.length - 1; i >= 0; i--) {
            const f = fireworks[i];
            const pos = f.system.geometry.attributes.position.array;
            f.life -= delta * 0.5;
            for (let j = 0; j < f.velocities.length; j++) {
                pos[j * 3] += f.velocities[j].x; pos[j * 3 + 1] += f.velocities[j].y; pos[j * 3 + 2] += f.velocities[j].z;
                f.velocities[j].y -= 0.002;
            }
            f.system.geometry.attributes.position.needsUpdate = true;
            f.system.material.opacity = f.life;
            if (f.life <= 0) { scene.remove(f.system); fireworks.splice(i, 1); }
        }

        renderer.render(scene, camera);
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    init();
})();
