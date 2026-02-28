'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

type LayerType = 'plate' | 'base' | 'middle' | 'top' | 'frosting_base' | 'candles'

interface CakeLayerProps {
  type: LayerType
  visible: boolean
}

export default function CakeLayer({ type, visible }: CakeLayerProps) {
  const ref = useRef<SVGGElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!ref.current) return
    if (visible && !hasAnimated.current) {
      hasAnimated.current = true
      gsap.fromTo(ref.current,
        { y: -40, opacity: 0, scaleX: 0.85, transformOrigin: 'center bottom' },
        { y: 0, opacity: 1, scaleX: 1, duration: 0.55, ease: 'bounce.out' }
      )
    }
    if (!visible) {
      hasAnimated.current = false
      gsap.set(ref.current, { y: -40, opacity: 0, scaleX: 0.85 })
    }
  }, [visible])

  return <g ref={ref} style={{ opacity: visible ? undefined : 0 }} />
}