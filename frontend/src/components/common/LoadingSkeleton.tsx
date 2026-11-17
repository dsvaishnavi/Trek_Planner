import type { CSSProperties } from 'react'
import { cn } from '../../utils'

interface Props {
  width?: string | number
  height?: string | number
  className?: string
  style?: CSSProperties
  rounded?: boolean
  count?: number
}

export default function LoadingSkeleton({
  width = '100%',
  height = 16,
  className,
  style,
  rounded,
  count = 1,
}: Props) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn('skeleton', className)}
          style={{
            width,
            height,
            borderRadius: rounded ? 999 : undefined,
            marginBottom: count > 1 ? 8 : undefined,
            ...style,
          }}
        />
      ))}
    </>
  )
}
