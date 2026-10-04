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

const M1 = 1;
const M2 = 1;
const L1 = 1;
const L2 = 1;
const G = 9.81;
const PENDULUM_COUNT = 200;
const ANGLE_DELTA = (0.1 * Math.PI) / 180;

function metric(value: number | null) {
  return value === null ? "—" : value.toLocaleString("en-US");
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

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

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
    let inView = true;
    let frameCount = 0;

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

    const perturb = (event: PointerEvent) => {
      const px = event.clientX / Math.max(1, width) - 0.5;
      const py = event.clientY / Math.max(1, height) - 0.5;
      const kick = (px * 0.7 + py * 0.3) * 0.000035;

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

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) {
          last = performance.now();
        }
      },
      { threshold: 0.02 },
    );
    observer.observe(canvas);

    const frame = (now: number) => {
      if (hidden || !inView) {
        last = now;
        raf = requestAnimationFrame(frame);
        return;
      }

      const delta = Math.min(34, now - last);
      last = now;
      accumulator += delta / 1000;

      const fixed = 1 / 100;
      let steps = 0;

      while (accumulator >= fixed && steps < 3) {
        for (const state of states) {
          stepPendulum(state, fixed);
        }
        accumulator -= fixed;
        steps += 1;
      }

      const arm = Math.min(width, height) * 0.17;
      const originX = width * 0.5;
      const originY = Math.max(110, height * 0.19);

      if (frameCount % 2 === 0) {
        trailCtx.save();
        trailCtx.globalCompositeOperation = "destination-out";
        trailCtx.fillStyle = "rgba(0,0,0,0.022)";
        trailCtx.fillRect(0, 0, width, height);
        trailCtx.restore();

        trailCtx.globalCompositeOperation = "source-over";

        for (let index = 0; index < states.length; index += 1) {
          const p = endPoint(
            states[index],
            originX,
            originY,
            arm,
          );
          const px = previousEnds[index * 2];
          const py = previousEnds[index * 2 + 1];

          if (Number.isFinite(px) && Number.isFinite(py)) {
            const hue = (index / PENDULUM_COUNT) * 330 + 10;

            trailCtx.beginPath();
            trailCtx.moveTo(px, py);
            trailCtx.lineTo(p.x2, p.y2);
            trailCtx.strokeStyle = `hsla(${hue}, 96%, 64%, 0.52)`;
            trailCtx.lineWidth = 0.72;
            trailCtx.stroke();
          }

          previousEnds[index * 2] = p.x2;
          previousEnds[index * 2 + 1] = p.y2;
        }
      }

      ctx.fillStyle = "#050607";
      ctx.fillRect(0, 0, width, height);
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

      ctx.strokeStyle = "rgba(242, 240, 234, 0.16)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(originX - 126, originY);
      ctx.lineTo(originX + 126, originY);
      ctx.stroke();

      ctx.fillStyle = "rgba(242, 240, 234, 0.7)";
      ctx.beginPath();
      ctx.arc(originX, originY, 3, 0, Math.PI * 2);
      ctx.fill();

      for (let index = 0; index < states.length; index += 2) {
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
        ctx.strokeStyle = `hsla(${hue}, 92%, 66%, 0.14)`;
        ctx.lineWidth = 0.75;
        ctx.stroke();

        if (index % 16 === 0) {
          ctx.fillStyle = `hsla(${hue}, 96%, 67%, 0.72)`;
          ctx.beginPath();
          ctx.arc(p.x2, p.y2, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      frameCount += 1;
      raf = requestAnimationFrame(frame);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", perturb, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", perturb);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced]);

  if (reduced) {
    return (
      <div className="pendulum-reduced pendulum-reduced--field" aria-hidden="true">
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

function CursorDaffy() {
  const followerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const follower = followerRef.current;
    if (!follower) return;

    const finePointer = window.matchMedia("(pointer: fine)");
    if (!finePointer.matches) return;

    let raf = 0;
    let x = -180;
    let y = -180;
    let targetX = -180;
    let targetY = -180;
    let previousPointerX = -180;
    let previousPointerY = -180;
    let velocityX = 0;
    let velocityY = 0;
    let lastMoveAt = 0;
    let goofyUntil = 0;
    let visible = false;

    const move = (event: PointerEvent) => {
      if (previousPointerX > -100) {
        velocityX =
          velocityX * 0.5 +
          (event.clientX - previousPointerX) * 0.5;
        velocityY =
          velocityY * 0.5 +
          (event.clientY - previousPointerY) * 0.5;
      }

      previousPointerX = event.clientX;
      previousPointerY = event.clientY;
      targetX = event.clientX;
      targetY = event.clientY;
      lastMoveAt = performance.now();

      if (!visible) {
        visible = true;
        x = targetX + 34;
        y = targetY + 22;
        follower.dataset.visible = "true";
      }
    };

    const click = () => {
      goofyUntil = performance.now() + 820;
      follower.dataset.goofy = "true";
    };

    const leave = () => {
      follower.dataset.visible = "false";
      follower.dataset.moving = "false";
      visible = false;
    };

    const tick = (now: number) => {
      const placeLeft =
        targetX > window.innerWidth - 150;
      const side = placeLeft ? -1 : 1;

      const distance = Math.hypot(
        targetX + side * 36 - x,
        targetY + 24 - y,
      );

      const spring =
        distance > 100 ? 0.22 : 0.15;

      x += (targetX + side * 36 - x) * spring;
      y += (targetY + 24 - y) * spring;

      const speed = Math.hypot(velocityX, velocityY);
      const moving =
        now - lastMoveAt < 150 && speed > 0.55;
      const goofy = now < goofyUntil;

      const tilt = Math.max(
        -13,
        Math.min(13, velocityX * 0.18),
      );

      follower.style.transform =
        `translate3d(${x}px, ${y}px, 0)`;
      follower.style.setProperty(
        "--daffy-facing",
        placeLeft ? "-1" : "1",
      );
      follower.style.setProperty(
        "--daffy-tilt",
        `${tilt}deg`,
      );
      follower.style.setProperty(
        "--daffy-speed",
        `${Math.min(1, speed / 24)}`,
      );

      follower.dataset.moving =
        moving ? "true" : "false";
      follower.dataset.goofy =
        goofy ? "true" : "false";

      velocityX *= 0.84;
      velocityY *= 0.84;

      raf = requestAnimationFrame(tick);
    };

    window.addEventListener(
      "pointermove",
      move,
      { passive: true },
    );
    window.addEventListener(
      "pointerdown",
      click,
      { passive: true },
    );
    document.documentElement.addEventListener(
      "mouseleave",
      leave,
    );
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener(
        "pointermove",
        move,
      );
      window.removeEventListener(
        "pointerdown",
        click,
      );
      document.documentElement.removeEventListener(
        "mouseleave",
        leave,
      );
    };
  }, []);

  const daffySrc = "/daffy-cursor-full.png";

  return (
    <div
      ref={followerRef}
      className="cursor-daffy"
      aria-hidden="true"
    >
      <div className="cursor-daffy__rig">
        <img
          className="cursor-daffy__piece cursor-daffy__piece--head"
          src={daffySrc}
          alt=""
          draggable={false}
        />
        <img
          className="cursor-daffy__piece cursor-daffy__piece--body"
          src={daffySrc}
          alt=""
          draggable={false}
        />
        <img
          className="cursor-daffy__piece cursor-daffy__piece--leg-left"
          src={daffySrc}
          alt=""
          draggable={false}
        />
        <img
          className="cursor-daffy__piece cursor-daffy__piece--leg-right"
          src={daffySrc}
          alt=""
          draggable={false}
        />
      </div>
      <span className="cursor-daffy__speech">
        woo!
      </span>
    </div>
  );
}

