import * as THREE from "three";

const TRAIL_LENGTH = 180;

const VERTEX_SHADER = `
  attribute float aSeed;

  uniform float uTime;
  uniform float uPointSize;
  uniform float uEnergy;

  varying float vAlpha;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float pulse = 0.88 + 0.12 * sin(aSeed * 91.7 + uTime * 1.35);
    float perspective = clamp(7.0 / max(2.0, -mvPosition.z), 0.72, 1.45);

    gl_PointSize = clamp(
      uPointSize * pulse * perspective,
      1.0,
      3.2
    );

    vAlpha = (0.24 + uEnergy * 0.08) * pulse;
  }
`;

const FRAGMENT_SHADER = `
  varying float vAlpha;

  void main() {
    vec2 point = gl_PointCoord - vec2(0.5);
    float distanceFromCenter = length(point);

    if (distanceFromCenter > 0.5) {
      discard;
    }

    float softEdge =
      1.0 - smoothstep(0.18, 0.5, distanceFromCenter);

    gl_FragColor = vec4(
      vec3(0.94, 0.935, 0.91),
      vAlpha * softEdge
    );
  }
`;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function smoothstep01(value: number) {
  const x = clamp01(value);
  return x * x * (3 - 2 * x);
}

function hash(index: number) {
  const value = Math.sin(index * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function particleBudget() {
  const memory = (
    navigator as Navigator & {
      deviceMemory?: number;
    }
  ).deviceMemory;
  const cores = navigator.hardwareConcurrency ?? 4;
  const narrow = window.innerWidth < 760;

  if (narrow || (memory !== undefined && memory <= 4)) {
    return 2_200;
  }

  if (
    (memory !== undefined && memory <= 8) ||
    cores <= 4
  ) {
    return 3_600;
  }

  return 5_200;
}

function toVisual(
  x: number,
  y: number,
  z: number,
): [number, number, number] {
  return [
    x * 0.094,
    (z - 24) * 0.073,
    y * 0.064,
  ];
}

function createInitialState(count: number) {
  const state = new Float32Array(count * 3);
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    const offsetX =
      i === 0
        ? 0
        : i === 1
          ? 0.00002
          : (hash(i * 3) - 0.5) * 0.006;
    const offsetY =
      i < 2 ? 0 : (hash(i * 3 + 1) - 0.5) * 0.004;
    const offsetZ =
      i < 2 ? 0 : (hash(i * 3 + 2) - 0.5) * 0.01;

    const x = 0.1 + offsetX;
    const y = offsetY;
    const z = 20 + offsetZ;

    state[i * 3] = x;
    state[i * 3 + 1] = y;
    state[i * 3 + 2] = z;

    const [vx, vy, vz] = toVisual(x, y, z);

    positions[i * 3] = vx;
    positions[i * 3 + 1] = vy;
    positions[i * 3 + 2] = vz;
    seeds[i] = hash(i + 11);
  }

  return { state, positions, seeds };
}

function visibleParticleCount(
  elapsed: number,
  maxParticles: number,
) {
  if (elapsed < 1.25) {
    return 1;
  }

  if (elapsed < 2.75) {
    return 2;
  }

  if (elapsed < 4.4) {
    return Math.round(
      2 + smoothstep01((elapsed - 2.75) / 1.65) * 62,
    );
  }

  if (elapsed < 6.7) {
    const target = Math.min(1_100, maxParticles);

    return Math.round(
      64 +
        smoothstep01((elapsed - 4.4) / 2.3) *
          (target - 64),
    );
  }

  if (elapsed < 9.4) {
    const start = Math.min(1_100, maxParticles);

    return Math.round(
      start +
        smoothstep01((elapsed - 6.7) / 2.7) *
          (maxParticles - start),
    );
  }

  return maxParticles;
}

export class ChaosEngine {
  private readonly canvas: HTMLCanvasElement;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly group = new THREE.Group();

  private readonly geometry: THREE.BufferGeometry;
  private readonly positionAttribute: THREE.BufferAttribute;
  private readonly material: THREE.ShaderMaterial;
  private readonly points: THREE.Points;

  private readonly particleCount: number;
  private readonly state: Float32Array;
  private readonly positions: Float32Array;

  private readonly trailGeometries: [
    THREE.BufferGeometry,
    THREE.BufferGeometry,
  ];
  private readonly trailAttributes: [
    THREE.BufferAttribute,
    THREE.BufferAttribute,
  ];
  private readonly trailBuffers: [
    Float32Array,
    Float32Array,
  ];
  private readonly trails: [THREE.Line, THREE.Line];
  private trailSamples = 0;
  private trailTick = 0;

  private frame = 0;
  private running = false;
  private startTime = 0;
  private previousFrameTime = 0;

  private readonly pointer = new THREE.Vector2();
  private readonly pointerTarget = new THREE.Vector2();
  private readonly lastPointer = new THREE.Vector2();
  private pointerEnergy = 0;
  private lastPointerTime = performance.now();

  private readonly onResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / Math.max(height, 1);
    this.camera.updateProjectionMatrix();

    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 1.25),
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

    const distance =
      this.pointerTarget.distanceTo(this.lastPointer);
    const velocity = distance / dt;

    this.pointerEnergy = Math.min(
      1,
      this.pointerEnergy + velocity * 12,
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
      45,
      window.innerWidth / Math.max(window.innerHeight, 1),
      0.1,
      100,
    );
    this.camera.position.set(0, 0.1, 7.0);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.setClearColor(0x08090b, 1);

    this.particleCount = particleBudget();

    const { state, positions, seeds } =
      createInitialState(this.particleCount);

    this.state = state;
    this.positions = positions;

    this.geometry = new THREE.BufferGeometry();
    this.positionAttribute = new THREE.BufferAttribute(
      this.positions,
      3,
    ).setUsage(THREE.DynamicDrawUsage);

    this.geometry.setAttribute(
      "position",
      this.positionAttribute,
    );
    this.geometry.setAttribute(
      "aSeed",
      new THREE.BufferAttribute(seeds, 1),
    );
    this.geometry.setDrawRange(0, 1);

    this.material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uPointSize: { value: 2.2 },
        uEnergy: { value: 0 },
      },
    });

    this.points = new THREE.Points(
      this.geometry,
      this.material,
    );
    this.group.add(this.points);

    const trailA = new Float32Array(TRAIL_LENGTH * 3);
    const trailB = new Float32Array(TRAIL_LENGTH * 3);

    const trailGeometryA = new THREE.BufferGeometry();
    const trailGeometryB = new THREE.BufferGeometry();

    const trailAttributeA = new THREE.BufferAttribute(
      trailA,
      3,
    ).setUsage(THREE.DynamicDrawUsage);
    const trailAttributeB = new THREE.BufferAttribute(
      trailB,
      3,
    ).setUsage(THREE.DynamicDrawUsage);

    trailGeometryA.setAttribute("position", trailAttributeA);
    trailGeometryB.setAttribute("position", trailAttributeB);
    trailGeometryA.setDrawRange(0, 0);
    trailGeometryB.setDrawRange(0, 0);

    const trailMaterialA = new THREE.LineBasicMaterial({
      color: 0xf1efe9,
      transparent: true,
      opacity: 0.46,
      depthWrite: false,
    });
    const trailMaterialB = new THREE.LineBasicMaterial({
      color: 0xa7abb3,
      transparent: true,
      opacity: 0.27,
      depthWrite: false,
    });

    const lineA = new THREE.Line(
      trailGeometryA,
      trailMaterialA,
    );
    const lineB = new THREE.Line(
      trailGeometryB,
      trailMaterialB,
    );

    lineB.visible = false;

    this.trailGeometries = [
      trailGeometryA,
      trailGeometryB,
    ];
    this.trailAttributes = [
      trailAttributeA,
      trailAttributeB,
    ];
    this.trailBuffers = [trailA, trailB];
    this.trails = [lineA, lineB];

    this.group.add(lineA, lineB);
    this.group.rotation.set(-0.06, 0.2, -0.16);
    this.scene.add(this.group);

    this.onResize();

    window.addEventListener("resize", this.onResize);
    window.addEventListener(
      "pointermove",
      this.onPointerMove,
      { passive: true },
    );
    document.addEventListener(
      "visibilitychange",
      this.onVisibility,
    );
  }

  start() {
    if (this.running) {
      return;
    }

    this.running = true;
    const now = performance.now();

    if (this.startTime === 0) {
      this.startTime = now;
    }

    this.previousFrameTime = now;
    this.frame = requestAnimationFrame(this.animate);
  }

  private pause() {
    this.running = false;

    if (this.frame) {
      cancelAnimationFrame(this.frame);
      this.frame = 0;
    }
  }

  private integrate(frameDelta: number) {
    const sigma =
      10 + this.pointer.y * 0.7;
    const rho =
      28 +
      this.pointer.x * 1.8 +
      this.pointerEnergy * 2.4;
    const beta = 8 / 3;

    const dt =
      0.0044 *
      Math.min(1.45, Math.max(0.65, frameDelta / 16.67));

    const substeps = frameDelta < 26 ? 2 : 1;
    const step = dt / substeps;

    for (let s = 0; s < substeps; s += 1) {
      for (let i = 0; i < this.particleCount; i += 1) {
        const index = i * 3;

        let x = this.state[index];
        let y = this.state[index + 1];
        let z = this.state[index + 2];

        const turbulence =
          (hash(i + 31) - 0.5) *
          this.pointerEnergy *
          0.045;

        const dx = sigma * (y - x);
        const dy =
          x * (rho - z) -
          y +
          turbulence;
        const dz = x * y - beta * z;

        x += dx * step;
        y += dy * step;
        z += dz * step;

        this.state[index] = x;
        this.state[index + 1] = y;
        this.state[index + 2] = z;
      }
    }

    for (let i = 0; i < this.particleCount; i += 1) {
      const index = i * 3;
      const [x, y, z] = toVisual(
        this.state[index],
        this.state[index + 1],
        this.state[index + 2],
      );

      this.positions[index] = x;
      this.positions[index + 1] = y;
      this.positions[index + 2] = z;
    }

    this.positionAttribute.needsUpdate = true;
  }

  private updateTrails(elapsed: number) {
    this.trailTick += 1;

    if (this.trailTick % 2 !== 0) {
      return;
    }

    for (let branch = 0; branch < 2; branch += 1) {
      const sourceIndex = branch * 3;
      const trail = this.trailBuffers[branch];

      trail.copyWithin(0, 3);

      const targetIndex = (TRAIL_LENGTH - 1) * 3;

      trail[targetIndex] =
        this.positions[sourceIndex];
      trail[targetIndex + 1] =
        this.positions[sourceIndex + 1];
      trail[targetIndex + 2] =
        this.positions[sourceIndex + 2];

      this.trailAttributes[branch].needsUpdate = true;
    }

    this.trailSamples = Math.min(
      TRAIL_LENGTH,
      this.trailSamples + 1,
    );

    const start =
      Math.max(0, TRAIL_LENGTH - this.trailSamples);

    this.trailGeometries[0].setDrawRange(
      start,
      this.trailSamples,
    );
    this.trailGeometries[1].setDrawRange(
      start,
      this.trailSamples,
    );

    this.trails[1].visible = elapsed > 1.55;
  }

  private readonly animate = (now: number) => {
    if (!this.running) {
      return;
    }

    const elapsed = (now - this.startTime) / 1000;
    const frameDelta = Math.min(
      40,
      Math.max(8, now - this.previousFrameTime),
    );
    this.previousFrameTime = now;

    this.pointer.lerp(this.pointerTarget, 0.055);
    this.pointerEnergy *= 0.92;

    this.integrate(frameDelta);
    this.updateTrails(elapsed);

    const visible = visibleParticleCount(
      elapsed,
      this.particleCount,
    );
    this.geometry.setDrawRange(0, visible);

    this.material.uniforms.uTime.value = elapsed;
    this.material.uniforms.uEnergy.value =
      this.pointerEnergy;

    const drift = smoothstep01((elapsed - 4) / 6);

    this.group.rotation.y =
      0.2 + Math.sin(elapsed * 0.075) * 0.08 * drift;
    this.group.rotation.z =
      -0.16 + Math.sin(elapsed * 0.052) * 0.035 * drift;

    this.camera.position.x +=
      (this.pointer.x * 0.09 - this.camera.position.x) *
      0.025;
    this.camera.position.y +=
      (0.1 + this.pointer.y * 0.045 - this.camera.position.y) *
      0.025;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
    this.frame = requestAnimationFrame(this.animate);
  };

  dispose() {
    this.pause();

    window.removeEventListener("resize", this.onResize);
    window.removeEventListener(
      "pointermove",
      this.onPointerMove,
    );
    document.removeEventListener(
      "visibilitychange",
      this.onVisibility,
    );

    this.scene.remove(this.group);

    this.geometry.dispose();
    this.material.dispose();

    for (const geometry of this.trailGeometries) {
      geometry.dispose();
    }

    for (const trail of this.trails) {
      const material = trail.material;

      if (Array.isArray(material)) {
        for (const item of material) {
          item.dispose();
        }
      } else {
        material.dispose();
      }
    }

    this.renderer.dispose();
  }
}
