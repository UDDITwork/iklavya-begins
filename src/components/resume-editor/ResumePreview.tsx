'use client'

import React from 'react'

interface PersonalInfo {
  name: string
  email: string
  phone: string
  location: string
  linkedin: string | null
  portfolio: string | null
  github: string | null
}

interface ResumeData {
  personal_info: PersonalInfo
  objective: string
  education: { degree: string; institution: string; year: string; grade: string; board: string | null; stream: string }[]
  experience: { title: string; company: string; duration: string; location: string; bullets: string[] }[]
  projects: { name: string; description: string; tech_stack: string[] | string; bullets: string[] }[]
  skills: { technical: string[]; soft: string[]; languages: string[]; tools: string[] }
  achievements: string[]
  certifications: { name: string; issuer: string; year: string }[]
}

interface ResumePreviewProps {
  data: ResumeData
  template: string
}

function contactLine(info: PersonalInfo): string {
  const parts = [info.email, info.phone, info.location].filter(Boolean)
  return parts.join('  ·  ')
}

function linkLine(info: PersonalInfo): string {
  const parts = [info.linkedin, info.github, info.portfolio].filter(Boolean)
  return parts.join('  ·  ')
}

function techStackStr(ts: string[] | string): string {
  if (Array.isArray(ts)) return ts.join(', ')
  return String(ts || '')
}

const ResumePreview = React.memo(function ResumePreview({ data, template }: ResumePreviewProps) {
  const p = data.personal_info || { name: '', email: '', phone: '', location: '', linkedin: null, github: null, portfolio: null }
  const hasContent = p.name || data.objective || data.education.length || data.experience.length || data.projects.length

  if (!hasContent) {
    return (
      <div className="bg-white shadow-lg rounded-lg border border-gray-200 aspect-[210/297] flex items-center justify-center">
        <p className="text-gray-300 text-sm">Start filling in the form to see your resume here</p>
      </div>
    )
  }

  // Professional template (default) — clean, single column, green accents
  const isModern = template === 'modern' || template === 'sidebar'

  if (isModern) {
    return <ModernPreview data={data} />
  }

  return <ProfessionalPreview data={data} />
})

export default ResumePreview

// ── Professional Template (single column, ATS-friendly) ──