function Flow({ items }: { items: string[] }) {
  return (
    <div className="flow" aria-label={items.join(" to ")}>
      {items.map((item, index) => (
        <div className="flow__segment" key={item}>
          <span className="flow__node">{item}</span>
          {index < items.length - 1 ? (
            <span className="flow__edge" aria-hidden="true">→</span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function PortfolioExperience({ profile, stats }: Props) {
  return (
    <main className="portfolio">
      <CursorDaffy />

      <section className="hero hero--chaos-field" id="top">
        <PendulumField />

        <div className="hero__chrome hero__chrome--left">
          CHAOS THEORY / 200 DOUBLE PENDULUMS / Δθ = 0.1°
        </div>

        <div className="hero__chrome hero__chrome--right">
          <span>
            {signalSnapshot.github.authoredPublicRepoCommits} authored commits
          </span>
          <span>
            {signalSnapshot.safestep.visitors} SafeStep visitors
          </span>
          <span>
            {signalSnapshot.safestep.pageviews} pageviews
          </span>
        </div>

        <div className="hero__identity">
          <p className="kicker">
            {profile.year} · Computer Science + Mathematics
          </p>
          <h1>{profile.name}</h1>
          <p className="hero__statement">
            Backend systems, distributed thinking, mathematical structure.
          </p>
        </div>

        <div className="hero__legend">
          <span>200 systems</span>
          <span>0.1° between initial conditions</span>
          <span>deterministic divergence</span>
        </div>

        <a className="scroll-cue" href="#capabilities">
          scroll to inspect ↓
        </a>
      </section>

      <section className="section" id="capabilities">
        <div className="section__rail">
          <span>01</span>
          <span>CAPABILITY TOPOLOGY</span>
        </div>

        <div className="section__content capability-content">
          <p className="eyebrow">Languages / frameworks / systems / evidence</p>
          <h2>Capability topology.</h2>
          <p className="body-copy">
            Every node maps to something I have actually built, measured,
            deployed, tested, or am explicitly learning. Hover a node to inspect
            the evidence behind it.
          </p>

          <div className="capability-topology">
            {capabilityGroups.map((group, groupIndex) => (
              <section className="capability-band" key={group.id}>
                <header className="capability-band__header">
                  <span className="capability-band__index">
                    {String(groupIndex + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3>{group.label}</h3>
                    <p>{group.description}</p>
                  </div>
                </header>

                <div className="capability-grid">
                  {group.capabilities.map((capability) => (
                    <article
                      className={`capability-node capability-node--${capability.tier.toLowerCase()}`}
                      key={capability.name}
                      tabIndex={0}
                    >
                      <div className="capability-node__head">
                        <strong>{capability.name}</strong>
                        <span>{capability.tier}</span>
                      </div>
                      <p className="capability-node__evidence">
                        {capability.evidence}
                      </p>
                      <div className="capability-node__projects">
                        {capability.projects.map((project) => (
                          <span key={project}>{project}</span>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--split" id="resume">
        <div className="section__rail">
          <span>02</span>
          <span>ENGINEERING RECORD</span>
        </div>

        <div className="section__content section__content--split">
          <div>
            <p className="eyebrow">Resume / source of truth</p>
            <h2>Production work, not a badge wall.</h2>
            <p className="body-copy">
              Backend-focused software engineer building production systems in
              Python/FastAPI and Next.js/React, with a double major in Computer
              Science and Mathematics.
            </p>

            <div className="action-line">
              <a href={profile.links.resume}>View resume →</a>
              <a
                href={profile.links.linkedin}
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn ↗
              </a>
            </div>
          </div>

          <a className="resume-preview" href={profile.links.resume}>
            <div className="resume-preview__head">
              <strong>MUHAMMAD SHARIF</strong>
              <span>BACKEND / SYSTEMS</span>
            </div>
            <div className="resume-preview__rule" />
            <p>{resume.summary}</p>
            <div className="resume-preview__grid">
              <span>Python</span>
              <span>FastAPI</span>
              <span>PostgreSQL</span>
              <span>Next.js</span>
              <span>Docker</span>
              <span>OpenAI / NIM</span>
            </div>
            <div className="resume-preview__footer">
              Open full resume ↗
            </div>
          </a>
        </div>
      </section>

      <section className="section" id="metrics">
        <div className="section__rail">
          <span>03</span>
          <span>MEASURED SIGNALS</span>
        </div>

        <div className="section__content">
          <p className="eyebrow">Repository + production observability</p>
          <h2>Instrumentation over decoration.</h2>

          <div className="metric-grid">
            <div className="metric-block">
              <span className="metric-block__value">
                {signalSnapshot.github.authoredPublicRepoCommits}
              </span>
              <span className="metric-block__label">
                authored commits across tracked public repos · snapshot{" "}
                {signalSnapshot.capturedAt}
              </span>
            </div>
            <div className="metric-block">
              <span className="metric-block__value">
                {signalSnapshot.safestep.visitors}
              </span>
              <span className="metric-block__label">
                SafeStep visitors · {signalSnapshot.safestep.window}
              </span>
            </div>
            <div className="metric-block">
              <span className="metric-block__value">
                {signalSnapshot.safestep.pageviews}
              </span>
              <span className="metric-block__label">
                SafeStep pageviews · Vercel Web Analytics
              </span>
            </div>
            <div className="metric-block">
              <span className="metric-block__value">124</span>
              <span className="metric-block__label">
                SafeStep pytest suite
              </span>
            </div>
            <div className="metric-block">
              <span className="metric-block__value">921+</span>
              <span className="metric-block__label">
                ingestion events / second
              </span>
            </div>
            {stats.github.commitContributions !== null ? (
              <div className="metric-block">
                <span className="metric-block__value">
                  {metric(stats.github.commitContributions)}
                </span>
                <span className="metric-block__label">
                  GitHub commit contributions / last 12 months
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="project" id="safestep">
        <div className="project__index">04 / SAFESTEP</div>
        <div className="project__header">
          <p className="eyebrow">AI-powered digital safety companion</p>
          <h2>SafeStep</h2>
          <p>
            A production full-stack system for helping older adults understand
            suspicious screenshots, emails, messages, and websites.
          </p>
        </div>

        <Flow
          items={[
            "Upload",
            "Auth",
            "Analysis service",
            "Vision provider",
            "Risk scoring",
            "Telemetry",
          ]}
        />

        <div className="project__stats">
          <span>
            <strong>{signalSnapshot.safestep.visitors}</strong>
            production visitors
          </span>
          <span>
            <strong>{signalSnapshot.safestep.pageviews}</strong>
            production pageviews
          </span>
          <span><strong>8</strong> repository classes</span>
          <span><strong>7</strong> normalized PostgreSQL entities</span>
          <span><strong>13</strong> parser tests</span>
          <span><strong>124</strong> pytest tests</span>
        </div>

        <div className="project__detail-grid">
          <div>
            <h3>Architecture</h3>
            <p>
              Modular monolith: routes → services → repositories, with async
              SQLAlchemy, Alembic migrations, JWT sessions, Cloudflare R2, and
              provider-agnostic multimodal AI.
            </p>
          </div>
          <div>
            <h3>Observability</h3>
            <p>
              Correlation IDs propagate from request middleware through the
              analysis service and AI orchestrator, while structured telemetry
              is streamed asynchronously into the log analytics engine.
            </p>
          </div>
          <div>
            <h3>Failure thinking</h3>
            <p>
              Session revocation, indistinguishable authorization responses,
              deterministic risk scoring, provider fallback, and non-blocking
              telemetry paths keep user-facing requests isolated from failures.
            </p>
          </div>
        </div>

        <p className="project__source">
          Traffic snapshot: {signalSnapshot.safestep.window} ·{" "}
          {signalSnapshot.safestep.source}
        </p>

        <a
          className="project__link"
          href="https://github.com/SharifWaqas/safestep"
          target="_blank"
          rel="noreferrer"
        >
          inspect repository ↗
        </a>
      </section>

      <section className="project project--analytics" id="log-analytics">
        <div className="project__index">05 / INGESTION ENGINE</div>
        <div className="project__header">
          <p className="eyebrow">High-throughput backend pipeline</p>
          <h2>Log Analytics + Ingestion Engine</h2>
          <p>
            Producer-consumer ingestion, queue buffering, worker batching,
            retries, cursor pagination, and observability analytics.
          </p>
        </div>

        <div className="throughput">
          <div className="throughput__label">sustained throughput</div>
          <div className="throughput__track">
            <div className="throughput__before">
              <span>46</span>
            </div>
            <div className="throughput__after">
              <span>921+</span>
            </div>
          </div>
          <div className="throughput__caption">
            events/sec · approximately 20× improvement
          </div>
        </div>

        <Flow
          items={[
            "HTTP ingest",
            "Queue buffer",
            "4 workers",
            "Batch write",
            "PostgreSQL",
            "Analytics API",
          ]}
        />

        <div className="project__detail-grid">
          <div>
            <h3>Backpressure</h3>
            <p>
              Queue-based buffering separates request ingestion from database
              persistence so bursts do not directly become write contention.
            </p>
          </div>
          <div>
            <h3>Analytics</h3>
            <p>
              Cursor pagination, time-window filtering, service/status filters,
              plus p50/p95/p99 latency, HTTP error rate, and AI-provider
              fallback-rate endpoints.
            </p>
          </div>
          <div>
            <h3>Reliability</h3>
            <p>
              Retries and failed-log fallback routing isolate bad records
              instead of silently dropping them under sustained load.
            </p>
          </div>
        </div>

        <a
          className="project__link"
          href="https://github.com/SharifWaqas/log-analytics-backend"
          target="_blank"
          rel="noreferrer"
        >
          inspect repository ↗
        </a>
      </section>

      <section className="contact-section" id="contact">
        <p className="eyebrow">06 / OPEN CHANNEL</p>
        <a
          className="contact-phrase"
          href={profile.links.gmailCompose}
          target="_blank"
          rel="noreferrer"
        >
          Connect with me
        </a>
        <p>
          Opens Gmail with a draft addressed to {profile.email}.
        </p>
        <div className="contact-links">
          <a href={profile.links.mailto}>mail client fallback</a>
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
      </section>
    </main>
  );
}
