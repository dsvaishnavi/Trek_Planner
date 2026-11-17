import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface Props {
  title: string
  subtitle?: string
  children?: ReactNode
  compact?: boolean
}

export default function PageHero({ title, subtitle, children, compact }: Props) {
  return (
    <section
      className="position-relative overflow-hidden"
      style={{
        padding: compact ? '2.5rem 0 1.5rem' : '3.5rem 0 2rem',
        background:
          'radial-gradient(ellipse at top left, rgba(20,184,166,0.12), transparent 55%), radial-gradient(ellipse at bottom right, rgba(196,165,116,0.1), transparent 50%)',
      }}
    >
      <div className="container">
        <motion.h1
          className="section-title mb-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            className="section-lead mb-0"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
          >
            {subtitle}
          </motion.p>
        )}
        {children && <div className="mt-3">{children}</div>}
      </div>
    </section>
  )
}
