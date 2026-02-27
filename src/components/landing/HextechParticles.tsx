import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function HextechParticles() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.z = 200;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // Transparent background
    mount.appendChild(renderer.domElement);

    // ── Hextech Data Constellation (Neural Tech) ───────────────────────────
    const PARTICLE_COUNT = 150;
    const MAX_DISTANCE = 35; // How close nodes must be to connect

    // Positions and velocities
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities: { x: number; y: number; z: number }[] = [];

    // Colors: mostly cyan, accents of gold
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const colorCyan = new THREE.Color(0x00e0ff);
    const colorGold = new THREE.Color(0xc8996e);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Scatter in a wide plane
      positions[i * 3]     = (Math.random() - 0.5) * 400; // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 200; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;  // z

      // Subtle drifting velocity
      velocities.push({
        x: (Math.random() - 0.5) * 0.15,
        y: (Math.random() - 0.5) * 0.15,
        z: (Math.random() - 0.5) * 0.05
      });

      // 80% cyan, 20% gold nodes
      const col = Math.random() > 0.8 ? colorGold : colorCyan;
      colors[i * 3]     = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    // Node visual
    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Glowy circle texture for nodes
    const canvas2d = document.createElement('canvas');
    canvas2d.width = canvas2d.height = 32;
    const ctx = canvas2d.getContext('2d')!;
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.2, 'rgba(255,255,255,0.8)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(16, 16, 16, 0, Math.PI * 2); ctx.fill();
    const texture = new THREE.CanvasTexture(canvas2d);

    const particlesMat = new THREE.PointsMaterial({
      size: 3,
      map: texture,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    
    const pointCloud = new THREE.Points(particlesGeo, particlesMat);
    scene.add(pointCloud);

    // ── Connections (Lines) ────────────────────────────────────────────────
    // Maximum possible connections = N * (N-1) / 2 + N (mouse)
    const linesGeo = new THREE.BufferGeometry();
    const positionsConfig = new Float32Array(PARTICLE_COUNT * PARTICLE_COUNT * 6);
    const colorsConfig = new Float32Array(PARTICLE_COUNT * PARTICLE_COUNT * 6);
    
    linesGeo.setAttribute('position', new THREE.BufferAttribute(positionsConfig, 3).setUsage(THREE.DynamicDrawUsage));
    linesGeo.setAttribute('color', new THREE.BufferAttribute(colorsConfig, 3).setUsage(THREE.DynamicDrawUsage));
    
    const linesMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.3,
      depthWrite: false
    });
    
    const linesMesh = new THREE.LineSegments(linesGeo, linesMat);
    scene.add(linesMesh);

    // ── Mouse Interaction ─────────────────────────────────────────────────
    let mouseX = 0, mouseY = 0;
    // Mouse projected into the 3D space
    const targetOrigin = new THREE.Vector3(0, 0, 0);

    const onMouse = (e: MouseEvent) => {
      // Normalize mouse to -1 to 1
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      
      // Project to roughly the z=0 plane of our points
      targetOrigin.x = nx * 200;
      targetOrigin.y = ny * 100;
      
      // Screen parallax pan
      mouseX = nx * 10;
      mouseY = ny * 10;
    };
    window.addEventListener('mousemove', onMouse);

    // ── Animation Loop ────────────────────────────────────────────────────
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      let vertexpos = 0;
      let colorpos = 0;
      let numConnected = 0;
      
      const positionsArr = particlesGeo.attributes.position.array as Float32Array;
      const colorsArr = particlesGeo.attributes.color.array as Float32Array;
      const linePosArr = linesGeo.attributes.position.array as Float32Array;
      const lineColArr = linesGeo.attributes.color.array as Float32Array;

      // Wrap-around bounds 
      const halfX = 220;
      const halfY = 120;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        // Move particles
        positionsArr[i * 3]     += velocities[i].x;
        positionsArr[i * 3 + 1] += velocities[i].y;
        positionsArr[i * 3 + 2] += velocities[i].z;

        // Wrap boundaries
        if (positionsArr[i * 3] > halfX) positionsArr[i * 3] = -halfX;
        if (positionsArr[i * 3] < -halfX) positionsArr[i * 3] = halfX;
        if (positionsArr[i * 3 + 1] > halfY) positionsArr[i * 3 + 1] = -halfY;
        if (positionsArr[i * 3 + 1] < -halfY) positionsArr[i * 3 + 1] = halfY;

        // Connect particles to each other
        for (let j = i + 1; j < PARTICLE_COUNT; j++) {
          const dx = positionsArr[i * 3] - positionsArr[j * 3];
          const dy = positionsArr[i * 3 + 1] - positionsArr[j * 3 + 1];
          const dz = positionsArr[i * 3 + 2] - positionsArr[j * 3 + 2];
          const distSq = dx * dx + dy * dy + dz * dz;

          if (distSq < MAX_DISTANCE * MAX_DISTANCE) {
            // Distance-based opacity (alpha) calculation 
            const alpha = 1.0 - Math.sqrt(distSq) / MAX_DISTANCE;

            // Start point (Node i)
            linePosArr[vertexpos++] = positionsArr[i * 3];
            linePosArr[vertexpos++] = positionsArr[i * 3 + 1];
            linePosArr[vertexpos++] = positionsArr[i * 3 + 2];
            
            lineColArr[colorpos++] = colorsArr[i * 3] * alpha;
            lineColArr[colorpos++] = colorsArr[i * 3 + 1] * alpha;
            lineColArr[colorpos++] = colorsArr[i * 3 + 2] * alpha;

            // End point (Node j)
            linePosArr[vertexpos++] = positionsArr[j * 3];
            linePosArr[vertexpos++] = positionsArr[j * 3 + 1];
            linePosArr[vertexpos++] = positionsArr[j * 3 + 2];

            lineColArr[colorpos++] = colorsArr[j * 3] * alpha;
            lineColArr[colorpos++] = colorsArr[j * 3 + 1] * alpha;
            lineColArr[colorpos++] = colorsArr[j * 3 + 2] * alpha;

            numConnected++;
          }
        }

        // Connect to mouse interaction
        const mdx = positionsArr[i * 3] - targetOrigin.x;
        const mdy = positionsArr[i * 3 + 1] - targetOrigin.y;
        const mouseDistSq = mdx * mdx + mdy * mdy;
        const MOUSE_RADIUS = 60;

        if (mouseDistSq < MOUSE_RADIUS * MOUSE_RADIUS) {
          const mAlpha = 1.0 - Math.sqrt(mouseDistSq) / MOUSE_RADIUS;
          
          linePosArr[vertexpos++] = positionsArr[i * 3];
          linePosArr[vertexpos++] = positionsArr[i * 3 + 1];
          linePosArr[vertexpos++] = positionsArr[i * 3 + 2];
          
          lineColArr[colorpos++] = colorsArr[i * 3] * mAlpha;
          lineColArr[colorpos++] = colorsArr[i * 3 + 1] * mAlpha;
          lineColArr[colorpos++] = colorsArr[i * 3 + 2] * mAlpha;

          linePosArr[vertexpos++] = targetOrigin.x;
          linePosArr[vertexpos++] = targetOrigin.y;
          linePosArr[vertexpos++] = 0;

          // Mouse side glows cyan
          lineColArr[colorpos++] = colorCyan.r * mAlpha * 1.5;
          lineColArr[colorpos++] = colorCyan.g * mAlpha * 1.5;
          lineColArr[colorpos++] = colorCyan.b * mAlpha * 1.5;

          numConnected++;
        }
      }

      particlesGeo.attributes.position.needsUpdate = true;
      
      linesGeo.setDrawRange(0, numConnected * 2);
      linesGeo.attributes.position.needsUpdate = true;
      linesGeo.attributes.color.needsUpdate = true;

      // Parallax camera movement
      camera.position.x += (mouseX - camera.position.x) * 0.05;
      camera.position.y += (-mouseY - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };
    animate();

    // ── Resize handler ────────────────────────────────────────────────────
    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
      linesGeo.dispose();
      linesMat.dispose();
      texture.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-auto"
      style={{ zIndex: 0 }}
    />
  );
}