function ProfessionalPreview({ data }: { data: ResumeData }) {
  const p = data.personal_info

  return (
    <div className="bg-white shadow-lg rounded-sm border border-gray-200 p-8 min-h-[842px] text-[11px] leading-[1.5] text-justify font-[system-ui]" style={{ fontFamily: "'Times New Roman', serif" }}>
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold text-gray-900 tracking-wide">{p.name || 'Your Name'}</h1>
        {contactLine(p) && <p className="text-[10px] text-gray-500 mt-1">{contactLine(p)}</p>}
        {linkLine(p) && <p className="text-[10px] text-green-700 mt-0.5">{linkLine(p)}</p>}
      </div>

      {/* Objective */}
      {data.objective && (
        <SectionBlock title="Professional Summary">
          <p className="text-gray-700">{data.objective}</p>
        </SectionBlock>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <SectionBlock title="Education">
          {data.education.map((e, i) => (
            <div key={i} className="mb-1.5">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">{e.degree || 'Degree'}</span>
                <span className="text-gray-500 text-[10px]">{e.year}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>{e.institution}</span>
                <span>{e.grade}</span>
              </div>
            </div>
          ))}
        </SectionBlock>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <SectionBlock title="Experience">
          {data.experience.map((e, i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">{e.title || 'Title'}</span>
                <span className="text-gray-500 text-[10px]">{e.duration}</span>
              </div>
              <p className="text-gray-600 italic text-[10px]">{e.company}{e.location ? `, ${e.location}` : ''}</p>
              {e.bullets?.filter(Boolean).length > 0 && (
                <ul className="list-disc list-outside ml-4 mt-0.5 text-gray-700">
                  {e.bullets.filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </SectionBlock>
      )}

      {/* Projects */}
      {data.projects.length > 0 && (
        <SectionBlock title="Projects">
          {data.projects.map((p, i) => (
            <div key={i} className="mb-2">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-gray-900">{p.name || 'Project'}</span>
                {techStackStr(p.tech_stack) && (
                  <span className="text-[9px] text-green-700">({techStackStr(p.tech_stack)})</span>
                )}
              </div>
              {p.description && <p className="text-gray-600 text-[10px]">{p.description}</p>}
              {p.bullets?.filter(Boolean).length > 0 && (
                <ul className="list-disc list-outside ml-4 mt-0.5 text-gray-700">
                  {p.bullets.filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </SectionBlock>
      )}

      {/* Skills */}
      {hasSkills(data.skills) && (
        <SectionBlock title="Skills">
          {data.skills.technical.length > 0 && (
            <p><span className="font-semibold text-gray-900">Technical:</span> {data.skills.technical.join(', ')}</p>
          )}
          {data.skills.soft.length > 0 && (
            <p><span className="font-semibold text-gray-900">Soft Skills:</span> {data.skills.soft.join(', ')}</p>
          )}
          {data.skills.languages.length > 0 && (
            <p><span className="font-semibold text-gray-900">Languages:</span> {data.skills.languages.join(', ')}</p>
          )}
          {data.skills.tools.length > 0 && (
            <p><span className="font-semibold text-gray-900">Tools:</span> {data.skills.tools.join(', ')}</p>
          )}
        </SectionBlock>
      )}

      {/* Achievements */}
      {data.achievements.filter(Boolean).length > 0 && (
        <SectionBlock title="Achievements">
          <ul className="list-disc list-outside ml-4 text-gray-700">
            {data.achievements.filter(Boolean).map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </SectionBlock>
      )}

      {/* Certifications */}
      {data.certifications.length > 0 && (
        <SectionBlock title="Certifications">
          {data.certifications.map((c, i) => (
            <p key={i} className="text-gray-700">
              <span className="font-semibold">{c.name}</span>
              {c.issuer && <span className="text-gray-500"> — {c.issuer}</span>}
              {c.year && <span className="text-gray-400"> ({c.year})</span>}
            </p>
          ))}
        </SectionBlock>
      )}
    </div>
  )
}

// ── Modern Template (two-column) ──

function ModernPreview({ data }: { data: ResumeData }) {
  const p = data.personal_info

  return (
    <div className="bg-white shadow-lg rounded-sm border border-gray-200 flex min-h-[842px] text-[11px] leading-[1.5] text-justify">
      {/* Left sidebar */}
      <div className="w-[35%] bg-green-900 text-white p-5 space-y-4">
        <div>
          <h1 className="text-base font-bold">{p.name || 'Your Name'}</h1>
          {data.objective && <p className="text-green-200 text-[10px] mt-2 leading-relaxed">{data.objective}</p>}
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-[9px] uppercase tracking-widest text-green-300 font-semibold mb-1">Contact</h3>
          {p.email && <p className="text-green-100 text-[10px]">{p.email}</p>}
          {p.phone && <p className="text-green-100 text-[10px]">{p.phone}</p>}
          {p.location && <p className="text-green-100 text-[10px]">{p.location}</p>}
          {p.linkedin && <p className="text-green-200 text-[10px]">{p.linkedin}</p>}
          {p.github && <p className="text-green-200 text-[10px]">{p.github}</p>}
        </div>

        {/* Skills */}
        {hasSkills(data.skills) && (
          <div>
            <h3 className="text-[9px] uppercase tracking-widest text-green-300 font-semibold mb-1">Skills</h3>
            <div className="flex flex-wrap gap-1">
              {[...data.skills.technical, ...data.skills.tools].map((s, i) => (
                <span key={i} className="px-1.5 py-0.5 bg-green-800 text-green-100 rounded text-[9px]">{s}</span>
              ))}
            </div>
            {data.skills.languages.length > 0 && (
              <p className="text-green-200 text-[10px] mt-2">Languages: {data.skills.languages.join(', ')}</p>
            )}
          </div>
        )}

        {/* Certifications */}
        {data.certifications.length > 0 && (
          <div>
            <h3 className="text-[9px] uppercase tracking-widest text-green-300 font-semibold mb-1">Certifications</h3>
            {data.certifications.map((c, i) => (
              <p key={i} className="text-green-100 text-[10px]">{c.name} {c.year && `(${c.year})`}</p>
            ))}
          </div>
        )}
      </div>

      {/* Right content */}
      <div className="flex-1 p-6 space-y-3">
        {data.education.length > 0 && (
          <SectionBlock title="Education" border>
            {data.education.map((e, i) => (
              <div key={i} className="mb-1">
                <span className="font-semibold text-gray-900">{e.degree}</span>
                <span className="text-gray-500"> — {e.institution}, {e.year}</span>
                {e.grade && <span className="text-gray-400"> | {e.grade}</span>}
              </div>
            ))}
          </SectionBlock>
        )}

        {data.experience.length > 0 && (
          <SectionBlock title="Experience" border>
            {data.experience.map((e, i) => (
              <div key={i} className="mb-2">
                <div className="font-semibold text-gray-900">{e.title} <span className="font-normal text-gray-500">at {e.company}</span></div>
                <div className="text-[10px] text-gray-400">{e.duration}{e.location ? ` · ${e.location}` : ''}</div>
                {e.bullets?.filter(Boolean).length > 0 && (
                  <ul className="list-disc ml-4 mt-0.5 text-gray-700">{e.bullets.filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}</ul>
                )}
              </div>
            ))}
          </SectionBlock>
        )}

        {data.projects.length > 0 && (
          <SectionBlock title="Projects" border>
            {data.projects.map((pr, i) => (
              <div key={i} className="mb-2">
                <span className="font-semibold text-gray-900">{pr.name}</span>
                {techStackStr(pr.tech_stack) && <span className="text-[9px] text-green-700"> ({techStackStr(pr.tech_stack)})</span>}
                {pr.description && <p className="text-gray-600 text-[10px]">{pr.description}</p>}
                {pr.bullets?.filter(Boolean).length > 0 && (
                  <ul className="list-disc ml-4 mt-0.5 text-gray-700">{pr.bullets.filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}</ul>
                )}
              </div>
            ))}
          </SectionBlock>
        )}

        {data.achievements.filter(Boolean).length > 0 && (
          <SectionBlock title="Achievements" border>
            <ul className="list-disc ml-4 text-gray-700">{data.achievements.filter(Boolean).map((a, i) => <li key={i}>{a}</li>)}</ul>
          </SectionBlock>
        )}
      </div>
    </div>
  )
}

// ── Shared Helpers ──

function SectionBlock({ title, children, border }: { title: string; children: React.ReactNode; border?: boolean }) {
  return (
    <div className={`mb-3 ${border ? 'pb-2 border-b border-gray-100' : ''}`}>
      <h2 className="text-[10px] font-bold text-green-800 uppercase tracking-widest mb-1.5 border-b border-green-800 pb-0.5">{title}</h2>
      {children}
    </div>
  )
}

function hasSkills(skills: ResumeData['skills']): boolean {
  return (skills.technical.length + skills.soft.length + skills.languages.length + skills.tools.length) > 0
}
