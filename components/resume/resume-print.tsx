import { site } from '@/config/site'
import type { Entry, ResumeData, View } from './resume-data'

/**
 * The clean, single-column, ATS-friendly resume — the actual "Download PDF" output.
 * Hidden on screen; the print stylesheet (`@media print` in globals.css) reveals ONLY
 * this when the visitor runs window.print() → "Save as PDF", so the file is a real text
 * document: no nav, no buttons, no dead links, no graphics or tables. It mirrors the
 * active lens — a "Technical Skills" block on the technical lens, then Professional
 * Experience (jobs, with a role line) and Projects (no role), each with month-year ranges
 * and a plain-text tools line. Names/contact come from `config/site.ts` (placeholders).
 */
export function ResumePrint({ data, view }: { data: ResumeData; view: View }) {
  const vm = data.views[view]
  const experience = vm.spine.filter((e) => e.kind === 'experience')
  const projects = vm.spine.filter((e) => e.kind === 'project')
  const r = site.resume
  const contact = [r.location, r.phone, r.email, r.linkedin].filter(Boolean).join('  |  ')
  const skillsLabel = view === 'technical' ? 'Technical Skills' : 'Core Skills'
  // On the business resume, still surface technical skills (if any) as their own section.
  const technicalGroups = data.views.general.skillGroups.filter((g) => g.focus === 'technical')
  const showExtraTechnical = view === 'business' && technicalGroups.length > 0

  return (
    <div className="resume-print-doc">
      <header className="rp-head">
        <h1 className="rp-name">{site.name}</h1>
        {contact && <p className="rp-contact">{contact}</p>}
      </header>

      {site.bioLong && (
        <section className="rp-section">
          <h2 className="rp-h">Summary of Qualifications</h2>
          <p className="rp-summary">{site.bioLong}</p>
        </section>
      )}

      {vm.skillGroups.length > 0 && (
        <section className="rp-section">
          <h2 className="rp-h">{skillsLabel}</h2>
          <ul className="rp-skills">
            {vm.skillGroups.map((g) => (
              <li key={g.label}>
                <span className="rp-skills-label">{g.label}:</span>{' '}
                {g.items.map((i) => i.name).join(', ')}
              </li>
            ))}
          </ul>
        </section>
      )}

      {showExtraTechnical && (
        <section className="rp-section">
          <h2 className="rp-h">Technical Skills</h2>
          <ul className="rp-skills">
            {technicalGroups.map((g) => (
              <li key={g.label}>
                <span className="rp-skills-label">{g.label}:</span>{' '}
                {g.items.map((i) => i.name).join(', ')}
              </li>
            ))}
          </ul>
        </section>
      )}

      {experience.length > 0 && (
        <section className="rp-section">
          <h2 className="rp-h">Professional Experience</h2>
          {experience.map((e) => (
            <RpEntry key={e.id} e={e} showRole />
          ))}
        </section>
      )}

      {projects.length > 0 && (
        <section className="rp-section">
          <h2 className="rp-h">Projects</h2>
          {projects.map((e) => (
            <RpEntry key={e.id} e={e} />
          ))}
        </section>
      )}
    </div>
  )
}

function RpEntry({ e, showRole = false }: { e: Entry; showRole?: boolean }) {
  // Experience heads with "Employer, Location"; a project heads with its own title.
  const head = e.kind === 'experience' ? [e.org, e.location].filter(Boolean).join(', ') : e.title
  return (
    <div className="rp-entry">
      <div className="rp-entry-top">
        <span className="rp-entry-org">{head}</span>
        <span className="rp-entry-date">{e.dateRange}</span>
      </div>
      {showRole && <p className="rp-entry-role">{e.title}</p>}
      <ul className="rp-bullets">
        <li>{e.summary}</li>
      </ul>
      {e.chips.length > 0 && <p className="rp-tools">{e.chips.join(' · ')}</p>}
    </div>
  )
}
