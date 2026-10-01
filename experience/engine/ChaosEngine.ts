import * as THREE from "three";

const VERTEX_SHADER = `
  attribute float aProgress;

  uniform float uTime;
  uniform float uReveal;
  uniform float uPointSize;
  uniform vec2 uPointer;
  uniform float uPointerEnergy;

  varying float vAlpha;

  void main() {
    vec3 p = position;

    float fieldWave =
      sin((p.x - uPointer.x * 1.6) * 3.7 + uTime * 1.1) *
      cos((p.y - uPointer.y * 1.2) * 4.3 - uTime * 0.8);

    float perturbation = fieldWave * uPointerEnergy * 0.07;

    p.z += perturbation;
    p.x += -uPointer.y * perturbation * 0.18;
    p.y += uPointer.x * perturbation * 0.18;

    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float visible = 1.0 - step(uReveal, aProgress);
    float head = 1.0 - smoothstep(0.0, 0.035, abs(aProgress - uReveal));

    vAlpha = visible * (0.12 + head * 0.88);

    gl_PointSize =
      uPointSize *
      (1.0 + head * 1.9) *
      (210.0 / max(1.0, -mvPosition.z));
  }
`;

const FRAGMENT_SHADER = `
  varying float vAlpha;

  void main() {
    vec2 point = gl_PointCoord - vec2(0.5);
    float d = length(point);

    if (d > 0.5) {
      discard;
    }

    float softEdge = 1.0 - smoothstep(0.22, 0.5, d);
    gl_FragColor = vec4(vec3(0.94), vAlpha * softEdge);
  }
`;

type TrajectoryBuffers = {
  positions: Float32Array;
  progress: Float32Array;
};

function createLorenzTrajectories(count: number): TrajectoryBuffers {
  const evenCount = count % 2 === 0 ? count : count - 1;
  const perBranch = evenCount / 2;

  const positions = new Float32Array(evenCount * 3);
  const progress = new Float32Array(evenCount);

  const raw: Array<[number, number, number]> = [];

  const sigma = 10;
  const rho = 28;
  const beta = 8 / 3;
  const dt = 0.0052;

  for (let branch = 0; branch < 2; branch += 1) {
    let x = 0.01 + branch * 0.000001;
    let y = 0;
    let z = 0;

    for (let i = 0; i < perBranch; i += 1) {
      const dx = sigma * (y - x);
      const dy = x * (rho - z) - y;
      const dz = x * y - beta * z;

      x += dx * dt;
      y += dy * dt;
      z += dz * dt;

      raw.push([x, y, z]);
    }
  }

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let minZ = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let maxZ = Number.NEGATIVE_INFINITY;

  for (const [x, y, z] of raw) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    minZ = Math.min(minZ, z);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
    maxZ = Math.max(maxZ, z);
  }

  const centerX = (minX + maxX) * 0.5;
  const centerY = (minY + maxY) * 0.5;
  const centerZ = (minZ + maxZ) * 0.5;
  const maxSpan = Math.max(
    maxX - minX,
    maxY - minY,
    maxZ - minZ,
  );
  const scale = 3.2 / Math.max(maxSpan, 0.0001);

  for (let i = 0; i < raw.length; i += 1) {
    const [x, y, z] = raw[i];
    const branchIndex = i % perBranch;

    positions[i * 3] = (x - centerX) * scale;
    positions[i * 3 + 1] = (y - centerY) * scale;
    positions[i * 3 + 2] = (z - centerZ) * scale;
    progress[i] = branchIndex / Math.max(1, perBranch - 1);
  }

  return { positions, progress };
}

function smoothstep01(value: number) {
  const x = Math.min(1, Math.max(0, value));
  return x * x * (3 - 2 * x);
}

function particleBudget() {
  const memory = (
    navigator as Navigator & {
      deviceMemory?: number;
    }
  ).deviceMemory;

  const narrow = window.innerWidth < 760;

  if (narrow || (memory !== undefined && memory <= 4)) {
    return 7_000;
  }

  return 16_000;
}

