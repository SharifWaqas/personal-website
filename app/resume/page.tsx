import type { Metadata } from "next";
import Link from "next/link";
import { resume } from "@/content/resume";
import styles from "./resume.module.css";

export const metadata: Metadata = {
  title: "Resume",
  description:
    "Resume for Muhammad Sharif — Computer Science and Mathematics student focused on backend engineering, distributed systems, and production software.",
  alternates: {
    canonical: "/resume",
  },
};

export default function ResumePage() {
  return (
    <main className={styles.shell}>
      <div className={styles.topbar}>
        <Link href="/" className={styles.back}>← system</Link>
        <a
          className={styles.contact}
          href="https://mail.google.com/mail/?view=cm&fs=1&to=shaarif.1031%40gmail.com&su=Portfolio%20%2F%20Software%20Engineering"
          target="_blank"
          rel="noreferrer"
        >
          Connect with me ↗
        </a>
      </div>

      <article className={styles.paper}>
        <header className={styles.header}>
          <h1>{resume.name}</h1>
          <p>
            {resume.contact.email} · {resume.contact.phone} · {resume.contact.linkedin} · {resume.contact.github} · {resume.contact.location}
          </p>
        </header>

        <section>
          <h2>Summary</h2>
          <p>{resume.summary}</p>
        </section>

        <section>
          <h2>Education</h2>
          <div className={styles.row}>
            <strong>{resume.education.school}</strong>
            <span>{resume.education.expected}</span>
          </div>
          <p>{resume.education.degree}</p>
          <p>GPA: {resume.education.gpa} · {resume.education.scholarship}</p>
          <p><strong>Relevant Coursework:</strong> {resume.education.coursework.join(", ")}</p>
        </section>

        <section>
          <h2>Technical Skills</h2>
          {Object.entries(resume.skills).map(([group, items]) => (
            <p key={group}>
              <strong>{group}:</strong> {items.join(", ")}
            </p>
          ))}
        </section>

        <section>
          <h2>Projects</h2>
          {resume.projects.map((project) => (
            <div className={styles.entry} key={project.name}>
              <div className={styles.row}>
                <strong>{project.name}</strong>
                <span>{project.period}</span>
              </div>
              <p className={styles.meta}>{project.links}</p>
              <p className={styles.meta}>{project.stack}</p>
              <ul>
                {project.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
              </ul>
              {"stackLine" in project && project.stackLine ? (
                <p className={styles.meta}>Stack: {project.stackLine}</p>
              ) : null}
            </div>
          ))}
        </section>

        <section>
          <h2>Experience</h2>
          {resume.experience.map((item) => (
            <div className={styles.entry} key={item.role}>
              <div className={styles.row}>
                <strong>{item.role}</strong>
                <span>{item.period}</span>
              </div>
              <p className={styles.meta}>{item.org}</p>
              <p>{item.detail}</p>
            </div>
          ))}
        </section>

        <section>
          <h2>Leadership</h2>
          <ul>
            {resume.leadership.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>
      </article>
    </main>
  );
}
