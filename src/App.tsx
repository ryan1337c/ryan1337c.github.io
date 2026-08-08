import type { FormEvent } from 'react'
import './App.css'
import WavyRibbon from './WavyRibbon'

const projects = [
  { number: '01', title: 'Project coming soon', tag: 'Web Application' },
  { number: '02', title: 'Project coming soon', tag: 'Product Design' },
  { number: '03', title: 'Project coming soon', tag: 'Creative Development' },
  { number: '04', title: 'Project coming soon', tag: 'Case Study' },
]

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.87c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.55 9.55 0 0 1 12 6.82a9.5 9.5 0 0 1 2.5.34c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.77c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
  </svg>
)

const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6.5 8.25H3.25V21H6.5V8.25ZM4.88 3A1.88 1.88 0 1 0 4.88 6.75 1.88 1.88 0 0 0 4.88 3ZM21 13.69c0-3.84-2.05-5.63-4.79-5.63-2.2 0-3.19 1.22-3.74 2.07V8.25H9.22V21h3.25v-6.31c0-1.66.31-3.27 2.37-3.27 2.03 0 2.05 1.9 2.05 3.38V21H21v-7.31Z" />
  </svg>
)

function App() {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('name') ?? '')
    const email = String(formData.get('email') ?? '')
    const message = String(formData.get('message') ?? '')
    const subject = encodeURIComponent(`Portfolio inquiry from ${name}`)
    const body = encodeURIComponent(`From: ${name}\nEmail: ${email}\n\n${message}`)
    window.location.href = `mailto:ryanchen1337@gmail.com?subject=${subject}&body=${body}`
  }

  return (
    <main>
      <WavyRibbon />
      <header className="site-header">
        <a className="brand" href="#introduction" aria-label="Back to top">
          <span>RC</span>
          <strong>Ryan Chen</strong>
        </a>
        <nav aria-label="Main navigation">
          <a href="#introduction">About</a>
          <a href="#projects">Projects</a>
          <a href="#skills">Skills</a>
          <a href="#contact">Contact</a>
        </nav>
        <a className="header-cta" href="#contact">
          Let's talk <ArrowIcon />
        </a>
      </header>

      <section className="hero-section" id="introduction">
        <div className="hero-copy">
          <p className="eyebrow"><span /> Available for opportunities</p>
          <h1>Building digital<br />experiences with<br /><em>purpose.</em></h1>
          <p className="hero-bio">
            Hi, I'm <strong>Ryan Chen</strong> — a software engineering who enjoys building fun and useful
            products that people might enjoy using.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#projects">View my work <ArrowIcon /></a>
            <a className="text-link" href="#contact">Get in touch</a>
          </div>
        </div>

        <div className="slab-wrap" aria-label="Profile card inspired by a PSA grading slab">
          <div className="slab">
            <div className="slab-label">
              <div className="label-top">
                <span className="psa-mark">PORT<br /><b>FOLIO</b></span>
                <div>
                  <small>PROFESSIONAL PROFILE</small>
                  <strong>Ryan Chen</strong>
                  <span>Aspiring Software Engineer</span>
                </div>
                <div className="grade"><small>GRADE</small><b>10</b></div>
              </div>
              <div className="serial">CERT 2026-RYAN-CHEN <span className="barcode" /></div>
            </div>
            <div className="profile-card">
              <div className="portrait-placeholder">
                <span>RC</span>
                <small>PHOTO / PORTRAIT</small>
              </div>
              <div className="card-footer">
                <span>CREATIVE TECHNOLOGIST</span>
                <b>ROOKIE CARD</b>
              </div>
            </div>
          </div>
          <div className="slab-shadow" />
        </div>
      </section>

      <section className="section projects-section" id="projects">
        <div className="section-heading">
          <div><span>01</span><p>Selected work</p></div>
          <h2>Personal<br /><em>projects.</em></h2>
          <p>A collection of things I've designed, built, and learned from. Full case studies are on the way.</p>
        </div>
        <div className="project-grid">
          {projects.map((project) => (
            <article className="project-card" key={project.number}>
              <div className="project-placeholder">
                <span>{project.number}</span>
                <div className="mini-slab"><i /><i /><i /></div>
              </div>
              <div className="project-meta">
                <div><small>{project.tag}</small><h3>{project.title}</h3></div>
                <span className="circle-arrow"><ArrowIcon /></span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section skills-section" id="skills">
        <div className="section-heading light-heading">
          <div><span>02</span><p>What I bring</p></div>
          <h2>Skills &amp;<br /><em>credentials.</em></h2>
        </div>
        <div className="skill-columns">
          <div className="skill-block">
            <span className="skill-number">01</span>
            <h3>Technical skills</h3>
            <ul>
              <li>Frontend development</li>
              <li>UI / UX design</li>
              <li>Responsive web design</li>
              <li>Version control &amp; Git</li>
            </ul>
          </div>
          <div className="skill-block">
            <span className="skill-number">02</span>
            <h3>Soft skills</h3>
            <ul>
              <li>Creative problem-solving</li>
              <li>Clear communication</li>
              <li>Collaboration</li>
              <li>Continuous learning</li>
            </ul>
          </div>
          <div className="skill-block">
            <span className="skill-number">03</span>
            <h3>Education</h3>
            <ul>
              <li>Your degree or program</li>
              <li>Your school or institution</li>
              <li>Graduation year</li>
            </ul>
          </div>
          <div className="skill-block">
            <span className="skill-number">04</span>
            <h3>Awards</h3>
            <ul>
              <li>Award or recognition</li>
              <li>Certification</li>
              <li>Achievement</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section contact-section" id="contact">
        <div className="contact-intro">
          <p className="eyebrow"><span /> Start a conversation</p>
          <h2>Have an idea?<br /><em>Let's build it.</em></h2>
          <p>I'm always happy to talk about new projects, creative ideas, or opportunities to collaborate.</p>
          <a className="email-link" href="mailto:ryanchen1337@gmail.com">ryanchen1337@gmail.com <ArrowIcon /></a>
          <div className="social-links">
            <a href="https://github.com/yourusername" target="_blank" rel="noreferrer"><GithubIcon /> GitHub</a>
            <a href="https://linkedin.com/in/yourusername" target="_blank" rel="noreferrer"><LinkedinIcon /> LinkedIn</a>
          </div>
        </div>
        <form className="contact-form" onSubmit={handleSubmit}>
          <label>Name<input name="name" type="text" placeholder="Your name" required /></label>
          <label>Email<input name="email" type="email" placeholder="you@example.com" required /></label>
          <label>Message<textarea name="message" placeholder="Tell me a little about your idea..." rows={5} required /></label>
          <button type="submit">Send message <ArrowIcon /></button>
        </form>
      </section>

      <footer>
        <div className="footer-brand"><span>RC</span><strong>Ryan Chen</strong></div>
        <p>Designed &amp; built with intention. © 2026</p>
        <a href="#introduction">Back to top ↑</a>
      </footer>
    </main>
  )
}

export default App
