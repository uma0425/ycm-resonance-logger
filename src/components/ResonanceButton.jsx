import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PARTICLE_COUNT = 12
const VIBRATE_MS = 30
/** 連打時も登録するタップをスロットル（ms）。初回タップは常にカウント */
const TAP_THROTTLE_MS = 280

function triggerVibrate() {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(VIBRATE_MS)
  }
}

function ParticleBurst({ id, intensity }) {
  const angleStep = (2 * Math.PI) / PARTICLE_COUNT
  const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const angle = angleStep * i + Math.random() * 0.5
    const velocity = 80 + intensity * 40 + Math.random() * 40
    return {
      x: Math.cos(angle) * velocity,
      y: Math.sin(angle) * velocity,
      delay: Math.random() * 0.05,
      color: Math.random() > 0.5 ? '#00f3ff' : '#ff00ff',
      size: 4 + intensity * 2 + Math.random() * 4,
    }
  })

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {particles.map((p, i) => (
        <motion.div
          key={`${id}-${i}`}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 10px ${p.color}, 0 0 20px ${p.color}`,
          }}
          initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          animate={{
            opacity: 0,
            x: p.x,
            y: p.y,
            scale: 0,
          }}
          transition={{
            duration: 0.5,
            delay: p.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
}

export default function ResonanceButton({ onPress }) {
  const [burstId, setBurstId] = useState(0)
  const [intensity, setIntensity] = useState(0)
  const lastTapRef = useRef(0)
  const streakRef = useRef(0)

  const handlePress = useCallback(() => {
    const now = Date.now()
    const timeSinceLastTap = now - lastTapRef.current

    if (timeSinceLastTap < 400) {
      streakRef.current = Math.min(streakRef.current + 1, 10)
    } else {
      streakRef.current = 0
    }
    const newIntensity = Math.min(0.3 + streakRef.current * 0.07, 1)
    setIntensity(newIntensity)
    setBurstId((id) => id + 1)
    triggerVibrate()

    if (timeSinceLastTap < TAP_THROTTLE_MS) return
    lastTapRef.current = now
    onPress?.()
  }, [onPress])

  const glowIntensity = 0.4 + intensity * 0.6

  return (
    <motion.button
      type="button"
      onClick={handlePress}
      className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full select-none touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      aria-label="Resonance を送る"
    >
      {/* Outer glow — intensifies with streak */}
      <motion.div
        className="absolute inset-0 rounded-full opacity-60"
        style={{
          background: `radial-gradient(circle, rgba(0,243,255,${glowIntensity}) 0%, rgba(255,0,255,${glowIntensity * 0.6}) 50%, transparent 70%)`,
          boxShadow: `0 0 40px rgba(0,243,255,${glowIntensity}), 0 0 80px rgba(255,0,255,${glowIntensity * 0.5})`,
        }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Main button surface */}
      <div
        className="absolute inset-2 sm:inset-3 rounded-full glass border-2 flex items-center justify-center"
        style={{
          borderColor: `rgba(0, 243, 255, ${0.3 + intensity * 0.5})`,
          boxShadow: `inset 0 0 30px rgba(0,243,255,0.2), 0 0 30px rgba(0,243,255,${0.2 + intensity * 0.3})`,
        }}
      >
        <span className="font-mono text-slate-300 text-sm sm:text-base tracking-widest uppercase">
          RESONATE
        </span>
      </div>

      <AnimatePresence>
        <ParticleBurst key={burstId} id={burstId} intensity={intensity} />
      </AnimatePresence>
    </motion.button>
  )
}
