import { useEffect, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

export function CountUp({
  value,
  decimals = 0,
  suffix = '',
  prefix = '',
}: {
  value: number
  decimals?: number
  suffix?: string
  prefix?: string
}) {
  const spring = useSpring(0, { stiffness: 80, damping: 20 })
  const display = useTransform(spring, (v) => {
    const n = decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString()
    return `${prefix}${n}${suffix}`
  })
  const [text, setText] = useState(`${prefix}0${suffix}`)

  useEffect(() => {
    spring.set(value)
    return display.on('change', setText)
  }, [value, spring, display, prefix, suffix])

  return <motion.span>{text}</motion.span>
}