export class ChaosEngine {
  private readonly canvas: HTMLCanvasElement;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly geometry: THREE.BufferGeometry;
  private readonly material: THREE.ShaderMaterial;
  private readonly points: THREE.Points;

  private frame = 0;
  private running = false;
  private startTime = 0;
  private lastPointer = new THREE.Vector2();
  private pointer = new THREE.Vector2();
  private pointerTarget = new THREE.Vector2();
  private pointerEnergy = 0;
  private lastPointerTime = performance.now();

  private readonly onResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / Math.max(height, 1);
    this.camera.updateProjectionMatrix();

    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 1.75),
    );
    this.renderer.setSize(width, height, false);
  };

  private readonly onPointerMove = (event: PointerEvent) => {
    const now = performance.now();
    const dt = Math.max(16, now - this.lastPointerTime);

    this.pointerTarget.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -((event.clientY / window.innerHeight) * 2 - 1),
    );

    const distance = this.pointerTarget.distanceTo(this.lastPointer);
    const velocity = distance / dt;

    this.pointerEnergy = Math.min(
      1,
      this.pointerEnergy + velocity * 18,
    );

    this.lastPointer.copy(this.pointerTarget);
    this.lastPointerTime = now;
  };

  private readonly onVisibility = () => {
    if (document.hidden) {
      this.pause();
      return;
    }

    if (!this.running) {
      this.start();
    }
  };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      46,
      window.innerWidth / Math.max(window.innerHeight, 1),
      0.1,
      100,
    );
    this.camera.position.set(0, 0.15, 5.5);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });

    this.renderer.setClearColor(0x08090b, 1);

    const { positions, progress } =
      createLorenzTrajectories(particleBudget());

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    this.geometry.setAttribute(
      "aProgress",
      new THREE.BufferAttribute(progress, 1),
    );

    this.material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uReveal: { value: 0.0002 },
        uPointSize: { value: 8.0 },
        uPointer: { value: new THREE.Vector2() },
        uPointerEnergy: { value: 0 },
      },
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.rotation.set(-0.08, 0.2, -0.2);
    this.scene.add(this.points);

    this.onResize();

    window.addEventListener("resize", this.onResize);
    window.addEventListener("pointermove", this.onPointerMove, {
      passive: true,
    });
    document.addEventListener("visibilitychange", this.onVisibility);
  }

  start() {
    if (this.running) {
      return;
    }

    this.running = true;
    this.startTime = performance.now();
    this.frame = requestAnimationFrame(this.animate);
  }

  private pause() {
    this.running = false;

    if (this.frame) {
      cancelAnimationFrame(this.frame);
      this.frame = 0;
    }
  }

  private readonly animate = (now: number) => {
    if (!this.running) {
      return;
    }

    const elapsed = (now - this.startTime) / 1000;

    let reveal = 0.0002;

    if (elapsed > 1.1) {
      reveal =
        0.0002 +
        smoothstep01((elapsed - 1.1) / 7.3) * 0.9998;
    }

    this.pointer.lerp(this.pointerTarget, 0.045);
    this.pointerEnergy *= 0.94;

    this.material.uniforms.uTime.value = elapsed;
    this.material.uniforms.uReveal.value = Math.min(1, reveal);
    this.material.uniforms.uPointer.value.copy(this.pointer);
    this.material.uniforms.uPointerEnergy.value =
      this.pointerEnergy;

    const settled = smoothstep01((elapsed - 3.5) / 6);
    this.points.rotation.y =
      0.2 + Math.sin(elapsed * 0.08) * 0.09 * settled;
    this.points.rotation.z =
      -0.2 + Math.sin(elapsed * 0.06) * 0.04 * settled;

    this.renderer.render(this.scene, this.camera);

    this.frame = requestAnimationFrame(this.animate);
  };

  dispose() {
    this.pause();

    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("pointermove", this.onPointerMove);
    document.removeEventListener(
      "visibilitychange",
      this.onVisibility,
    );

    this.scene.remove(this.points);
    this.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
  }
}
