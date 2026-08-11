import emailjs from '@emailjs/browser'
import { useState, type FormEvent } from 'react'
import './App.css'
import portraitImage from './assets/dragonite_git.jpg'
import ProjectSlabCarousel from './ProjectSlabCarousel'
import WavyRibbon from './WavyRibbon'

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
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormStatus('sending')

    const form = event.currentTarget
    const formData = new FormData(form)

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          from_name: String(formData.get('name') ?? ''),
          from_email: String(formData.get('email') ?? ''),
          message: String(formData.get('message') ?? ''),
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
      )

      setFormStatus('success')
      form.reset()
    } catch (error) {
      console.error('EmailJS error:', error)
      setFormStatus('error')
    }
  }

  return (
    <main>
      <WavyRibbon />
      <header className="site-header">
        <a className="brand" href="#introduction" aria-label="Back to top">
          <span>RC</span>
          <strong>Ryan Chen</strong>
        </a>
        <nav className={`main-nav${isMenuOpen ? ' main-nav--open' : ''}`} id="main-navigation" aria-label="Main navigation">
          <a href="#introduction" onClick={() => setIsMenuOpen(false)}>About</a>
          <a href="#projects" onClick={() => setIsMenuOpen(false)}>Projects</a>
          <a href="#skills" onClick={() => setIsMenuOpen(false)}>Skills</a>
          <a href="#contact" onClick={() => setIsMenuOpen(false)}>Contact</a>
        </nav>
        <a className="header-cta" href="#contact">
          Let's talk <ArrowIcon />
        </a>
        <button
          className={`menu-toggle${isMenuOpen ? ' menu-toggle--open' : ''}`}
          type="button"
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-controls="main-navigation"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      <section className="hero-section" id="introduction">
        <div className="hero-copy">
          <p className="eyebrow"><span /> Available for opportunities</p>
          <h1>My<br /><em>Portfolio</em></h1>
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
              <div className="serial">CERT 2026-RYAN-CHEN <a href="https://github.com/ryan1337c" target="_blank" rel="noreferrer" className="barcode" /></div>
            </div>
            <div className="profile-card">
              <div className="portrait-placeholder">
                <img src={portraitImage} alt="Portrait of Ryan Chen" />
              </div>
              <div className="card-footer">
                <span>Software Engineer</span>
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
          <p>A collection of my personal projects that I have worked on.</p>
        </div>
        <ProjectSlabCarousel />
      </section>

      <section className="section skills-section" id="skills">
        <div className="section-heading light-heading">
          <div><span>02</span><p>What I bring</p></div>
          <h2>Skills</h2>
        </div>
        <div className="skill-columns">
          <div className="skill-block">
            <span className="skill-number">01</span>
            <h3>Technical skills</h3>
            <ul>
              <li>Full Stack Development</li>
              <li>Java / Python / JavaScript / TypeScript</li>
              <li>Machine Learning</li>
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
              <li>Bachelor of Science in Computer Science, Honours</li>
              <li>York University</li>
              <li>2020-2026</li>
            </ul>
          </div>
          <div className="skill-block">
            <span className="skill-number">04</span>
            <h3>Interests</h3>
            <ul>
              <li>Artificial Intelligence</li>
              <li>Computer Vision / Augmented Reality</li>
              <li>Game Development</li>
              <li>Web Development</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section contact-section" id="contact">
        <div className="contact-intro">
          <p className="eyebrow"><span /> Contact</p>
          <h2>Want to get in touch?<br /><em>Let's chat!</em></h2>
          <p>I'm always happy to talk about creative ideas, opportunities to collaborate, or just random things.</p>
          <a className="email-link" href="mailto:ryanchen1337@gmail.com">ryanchen1337@gmail.com <ArrowIcon /></a>
          <div className="social-links">
            <a href="https://github.com/ryan1337c" target="_blank" rel="noreferrer"><GithubIcon /> GitHub</a>
            <a href="https://linkedin.com/in/ryan-chen-296094239" target="_blank" rel="noreferrer"><LinkedinIcon /> LinkedIn</a>
          </div>
        </div>
        <form className="contact-form" onSubmit={handleSubmit}>
          <label>Name<input name="name" type="text" placeholder="Your name" required /></label>
          <label>Email<input name="email" type="email" placeholder="you@example.com" required /></label>
          <label>Message<textarea name="message" placeholder="Tell me a little about your idea..." rows={5} required /></label>
          <button type="submit" disabled={formStatus === 'sending'}>
            {formStatus === 'sending' ? 'Sending...' : 'Send message'} <ArrowIcon />
          </button>
          {formStatus === 'success' && (
            <p className="contact-form-status" role="status">Message sent. I&apos;ll get back to you soon.</p>
          )}
          {formStatus === 'error' && (
            <p className="contact-form-status contact-form-status--error" role="alert">
              Something went wrong. Please try again or email me directly.
            </p>
          )}
        </form>
      </section>

      <footer>
        <div className="footer-brand"><span>RC</span><strong>Ryan Chen</strong></div>
        <p>Designed &amp; built with 💜. © 2026</p>
        <a href="#introduction">Back to top ↑</a>
      </footer>
    </main>
  )
}

export default App
