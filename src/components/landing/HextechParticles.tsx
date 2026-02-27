import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function HextechParticles() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000,
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // ── Particle system ──────────────────────────────────────────────────
    const PARTICLE_COUNT = 280;
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const speeds = new Float32Array(PARTICLE_COUNT);

    // Hextech palette: gold (#c8996e), cyan (#00e0ff), purple (#8a4fff)
    const palette = [
      new THREE.Color(0xc8996e), // gold
      new THREE.Color(0xc8996e),
      new THREE.Color(0x00e0ff), // cyan
      new THREE.Color(0x00e0ff),
      new THREE.Color(0x8a4fff), // purple
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Spread across wide area
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;

      const col = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      sizes[i] = Math.random() * 12 + 2;
      speeds[i] = Math.random() * 0.004 + 0.001;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    // Glowing circle texture
    const canvas2d = document.createElement("canvas");
    canvas2d.width = canvas2d.height = 64;
    const ctx = canvas2d.getContext("2d")!;
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.3, "rgba(255,255,255,0.6)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(32, 32, 32, 0, Math.PI * 2);
    ctx.fill();
    const texture = new THREE.CanvasTexture(canvas2d);

    const mat = new THREE.PointsMaterial({
      size: 0.12,
      map: texture,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    // Scale size attribute manually
    mat.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader.replace(
        "gl_PointSize = size;",
        "gl_PointSize = size * (300.0 / -mvPosition.z);",
      );
    };

    const particles = new THREE.Points(geo, mat);
    scene.add(particles);

    // ── Animation ────────────────────────────────────────────────────────
    let animId: number;
    let mouseX = 0,
      mouseY = 0;

    const onMouse = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 0.5;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 0.5;
    };
    window.addEventListener("mousemove", onMouse);

    const posArr = geo.attributes.position.array as Float32Array;
    const t0 = Date.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = (Date.now() - t0) * 0.001;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        // Gentle upward drift + horizontal sway
        posArr[i * 3 + 1] += speeds[i];
        posArr[i * 3] += Math.sin(t * 0.3 + i) * 0.001;

        // Wrap around when particle drifts too high
        if (posArr[i * 3 + 1] > 6) posArr[i * 3 + 1] = -6;
      }
      geo.attributes.position.needsUpdate = true;

      // Subtle camera drift following mouse
      camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.02;
      camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.02;
      camera.lookAt(scene.position);

      // Slow overall rotation
      particles.rotation.y = t * 0.02;

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
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      geo.dispose();
      mat.dispose();
      texture.dispose();
      if (mount.contains(renderer.domElement))
        mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}
