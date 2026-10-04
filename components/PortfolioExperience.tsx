"use client";

import { useEffect, useRef, useState } from "react";
import { capabilityGroups } from "@/content/capabilities";
import type { Profile } from "@/content/profile";
import { resume } from "@/content/resume";
import { signalSnapshot } from "@/content/signals";
import type { PortfolioStats } from "@/lib/stats";

type Props = {
  profile: Profile;
  stats: PortfolioStats;
};

type PendulumState = {
  a1: number;
  a2: number;
  w1: number;
  w2: number;
};

type CameraPreset = {
  scale: number;
  focusX: number;
  focusY: number;
};

const M1 = 1;
const M2 = 1;
const L1 = 1;
const L2 = 1;
const G = 9.81;
const PENDULUM_COUNT = 200;
const ANGLE_DELTA = (0.1 * Math.PI) / 180;
const CHAPTER_COUNT = 7;
const SEED_A = Math.floor(PENDULUM_COUNT / 2) - 1;
const SEED_B = Math.floor(PENDULUM_COUNT / 2);

const CAMERA_PRESETS: CameraPreset[] = [
  { scale: 1.0, focusX: 0.5, focusY: 0.48 },
  { scale: 1.42, focusX: 0.5, focusY: 0.42 },
  { scale: 1.75, focusX: 0.37, focusY: 0.58 },
  { scale: 2.15, focusX: 0.63, focusY: 0.56 },
  { scale: 2.65, focusX: 0.31, focusY: 0.62 },
  { scale: 2.65, focusX: 0.69, focusY: 0.62 },
  { scale: 1.18, focusX: 0.5, focusY: 0.5 },
];

