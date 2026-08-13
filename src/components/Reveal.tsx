import type { ReactNode } from 'react'
import { useReveal } from '../hooks/useReveal'

interface Props {
  children: ReactNode
  className?: string
  y?: number
  delay?: number
  stagger?: number
  as?: 'div' | 'section' | 'p' | 'span' | 'h2' | 'h3' | 'li'
}

/** Scroll-triggered reveal wrapper. */
export default function Reveal({ children, className, y, delay, stagger, as = 'div' }: Props) {
  const ref = useReveal<HTMLElement>({ y, delay, stagger })
  const Tag = as as 'div'
  return (
    <Tag ref={ref as never} className={className}>
      {children}
    </Tag>
  )
}
