import type { LucideProps } from 'lucide-react'

import { CircleHelp } from 'lucide-react'

import { registry } from '../data/icons'

type IconProperties = LucideProps & {
  name: string
  size?: number
  strokeWidth?: number
}

function Icon({ name, size = 20, strokeWidth = 1.85, ...properties }: IconProperties) {
  const Glyph = registry[name] ?? CircleHelp
  return <Glyph aria-hidden size={size} strokeWidth={strokeWidth} {...properties} />
}

export default Icon
