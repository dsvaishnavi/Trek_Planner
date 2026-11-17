import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../utils'

interface Props {
  children: ReactNode
  variant?: 'gradient' | 'ghost'
  loading?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  onClick?: () => void
  'aria-label'?: string
}

export default function GradientButton({
  children,
  className,
  variant = 'gradient',
  loading,
  disabled,
  type = 'button',
  onClick,
  'aria-label': ariaLabel,
}: Props) {
  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.98 }}
      className={cn(
        variant === 'gradient' ? 'btn btn-gradient' : 'btn btn-ghost',
        className,
      )}
      disabled={disabled || loading}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {loading ? (
        <span className="d-inline-flex align-items-center gap-2">
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden />
          Working…
        </span>
      ) : (
        children
      )}
    </motion.button>
  )
}
