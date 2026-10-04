"use client";

import { useEffect, useMemo, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { Profile } from "@/content/profile";
import { ChaosEngine } from "@/experience/engine/ChaosEngine";
import type { PortfolioStats } from "@/lib/stats";

type ChaosExperienceProps = {
  profile: Profile;
  stats: PortfolioStats;
};

function metric(value: number | null) {
  return value === null ? "—" : value.toLocaleString("en-US");
}

export function ChaosExperience({
  profile,
  stats,
}: ChaosExperienceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || reducedMotion) {
      return;
    }

    const engine = new ChaosEngine(canvas);
    engine.start();

    return () => {
      engine.dispose();
    };
  }, [reducedMotion]);

  const externalLinks = useMemo(
    () => [
      ["Resume", profile.links.resume],
      ["GitHub", profile.links.github],
      ["LinkedIn", profile.links.linkedin],
      ["Connect with me", profile.links.gmailCompose],
    ] as const,
    [profile.links],
  );

  const reveal = (delay: number) =>
    reducedMotion
      ? { duration: 0 }
      : {
          delay,
          duration: 0.8,
          ease: [0.22, 1, 0.36, 1] as const,
        };

  return (
    <section className="experience" aria-label="Interactive chaos system">
      {!reducedMotion ? (
        <canvas
          ref={canvasRef}
          className="experience__canvas"
          aria-hidden="true"
        />
      ) : (
        <div className="reduced-system" aria-hidden="true">
          <span className="reduced-system__line" />
        </div>
      )}

      <motion.div
        className="system-label"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={reveal(0.5)}
      >
        Deterministic divergence / 001
      </motion.div>

      <motion.div
        className="telemetry"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reveal(6.8)}
      >
        <div className="telemetry__metric">
          <span className="telemetry__value">
            {metric(stats.github.commitContributions)}
          </span>
          <span className="telemetry__label">
            GitHub commits / 12m
          </span>
        </div>
        <div className="telemetry__metric">
          <span className="telemetry__value">
            {metric(stats.leetcode.totalSolved)}
          </span>
          <span className="telemetry__label">LeetCode solved</span>
        </div>
      </motion.div>

      <motion.div
        className="identity"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reveal(7.4)}
      >
        <p className="identity__eyebrow">
          {profile.year} / {profile.academicFocus.join(" + ")}
        </p>
        <h1 className="identity__name">{profile.name}</h1>
        <p className="identity__subline">
          I build backend systems and software where reliability,
          performance, and interaction design intersect.
        </p>
      </motion.div>

      <motion.nav
        className="identity-index"
        aria-label="Profile links"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={reveal(8.2)}
      >
        {externalLinks.map(([label, href]) => (
          <a
            key={label}
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noreferrer" : undefined}
          >
            {label} ↗
          </a>
        ))}
      </motion.nav>

      <motion.div
        className="skill-line"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={reveal(8.6)}
        aria-label={`Skills: ${profile.skills.join(", ")}`}
      >
        {profile.skills.join(" / ")}
      </motion.div>
    </section>
  );
}
