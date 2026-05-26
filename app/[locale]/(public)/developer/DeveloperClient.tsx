'use client'

import { motion }  from 'framer-motion'
import { Link }    from '@/i18n/navigation'
import {
  Globe, GithubIcon, LinkedinIcon, Mail,
  Code2, Layers, Database, Smartphone, ArrowLeft,
} from 'lucide-react'

const DEVELOPER = {
  name:     'Teekam Singh',
  title:    'Full Stack Developer',
  tagline:  'Building modern web experiences with clean code and thoughtful design.',
  website:  'https://www.singhteekam.in',
  email:    'singhteekam.in@gmail.com',
  github:   'https://github.com/singhteekam',
  linkedin: 'https://linkedin.com/in/singhteekam',
  twitter:  'https://twitter.com/singhteekam',
  initials: 'TS',
}

const TECH_STACK = [
  { label: 'Frontend',  icon: <Layers     size={16} />, items: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'] },
  { label: 'Backend',   icon: <Code2      size={16} />, items: ['Node.js', 'Next.js API', 'REST APIs'] },
  { label: 'Database',  icon: <Database   size={16} />, items: ['MongoDB', 'Mongoose', 'MongoDB Atlas'] },
  { label: 'Mobile',    icon: <Smartphone size={16} />, items: ['Responsive Design', 'PWA', 'Mobile-First'] },
]

const PROJECT_TECH = [
  'Next.js 15', 'React 19', 'TypeScript', 'Tailwind CSS',
  'MongoDB Atlas', 'NextAuth', 'Mongoose', 'Cloudinary',
  'Razorpay', 'Framer Motion', 'Vercel',
]

const SOCIAL_LINKS = [
  { label: 'Website',  icon: <Globe        size={18} />, href: DEVELOPER.website,           color: 'var(--text-on-saffron)', bg: 'var(--surface-saffron)' },
  { label: 'GitHub',   icon: <GithubIcon   size={18} />, href: DEVELOPER.github,            color: 'var(--text-secondary)',  bg: 'var(--bg-surface-muted)'  },
  { label: 'LinkedIn', icon: <LinkedinIcon size={18} />, href: DEVELOPER.linkedin,          color: '#0a66c2',                bg: 'var(--surface-blue)'      },
  { label: 'Email',    icon: <Mail         size={18} />, href: `mailto:${DEVELOPER.email}`, color: 'var(--text-on-green)',   bg: 'var(--surface-green)'     },
]

export default function DeveloperClient() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Back */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <Link href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-saffron-600 transition-colors mb-8">
            <ArrowLeft size={15} />Back to site
          </Link>
        </motion.div>

        {/* Hero card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="card rounded-3xl overflow-hidden mb-5">
          <div className="h-28 relative"
            style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #0f0e2a 100%)' }}>
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #6366f1 0%, transparent 50%), radial-gradient(circle at 80% 20%, #ff7d0f 0%, transparent 40%)' }} />
          </div>
          <div className="px-8 pt-10 pb-8">
            <div className="flex items-end justify-between -mt-10 mb-5">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg border-4 border-white dark:border-gray-800"
                style={{ background: 'linear-gradient(135deg, #6366f1, #4338ca)' }}>
                {DEVELOPER.initials}
              </div>
              <a href={DEVELOPER.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', color: '#fff' }}>
                <Globe size={14} />Portfolio ↗
              </a>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-0.5"
              style={{ fontFamily: 'var(--font-serif)' }}>
              {DEVELOPER.name}
            </h1>
            <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm mb-2">{DEVELOPER.title}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-5">{DEVELOPER.tagline}</p>
            <div className="flex flex-wrap gap-2">
              {SOCIAL_LINKS.map((link) => (
                <a key={link.label} href={link.href}
                  target={link.href.startsWith('mailto') ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                  style={{ background: link.bg, color: link.color }}>
                  {link.icon}{link.label}
                </a>
              ))}
            </div>
          </div>
        </motion.div>

        {/* This project */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="card rounded-2xl p-6 mb-5">
          <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-1">About This Project</h2>
          <p className="text-xs text-gray-400 mb-4">Mathura Vrindavan Travel Platform</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-5">
            A full-featured tour &amp; travel platform for Mathura and Vrindavan — India&apos;s
            most sacred pilgrimage destination. Built with a modern tech stack including
            server-side rendering, real-time caching, role-based auth, and a complete
            booking system with admin, driver, and customer portals.
          </p>
          <div className="flex flex-wrap gap-2">
            {PROJECT_TECH.map((tech) => (
              <span key={tech} className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ background: 'var(--surface-krishna)', color: 'var(--text-on-krishna)' }}>
                {tech}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Tech stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="card rounded-2xl p-6 mb-5">
          <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Tech Stack</h2>
          <div className="grid grid-cols-2 gap-3">
            {TECH_STACK.map((group) => (
              <div key={group.label} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400">
                  {group.icon}
                  <p className="text-xs font-bold uppercase tracking-wide">{group.label}</p>
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <p key={item} className="text-xs text-gray-500 dark:text-gray-400">· {item}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-2xl p-6 text-center"
          style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)' }}>
          <p className="text-indigo-300 text-xs font-semibold uppercase tracking-widest mb-2">Get in Touch</p>
          <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
            Have a project in mind?
          </h3>
          <p className="text-indigo-200 text-sm mb-5">
            I build modern web applications. Let&apos;s create something great together.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={DEVELOPER.website} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold text-sm"
              style={{ background: '#ff7d0f', color: '#fff' }}>
              <Globe size={15} />Visit Portfolio
            </a>
            <a href={`mailto:${DEVELOPER.email}`}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold text-sm"
              style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
              <Mail size={15} />Send Email
            </a>
          </div>
        </motion.div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Built with ❤️ for pilgrims · © {new Date().getFullYear()} {DEVELOPER.name}
        </p>
      </div>
    </div>
  )
}
