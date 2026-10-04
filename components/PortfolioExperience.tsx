"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Profile } from "@/content/profile";
import { resume } from "@/content/resume";
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

type Point = { x: number; y: number };

const M1 = 1;
const M2 = 1;
const L1 = 1;
const L2 = 1;
const G = 9.81;

function metric(value: number | null) {
  return value === null ? "—" : value.toLocaleString("en-US");
}

function stepPendulum(state: PendulumState, dt: number) {
  const { a1, a2, w1, w2 } = state;
  const c = Math.cos(a1 - a2);
  const s = Math.sin(a1 - a2);
  const denominator = 2 * M1 + M2 - M2 * Math.cos(2 * a1 - 2 * a2);

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

function PendulumCanvas() {
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

    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let last = performance.now();
    let accumulator = 0;
    let hidden = false;

    const a: PendulumState = {
      a1: Math.PI * 0.78,
      a2: Math.PI * 0.56,
      w1: 0,
      w2: 0,
    };
    const b: PendulumState = {
      a1: Math.PI * 0.780015,
      a2: Math.PI * 0.56001,
      w1: 0,
      w2: 0,
    };

    const trailA: Point[] = [];
    const trailB: Point[] = [];
    const maxTrail = 260;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const perturb = (event: PointerEvent) => {
      const px = event.clientX / Math.max(1, width) - 0.5;
      const py = event.clientY / Math.max(1, height) - 0.5;
      b.w1 += px * 0.0007;
      b.w2 += py * 0.0007;
    };

    const onVisibility = () => {
      hidden = document.hidden;
      if (!hidden) {
        last = performance.now();
      }
    };

    const drawTrail = (trail: Point[], alpha: number, lineWidth: number) => {
      if (trail.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(trail[0].x, trail[0].y);
      for (let i = 1; i < trail.length; i += 1) {
        ctx.lineTo(trail[i].x, trail[i].y);
      }
      ctx.strokeStyle = `rgba(235, 234, 229, ${alpha})`;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    };

    const drawSystem = (
      p: ReturnType<typeof endPoint>,
      alpha: number,
      accent: boolean,
    ) => {
      const originX = width * 0.5;
      const originY = Math.max(110, height * 0.22);

      ctx.strokeStyle = `rgba(239, 238, 232, ${alpha})`;
      ctx.lineWidth = accent ? 1.4 : 1;
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(p.x1, p.y1);
      ctx.lineTo(p.x2, p.y2);
      ctx.stroke();

      ctx.fillStyle = `rgba(239, 238, 232, ${Math.min(1, alpha + 0.12)})`;
      ctx.beginPath();
      ctx.arc(p.x1, p.y1, accent ? 4 : 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x2, p.y2, accent ? 6 : 4, 0, Math.PI * 2);
      ctx.fill();
    };

    const frame = (now: number) => {
      if (hidden) {
        raf = requestAnimationFrame(frame);
        return;
      }

      const delta = Math.min(32, now - last);
      last = now;
      accumulator += delta / 1000;

      const fixed = 1 / 120;
      while (accumulator >= fixed) {
        stepPendulum(a, fixed);
        stepPendulum(b, fixed);
        accumulator -= fixed;
      }

      const arm = Math.min(width, height) * 0.19;
      const originX = width * 0.5;
      const originY = Math.max(110, height * 0.22);
      const pa = endPoint(a, originX, originY, arm);
      const pb = endPoint(b, originX, originY, arm);

      trailA.push({ x: pa.x2, y: pa.y2 });
      trailB.push({ x: pb.x2, y: pb.y2 });
      if (trailA.length > maxTrail) trailA.shift();
      if (trailB.length > maxTrail) trailB.shift();

      ctx.fillStyle = "#07080a";
      ctx.fillRect(0, 0, width, height);

      const scroll = Math.min(
        1,
        window.scrollY / Math.max(1, window.innerHeight),
      );

      ctx.strokeStyle = "rgba(239, 238, 232, 0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(width * 0.5 - 120, originY);
      ctx.lineTo(width * 0.5 + 120, originY);
      ctx.stroke();

      ctx.fillStyle = "rgba(239, 238, 232, 0.5)";
      ctx.beginPath();
      ctx.arc(width * 0.5, originY, 3, 0, Math.PI * 2);
      ctx.fill();

      drawTrail(trailA, 0.34 + scroll * 0.12, 1.25);
      drawTrail(trailB, 0.17 + scroll * 0.08, 1);

      drawSystem(pb, 0.36, false);
      drawSystem(pa, 0.88, true);

      ctx.font = "10px ui-monospace, SFMono-Regular, Consolas, monospace";
      ctx.fillStyle = "rgba(170, 173, 179, 0.72)";
      ctx.fillText(
        `Δθ₁ = ${Math.abs(a.a1 - b.a1).toExponential(2)}`,
        24,
        Math.max(92, height * 0.18),
      );
      ctx.fillText(
        `Δθ₂ = ${Math.abs(a.a2 - b.a2).toExponential(2)}`,
        24,
        Math.max(110, height * 0.18 + 18),
      );

      raf = requestAnimationFrame(frame);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", perturb, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
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

function Flow({
  items,
}: {
  items: string[];
}) {
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
  const skillGroups = useMemo(
    () => Object.entries(resume.skills),
    [],
  );

  return (
    <main className="portfolio">
      <section className="hero" id="top">
        <PendulumCanvas />

        <div className="hero__chrome hero__chrome--left">
          CHAOTIC SYSTEM / DOUBLE PENDULUM
        </div>

        <div className="hero__chrome hero__chrome--right">
          <span>{metric(stats.github.commitContributions)} commits / 12m</span>
          <span>{metric(stats.leetcode.totalSolved)} LeetCode</span>
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
          <span>same system</span>
          <span>near-identical initial conditions</span>
          <span>diverging state</span>
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

        <div className="section__content">
          <p className="eyebrow">Languages / frameworks / systems</p>
          <h2>What I work with.</h2>

          <div className="skill-matrix">
            {skillGroups.map(([group, items]) => (
              <div className="skill-row" key={group}>
                <div className="skill-row__group">{group}</div>
                <div className="skill-row__items">
                  {items.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </div>
            ))}
            <div className="skill-row skill-row--learning">
              <div className="skill-row__group">Currently exploring</div>
              <div className="skill-row__items">
                {profile.currentlyLearning.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
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
          <span>LIVE SIGNALS</span>
        </div>

        <div className="section__content">
          <p className="eyebrow">Measured activity</p>
          <h2>Instrumentation over decoration.</h2>

          <div className="metric-grid">
            <div className="metric-block">
              <span className="metric-block__value">
                {metric(stats.github.commitContributions)}
              </span>
              <span className="metric-block__label">
                GitHub commit contributions / last 12 months
              </span>
            </div>
            <div className="metric-block">
              <span className="metric-block__value">
                {metric(stats.github.totalContributions)}
              </span>
              <span className="metric-block__label">
                total GitHub contributions / last 12 months
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
