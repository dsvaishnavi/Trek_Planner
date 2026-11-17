import type { HTMLAttributes, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../utils'

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  hover?: boolean
  asMotion?: boolean
}

export default function GlassCard({
  children,
  className,
  hover,
  asMotion,
  ...rest
}: Props) {
  const classes = cn('glass-card', hover && 'media-card', className)

  if (asMotion) {
    return (
      <motion.div
        className={classes}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.45 }}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  )
}
