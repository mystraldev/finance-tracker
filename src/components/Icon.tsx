import type { LucideProps } from 'lucide-react'
import { CircleHelp } from 'lucide-react'
import { registry } from '../data/icons'

type IconProps = LucideProps & {
  name: string
  size?: number
  strokeWidth?: number
}

function Icon({ name, size = 20, strokeWidth = 1.85, ...props }: IconProps) {
  const Glyph = registry[name] ?? CircleHelp
  return <Glyph size={size} strokeWidth={strokeWidth} aria-hidden {...props} />
}

export default Icon