function metric(value: number | null) {
  return value === null ? "—" : value.toLocaleString("en-US");
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function easeInOutCubic(value: number) {
  const t = clamp01(value);
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutCubic(value: number) {
  const t = clamp01(value);
  return 1 - Math.pow(1 - t, 3);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function stepPendulum(state: PendulumState, dt: number) {
  const { a1, a2, w1, w2 } = state;
  const c = Math.cos(a1 - a2);
  const s = Math.sin(a1 - a2);
  const denominator =
    2 * M1 + M2 - M2 * Math.cos(2 * a1 - 2 * a2);

  const aa1 =
    (
      -G * (2 * M1 + M2) * Math.sin(a1)
      - M2 * G * Math.sin(a1 - 2 * a2)
      - 2 * s * M2 * (w2 * w2 * L2 + w1 * w1 * L1 * c)
    ) /
    (L1 * denominator);

  const aa2 =
    (
      2 * s *
      (
        w1 * w1 * L1 * (M1 + M2)
        + G * (M1 + M2) * Math.cos(a1)
        + w2 * w2 * L2 * M2 * c
      )
    ) /
    (L2 * denominator);

  state.w1 += aa1 * dt;
  state.w2 += aa2 * dt;
  state.a1 += state.w1 * dt;
  state.a2 += state.w2 * dt;
}

function endPoint(
  state: PendulumState,
  originX: number,
  originY: number,
  arm: number,
) {
  const x1 = originX + Math.sin(state.a1) * arm;
  const y1 = originY + Math.cos(state.a1) * arm;
  const x2 = x1 + Math.sin(state.a2) * arm;
  const y2 = y1 + Math.cos(state.a2) * arm;

  return { x1, y1, x2, y2 };
}

function PendulumField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reduced) return;

    const story = document.getElementById("pendulum-story");
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx || !story) return;

    const trailCanvas = document.createElement("canvas");
    const trailCtx = trailCanvas.getContext("2d");
    if (!trailCtx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let last = performance.now();
    let accumulator = 0;
    let hidden = false;
    let frameCount = 0;
    let storyProgress = 0;
    let targetStoryProgress = 0;
    const introStartedAt = performance.now();

    const states = Array.from(
      { length: PENDULUM_COUNT },
      (_, index): PendulumState => ({
        a1:
          Math.PI * 0.72 +
          (index - (PENDULUM_COUNT - 1) / 2) * ANGLE_DELTA,
        a2: Math.PI * 0.46,
        w1: 0,
        w2: 0,
      }),
    );

    const previousEnds = new Float32Array(PENDULUM_COUNT * 2);
    previousEnds.fill(Number.NaN);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.2);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      trailCanvas.width = Math.round(width * dpr);
      trailCanvas.height = Math.round(height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      trailCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      previousEnds.fill(Number.NaN);
    };

    const updateStoryProgress = () => {
      const rect = story.getBoundingClientRect();
      const scrollable = Math.max(1, story.offsetHeight - window.innerHeight);
      targetStoryProgress = clamp01(-rect.top / scrollable);
    };

    const perturb = (event: PointerEvent) => {
      const px = event.clientX / Math.max(1, width) - 0.5;
      const py = event.clientY / Math.max(1, height) - 0.5;
      const kick = (px * 0.7 + py * 0.3) * 0.000025;

      for (let index = 0; index < states.length; index += 1) {
        states[index].w2 += kick * (0.45 + index / states.length);
      }
    };

    const onVisibility = () => {
      hidden = document.hidden;
      if (!hidden) {
        last = performance.now();
      }
    };

    const applyCamera = () => {
      const chapterFloat = storyProgress * (CHAPTER_COUNT - 1);
      const index = Math.min(
        CHAPTER_COUNT - 2,
        Math.max(0, Math.floor(chapterFloat)),
      );
      const local = easeInOutCubic(chapterFloat - index);
      const current = CAMERA_PRESETS[index];
      const next = CAMERA_PRESETS[index + 1];

      const scale = lerp(current.scale, next.scale, local);
      const focusX = lerp(current.focusX, next.focusX, local) * width;
      const focusY = lerp(current.focusY, next.focusY, local) * height;

      ctx.translate(width * 0.5, height * 0.5);
      ctx.scale(scale, scale);
      ctx.translate(-focusX, -focusY);
    };

    const frame = (now: number) => {
      if (hidden) {
        last = now;
        raf = requestAnimationFrame(frame);
        return;
      }

      const delta = Math.min(34, now - last);
      last = now;
      accumulator += delta / 1000;
      storyProgress += (targetStoryProgress - storyProgress) * 0.085;

      const introElapsed = now - introStartedAt;
      const structureReveal = easeOutCubic(
        (introElapsed - 250) / 1750,
      );
      const motionReveal = easeOutCubic(
        (introElapsed - 850) / 1900,
      );
      const trailReveal = easeOutCubic(
        (introElapsed - 1500) / 2800,
      );
      const colorReveal = easeOutCubic(
        (introElapsed - 2200) / 3000,
      );
      const atmosphereReveal = easeOutCubic(
        (introElapsed - 650) / 2600,
      );

      const fixed = 1 / 100;
      let steps = 0;
      const stepMultiplier = 0.12 + motionReveal * 0.88;

      while (accumulator >= fixed && steps < 3) {
        for (const state of states) {
          stepPendulum(state, fixed * stepMultiplier);
        }
        accumulator -= fixed;
        steps += 1;
      }

      const arm = Math.min(width, height) * 0.16;
      const originX = width * 0.5;
      const originY = height * 0.43;

      if (frameCount % 2 === 0) {
        trailCtx.save();
        trailCtx.globalCompositeOperation = "destination-out";
        trailCtx.fillStyle =
          `rgba(0,0,0,${0.058 - trailReveal * 0.032})`;
        trailCtx.fillRect(0, 0, width, height);
        trailCtx.restore();

        trailCtx.globalCompositeOperation = "source-over";

        const fieldReveal = easeOutCubic(
          (introElapsed - 3300) / 2500,
        );

        for (let index = 0; index < states.length; index += 1) {
          const p = endPoint(
            states[index],
            originX,
            originY,
            arm,
          );
          const px = previousEnds[index * 2];
          const py = previousEnds[index * 2 + 1];
          const isSeed = index === SEED_A || index === SEED_B;

          if (Number.isFinite(px) && Number.isFinite(py)) {
            const hue = (index / PENDULUM_COUNT) * 330 + 10;
            const saturation = isSeed
              ? 8 + colorReveal * 72
              : 14 + colorReveal * 82;
            const lightness = 78 - colorReveal * 14;
            const alpha = isSeed
              ? 0.055 + trailReveal * 0.42
              : (0.006 + trailReveal * 0.34) * fieldReveal;

            if (alpha > 0.003) {
              trailCtx.beginPath();
              trailCtx.moveTo(px, py);
              trailCtx.lineTo(p.x2, p.y2);
              trailCtx.strokeStyle =
                `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
              trailCtx.lineWidth = isSeed
                ? 0.7 + trailReveal * 0.5
                : 0.34 + trailReveal * 0.32;
              trailCtx.stroke();
            }
          }

          previousEnds[index * 2] = p.x2;
          previousEnds[index * 2 + 1] = p.y2;
        }
      }

      ctx.fillStyle = "#010203";
      ctx.fillRect(0, 0, width, height);

      const atmosphere = ctx.createRadialGradient(
        originX,
        originY,
        16,
        originX,
        height * 0.52,
        Math.max(width, height) * 0.62,
      );
      atmosphere.addColorStop(
        0,
        `rgba(255, 178, 72, ${0.045 * atmosphereReveal})`,
      );
      atmosphere.addColorStop(
        0.28,
        `rgba(92, 74, 255, ${0.028 * atmosphereReveal})`,
      );
      atmosphere.addColorStop(
        0.58,
        `rgba(255, 255, 255, ${0.014 * atmosphereReveal})`,
      );
      atmosphere.addColorStop(1, "rgba(0,0,0,0)");

      ctx.fillStyle = atmosphere;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      applyCamera();

      ctx.globalAlpha = 0.12 + trailReveal * 0.88;
      ctx.drawImage(
        trailCanvas,
        0,
        0,
        trailCanvas.width,
        trailCanvas.height,
        0,
        0,
        width,
        height,
      );
      ctx.globalAlpha = 1;

      ctx.strokeStyle =
        `rgba(242, 240, 234, ${0.015 + structureReveal * 0.15})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(originX - 126, originY);
      ctx.lineTo(originX + 126, originY);
      ctx.stroke();

      ctx.fillStyle =
        `rgba(242, 240, 234, ${0.03 + structureReveal * 0.58})`;
      ctx.beginPath();
      ctx.arc(originX, originY, 3, 0, Math.PI * 2);
      ctx.fill();

      const fieldStructureReveal = easeOutCubic(
        (introElapsed - 3900) / 2300,
      );
      const seedPhysicalFade =
        1 - easeOutCubic(Math.max(0, storyProgress - 0.035) / 0.1);

      const drawPhysicalPendulum = (
        index: number,
        alphaScale: number,
        widthScale: number,
      ) => {
        const p = endPoint(
          states[index],
          originX,
          originY,
          arm,
        );
        const hue = (index / PENDULUM_COUNT) * 330 + 10;
        const armSaturation = 4 + colorReveal * 70;
        const armLightness = 86 - colorReveal * 18;
        const armAlpha =
          (0.03 + structureReveal * 0.52) * alphaScale;

        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(p.x1, p.y1);
        ctx.lineTo(p.x2, p.y2);
        ctx.strokeStyle =
          `hsla(${hue}, ${armSaturation}%, ${armLightness}%, ${armAlpha})`;
        ctx.lineWidth = (0.8 + structureReveal * 0.7) * widthScale;
        ctx.stroke();

        ctx.fillStyle =
          `rgba(242, 240, 234, ${(0.08 + structureReveal * 0.72) * alphaScale})`;
        ctx.beginPath();
        ctx.arc(p.x1, p.y1, 2.8 * widthScale, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x2, p.y2, 4.2 * widthScale, 0, Math.PI * 2);
        ctx.fill();
      };

      drawPhysicalPendulum(
        SEED_A,
        seedPhysicalFade,
        1,
      );
      drawPhysicalPendulum(
        SEED_B,
        seedPhysicalFade * 0.78,
        0.94,
      );

      if (fieldStructureReveal > 0.02) {
        const drawStride =
          fieldStructureReveal < 0.45 ? 12 : 8;

        for (
          let index = 0;
          index < states.length;
          index += drawStride
        ) {
          if (index === SEED_A || index === SEED_B) continue;

          const p = endPoint(
            states[index],
            originX,
            originY,
            arm,
          );
          const hue = (index / PENDULUM_COUNT) * 330 + 10;

          ctx.beginPath();
          ctx.moveTo(originX, originY);
          ctx.lineTo(p.x1, p.y1);
          ctx.lineTo(p.x2, p.y2);
          ctx.strokeStyle =
            `hsla(${hue}, ${12 + colorReveal * 76}%, 66%, ${0.025 * fieldStructureReveal})`;
          ctx.lineWidth = 0.42;
          ctx.stroke();
        }
      }

      ctx.restore();

      frameCount += 1;
      raf = requestAnimationFrame(frame);
    };

    resize();
    updateStoryProgress();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", updateStoryProgress, { passive: true });
    window.addEventListener("pointermove", perturb, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", updateStoryProgress);
      window.removeEventListener("pointermove", perturb);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced]);

  if (reduced) {
    return (
      <div className="pendulum-reduced" aria-hidden="true">
        <span className="pendulum-reduced__pivot" />
        <span className="pendulum-reduced__arm pendulum-reduced__arm--one" />
        <span className="pendulum-reduced__arm pendulum-reduced__arm--two" />
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="pendulum-canvas"
      aria-hidden="true"
    />
  );
}

function ChapterShell({
  index,
  eyebrow,
  title,
  side = "left",
  children,
}: {
  index: string;
  eyebrow: string;
  title: string;
  side?: "left" | "right" | "center";
  children: React.ReactNode;
}) {
  return (
    <section className={`story-chapter story-chapter--${side}`}>
      <div className="story-panel">
        <div className="story-panel__meta">
          <span>{index}</span>
          <span>{eyebrow}</span>
        </div>
        <h2>{title}</h2>
        {children}
      </div>
    </section>
  );
}

export function PortfolioExperience({ profile, stats }: Props) {
  const [introReady, setIntroReady] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduced) {
      setIntroReady(true);
      return;
    }

    window.scrollTo(0, 0);

    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    const timer = window.setTimeout(() => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
      setIntroReady(true);
    }, 5900);

    return () => {
      window.clearTimeout(timer);
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
    };
  }, []);

  return (
    <main className="portfolio">
      <section
        className={`pendulum-story ${introReady ? "pendulum-story--ready" : "pendulum-story--intro"}`}
        id="pendulum-story"
      >
        <div className="pendulum-story__sticky">
          <PendulumField />

          <div className="pendulum-story__hud">
            <span>
              {introReady
                ? "STATE SPACE / 200 TRAJECTORIES"
                : "DETERMINISTIC DIVERGENCE / TWO INITIAL STATES"}
            </span>
            <span>Δθ = 0.1°</span>
          </div>

          {introReady ? (
            <div className="pendulum-story__scroll-hint">
              scroll to enter the system
            </div>
          ) : null}
        </div>

        <div className="pendulum-story__chapters">
          <ChapterShell
            index="00"
            eyebrow="INITIAL CONDITIONS"
            title={profile.name}
            side="left"
          >
            <p className="story-panel__lead">
              {profile.year} · Computer Science + Mathematics
            </p>
            <p>
              Backend systems, distributed thinking, mathematical structure.
              Two nearly identical states become a field of radically different outcomes.
            </p>
          </ChapterShell>

          <ChapterShell
            index="01"
            eyebrow="CAPABILITY TOPOLOGY"
            title="The stack, mapped to evidence."
            side="right"
          >
            <div className="story-capabilities">
              {capabilityGroups.map((group) => (
                <div className="story-capability-group" key={group.id}>
                  <strong>{group.label}</strong>
                  <div>
                    {group.capabilities.map((capability) => (
                      <span
                        key={capability.name}
                        className={
                          capability.tier === "EXPLORING"
                            ? "is-exploring"
                            : undefined
                        }
                        title={capability.evidence}
                      >
                        {capability.name}
                        <small>{capability.tier}</small>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ChapterShell>

          <ChapterShell
            index="02"
            eyebrow="ENGINEERING RECORD"
            title="Resume / source of truth."
            side="left"
          >
            <p>{resume.summary}</p>
            <div className="story-actions">
              <a href={profile.links.resume}>View full resume →</a>
              <a
                href={profile.links.linkedin}
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn ↗
              </a>
            </div>
            <div className="story-mini-grid">
              <span>Python</span>
              <span>FastAPI</span>
              <span>PostgreSQL</span>
              <span>Next.js</span>
              <span>Docker</span>
              <span>OpenAI / NIM</span>
            </div>
          </ChapterShell>

          <ChapterShell
            index="03"
            eyebrow="MEASURED SIGNALS"
            title="Instrumentation over decoration."
            side="right"
          >
            <div className="story-metrics">
              <div>
                <strong>
                  {signalSnapshot.github.authoredPublicRepoCommits}
                </strong>
                <span>authored public-repo commits</span>
              </div>
              <div>
                <strong>{signalSnapshot.safestep.visitors}</strong>
                <span>SafeStep visitors</span>
              </div>
              <div>
                <strong>{signalSnapshot.safestep.pageviews}</strong>
                <span>SafeStep pageviews</span>
              </div>
              <div>
                <strong>921+</strong>
                <span>ingestion events/sec</span>
              </div>
              <div>
                <strong>124</strong>
                <span>SafeStep pytest tests</span>
              </div>
              {stats.github.commitContributions !== null ? (
                <div>
                  <strong>
                    {metric(stats.github.commitContributions)}
                  </strong>
                  <span>GitHub commits / 12m</span>
                </div>
              ) : null}
            </div>
          </ChapterShell>

          <ChapterShell
            index="04"
            eyebrow="PROJECT / SAFESTEP"
            title="AI safety, treated like a real system."
            side="left"
          >
            <p>
              SafeStep helps older adults understand suspicious screenshots,
              messages, emails, and websites through a production multimodal
              analysis pipeline.
            </p>
            <div className="story-flow">
              <span>Upload</span>
              <b>→</b>
              <span>Auth</span>
              <b>→</b>
              <span>Analysis</span>
              <b>→</b>
              <span>Vision</span>
              <b>→</b>
              <span>Risk</span>
              <b>→</b>
              <span>Telemetry</span>
            </div>
            <div className="story-project-facts">
              <span><strong>8</strong> repository classes</span>
              <span><strong>7</strong> normalized entities</span>
              <span><strong>13</strong> parser tests</span>
              <span><strong>124</strong> pytest tests</span>
            </div>
            <a
              className="story-project-link"
              href="https://github.com/SharifWaqas/safestep"
              target="_blank"
              rel="noreferrer"
            >
              inspect SafeStep ↗
            </a>
          </ChapterShell>

          <ChapterShell
            index="05"
            eyebrow="PROJECT / INGESTION ENGINE"
            title="46 → 921+ events per second."
            side="right"
          >
            <p>
              Queue buffering, four background workers, batched PostgreSQL
              writes, retries, cursor pagination, and observability analytics.
            </p>
            <div className="story-throughput">
              <span className="story-throughput__before">46</span>
              <span className="story-throughput__line" />
              <span className="story-throughput__after">921+</span>
            </div>
            <div className="story-flow">
              <span>HTTP</span>
              <b>→</b>
              <span>Queue</span>
              <b>→</b>
              <span>4 workers</span>
              <b>→</b>
              <span>Batch write</span>
              <b>→</b>
              <span>Postgres</span>
            </div>
            <a
              className="story-project-link"
              href="https://github.com/SharifWaqas/log-analytics-backend"
              target="_blank"
              rel="noreferrer"
            >
              inspect ingestion engine ↗
            </a>
          </ChapterShell>

          <ChapterShell
            index="06"
            eyebrow="OPEN CHANNEL"
            title="Open channel."
            side="center"
          >
            <a
              className="story-contact"
              href={profile.links.gmailCompose}
              target="_blank"
              rel="noreferrer"
            >
              Connect with me ↗
            </a>
            <div className="story-actions story-actions--center">
              <a href={profile.links.mailto}>Mail fallback</a>
              <a
                href={profile.links.linkedin}
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
              <a
                href={profile.links.github}
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
            </div>
          </ChapterShell>
        </div>
      </section>
    </main>
  );
}
