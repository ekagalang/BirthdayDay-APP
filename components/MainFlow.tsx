'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import confetti from 'canvas-confetti'

gsap.registerPlugin(ScrollTrigger)

interface MainFlowProps {
  onComplete: () => void
}

const steps = [
  { text: 'Hai sayang... 🌸',                  sub: 'Scroll pelan-pelan ya, ada sesuatu untukmu', bg: 'from-pink-950 to-rose-900' },
  { text: 'Hari ini hari yang spesial ✨',       sub: 'Hari di mana kamu hadir di dunia ini',       bg: 'from-rose-900 to-pink-900' },
  { text: 'Terima kasih sudah ada 💕',           sub: 'Setiap hari bersamamu adalah anugerah',       bg: 'from-pink-900 to-fuchsia-900' },
  { text: 'Kamu adalah kebahagiaanku 🌷',        sub: 'Yang membuatku tersenyum setiap harinya',     bg: 'from-fuchsia-900 to-purple-900' },
  { text: 'Semoga hari-harimu selalu manis 🍓', sub: 'Seperti frosting di atas kue ini',            bg: 'from-purple-900 to-pink-950' },
  { text: 'Selamat Ulang Tahun, Sayangku! 🎂',  sub: 'Sekarang tiup lilinnya yuk!',                 bg: 'from-pink-950 to-gray-950' },
]

const layerIds = ['g-plate', 'g-base', 'g-middle', 'g-top', 'g-frosting', 'g-candles']

const TOTAL_CLICKS = 30
const CANDLE_COUNT = 3

export default function MainFlow({ onComplete }: MainFlowProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgCakeRef = useRef<SVGSVGElement>(null)
  const animatedRef = useRef<Set<number>>(new Set())

  const [currentStep, setCurrentStep] = useState(-1)
  const [textKey, setTextKey] = useState(0)
  const [showBlowBtn, setShowBlowBtn] = useState(false)
  const [blowMode, setBlowMode] = useState(false)

  // Blow state
  const [clicks, setClicks] = useState(0)
  const [deadCandles, setDeadCandles] = useState<number[]>([])
  const [done, setDone] = useState(false)
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])
  const prevDeadCount = useRef(0)
  const completedRef = useRef(false)
  const rippleId = useRef(0)
  const isBlowActive = useRef(false)

  const progress = Math.min(clicks / TOTAL_CLICKS, 1)
  const targetDead = Math.floor(progress * CANDLE_COUNT)

  // Cake layer helpers
  const revealLayer = (index: number) => {
    if (!svgCakeRef.current) return
    if (animatedRef.current.has(index)) return
    animatedRef.current.add(index)
    const el = svgCakeRef.current.getElementById(layerIds[index])
    if (!el) return
    gsap.fromTo(el,
      { attr: { transform: 'translate(0,-40)' }, opacity: 0 },
      { attr: { transform: 'translate(0,0)' }, opacity: 1, duration: 0.55, ease: 'bounce.out' }
    )
  }

  const hideLayer = (index: number) => {
    if (!svgCakeRef.current) return
    animatedRef.current.delete(index)
    const el = svgCakeRef.current.getElementById(layerIds[index])
    if (!el) return
    gsap.set(el, { attr: { transform: 'translate(0,-40)' }, opacity: 0 })
  }

  // Scroll triggers
  useEffect(() => {
    if (!svgCakeRef.current) return
    layerIds.forEach(id => {
      const el = svgCakeRef.current!.getElementById(id)
      if (el) gsap.set(el, { attr: { transform: 'translate(0,-40)' }, opacity: 0 })
    })

    const ctx = gsap.context(() => {
      steps.forEach((_, i) => {
        ScrollTrigger.create({
          trigger: `#step-${i}`,
          start: 'top center',
          onEnter: () => {
            setCurrentStep(i)
            setTextKey(k => k + 1)
            for (let j = 0; j <= i; j++) revealLayer(j)
            if (i === steps.length - 1) {
              setTimeout(() => setShowBlowBtn(true), 700)
            }
          },
          onEnterBack: () => {
            if (isBlowActive.current) return // lock jika sudah blow mode
            setCurrentStep(i)
            setTextKey(k => k + 1)
            setShowBlowBtn(false)
            for (let j = i + 1; j < steps.length; j++) hideLayer(j)
         },
        })
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  // Dead candles
  useEffect(() => {
    if (targetDead > prevDeadCount.current) {
      setDeadCandles([...Array(targetDead)].map((_, i) => i))
      prevDeadCount.current = targetDead
    }
  }, [targetDead])

  // Complete
  useEffect(() => {
    if (clicks >= TOTAL_CLICKS && !completedRef.current) {
      completedRef.current = true
      setDone(true)
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#ff6b9d', '#a78bfa', '#34d399', '#fbbf24'] })
      setTimeout(() => confetti({ particleCount: 80, spread: 100, origin: { y: 0.5, x: 0.3 }, colors: ['#ff6b9d', '#c084fc'] }), 300)
      setTimeout(() => confetti({ particleCount: 80, spread: 100, origin: { y: 0.5, x: 0.7 }, colors: ['#34d399', '#fbbf24'] }), 500)
      setTimeout(onComplete, 2500)
    }
  }, [clicks, onComplete])

  const handleStartBlow = () => {
    setBlowMode(true)
    isBlowActive.current = true
  }

  const handleTap = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isBlowActive.current || completedRef.current) return
    const id = rippleId.current++
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
    setRipples(r => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }])
    setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 500)
    setClicks(c => Math.min(c + 1, TOTAL_CLICKS))
  }

  const isFlameVisible = (index: number) => !deadCandles.includes(index)
  const step = steps[Math.max(currentStep, 0)]

  return (
    <div ref={containerRef} className="relative">

      {/* ===== STICKY DISPLAY ===== */}
      <div
        className={`sticky top-0 h-screen flex flex-col items-center justify-center bg-gradient-to-b ${step.bg} transition-all duration-700 z-10 overflow-hidden ${blowMode ? 'pointer-events-auto' : 'pointer-events-none'}`}
        onPointerDown={handleTap}
      >
        {/* Bintang background */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 2.5 + 1,
                height: Math.random() * 2.5 + 1,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.4 + 0.1,
              }}
            />
          ))}
        </div>

        {/* Message — sembunyikan saat blow mode */}
        {!blowMode && (
          <div key={textKey} className="text-center px-8 mb-6 z-10 animate-fade-in pointer-events-none">
            <p className="text-white text-2xl font-bold drop-shadow-lg">{step.text}</p>
            <p className="text-pink-200 text-sm mt-2">{step.sub}</p>
          </div>
        )}

        {/* Blow mode header */}
        {blowMode && (
          <div className="text-center px-8 mb-4 z-10 pointer-events-none" style={{ animation: 'fadeIn 0.6s ease forwards' }}>
            <p className="text-white text-2xl font-bold drop-shadow-lg">Tiup lilinnya! 🕯️</p>
            <p className="text-pink-300 text-sm mt-1">
              {done ? 'Selamat! 🎉' : 'Tap di mana saja secepat mungkin!'}
            </p>
          </div>
        )}

        {/* ===== CAKE SVG ===== */}
        <svg ref={svgCakeRef} viewBox="0 0 320 420" className="w-72 z-10 pointer-events-none" style={{ overflow: 'visible' }}>
          <defs>
            <style>{`
              @keyframes flicker1 {
                0%,100%{transform:scaleX(1) scaleY(1) translateY(0px);opacity:.95}
                25%{transform:scaleX(.85) scaleY(1.1) translateY(-2px);opacity:1}
                50%{transform:scaleX(1.1) scaleY(.95) translateY(1px);opacity:.9}
                75%{transform:scaleX(.9) scaleY(1.08) translateY(-1px);opacity:1}
              }
              @keyframes flicker2 {
                0%,100%{transform:scaleX(1.05) scaleY(1) translateY(0px);opacity:.92}
                30%{transform:scaleX(.9) scaleY(1.12) translateY(-3px);opacity:1}
                60%{transform:scaleX(1.08) scaleY(.92) translateY(2px);opacity:.88}
                80%{transform:scaleX(.88) scaleY(1.06) translateY(-1px);opacity:.95}
              }
              @keyframes flicker3 {
                0%,100%{transform:scaleX(.95) scaleY(1.02) translateY(0px);opacity:.93}
                20%{transform:scaleX(1.08) scaleY(.9) translateY(2px);opacity:.88}
                55%{transform:scaleX(.88) scaleY(1.1) translateY(-2px);opacity:1}
                85%{transform:scaleX(1.05) scaleY(.95) translateY(1px);opacity:.9}
              }
              @keyframes glowPulse{0%,100%{opacity:.3}50%{opacity:.6}}
              @keyframes smokeRise{
                0%{transform:translateY(0px) scaleX(1);opacity:.6}
                100%{transform:translateY(-20px) scaleX(1.5);opacity:0}
              }
              @keyframes fadeIn{from{opacity:0}to{opacity:1}}
              @keyframes rippleOut{
                0%{transform:scale(.5);opacity:.8}
                100%{transform:scale(2.5);opacity:0}
              }
              .flame1{animation:flicker1 .9s ease-in-out infinite;transform-origin:center bottom;transform-box:fill-box}
              .flame2{animation:flicker2 .75s ease-in-out infinite;transform-origin:center bottom;transform-box:fill-box}
              .flame3{animation:flicker3 1.1s ease-in-out infinite;transform-origin:center bottom;transform-box:fill-box}
              .glow1{animation:glowPulse .9s ease-in-out infinite}
              .glow2{animation:glowPulse .75s ease-in-out infinite}
              .glow3{animation:glowPulse 1.1s ease-in-out infinite}
              .smoke{animation:smokeRise 1.2s ease-out infinite;transform-origin:center bottom;transform-box:fill-box}
            `}</style>
            <linearGradient id="frostingGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#ffe0ee" />
            </linearGradient>
          </defs>

          {/* PLATE */}
          <g id="g-plate">
            <ellipse cx="160" cy="400" rx="148" ry="13" fill="#8B4513" stroke="#5C2D0A" strokeWidth="2" />
            <ellipse cx="160" cy="395" rx="148" ry="13" fill="#D4A96A" stroke="#8B6340" strokeWidth="2" />
            <ellipse cx="160" cy="391" rx="144" ry="10" fill="#EEC98A" />
            <ellipse cx="115" cy="388" rx="28" ry="4" fill="white" opacity="0.2" />
          </g>

          {/* BASE */}
          <g id="g-base">
            <rect x="18" y="295" width="284" height="98" rx="10" fill="#FF6B9D" stroke="#C94070" strokeWidth="3" />
            <path d="M18 295 Q36 278 54 295 Q72 312 90 295 Q108 278 126 295 Q144 312 162 295 Q180 278 198 295 Q216 312 234 295 Q252 278 270 295 Q288 312 302 300 L302 308 Q288 296 270 308 Q252 325 234 308 Q216 291 198 308 Q180 325 162 308 Q144 291 126 308 Q108 325 90 308 Q72 291 54 308 Q36 325 18 308 Z" fill="url(#frostingGrad)" />
            <path d="M18 310 Q12 325 18 342" stroke="white" strokeWidth="9" fill="none" strokeLinecap="round" opacity="0.5" />
            <path d="M302 310 Q308 325 302 342" stroke="white" strokeWidth="9" fill="none" strokeLinecap="round" opacity="0.5" />
            <rect x="18" y="352" width="284" height="8" fill="#FF8FB5" opacity="0.35" />
            <rect x="32" y="313" width="75" height="11" rx="5.5" fill="white" opacity="0.18" />
            <rect x="18" y="295" width="284" height="98" rx="10" fill="none" stroke="#C94070" strokeWidth="3" />
          </g>

          {/* MIDDLE */}
          <g id="g-middle">
            <rect x="48" y="210" width="224" height="88" rx="10" fill="#FF9EBB" stroke="#C94070" strokeWidth="3" />
            <path d="M48 210 Q64 195 80 210 Q96 225 112 210 Q128 195 144 210 Q160 225 176 210 Q192 195 208 210 Q224 225 240 210 Q256 195 272 210 Q272 210 272 218 Q256 203 240 218 Q224 233 208 218 Q192 203 176 218 Q160 233 144 218 Q128 203 112 218 Q96 233 80 218 Q64 203 48 218 Z" fill="url(#frostingGrad)" />
            <path d="M48 222 Q42 236 48 250" stroke="white" strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.5" />
            <path d="M272 222 Q278 236 272 250" stroke="white" strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.5" />
            <rect x="48" y="264" width="224" height="7" fill="#FFB8CC" opacity="0.35" />
            <rect x="62" y="225" width="60" height="10" rx="5" fill="white" opacity="0.18" />
            <rect x="48" y="210" width="224" height="88" rx="10" fill="none" stroke="#C94070" strokeWidth="3" />
          </g>

          {/* TOP */}
          <g id="g-top">
            <rect x="82" y="138" width="156" height="75" rx="10" fill="#FFCDE0" stroke="#C94070" strokeWidth="3" />
            <path d="M82 138 Q96 125 110 138 Q124 151 138 138 Q152 125 166 138 Q180 151 194 138 Q208 125 222 138 Q236 151 238 140 L238 148 Q224 135 210 148 Q196 161 182 148 Q168 135 154 148 Q140 161 126 148 Q112 135 98 148 Q84 161 82 150 Z" fill="url(#frostingGrad)" />
            <path d="M82 152 Q76 164 82 176" stroke="white" strokeWidth="7" fill="none" strokeLinecap="round" opacity="0.5" />
            <path d="M238 152 Q244 164 238 176" stroke="white" strokeWidth="7" fill="none" strokeLinecap="round" opacity="0.5" />
            <rect x="82" y="138" width="156" height="75" rx="10" fill="none" stroke="#C94070" strokeWidth="3" />
            <rect x="94" y="153" width="50" height="9" rx="4.5" fill="white" opacity="0.18" />
          </g>

          {/* FROSTING */}
          <g id="g-frosting">
            <path d="M88 138 Q100 108 116 122 Q128 100 144 118 Q156 96 172 118 Q188 100 204 122 Q218 108 232 138 Z" fill="white" stroke="#f0d0e0" strokeWidth="1.5" />
            <path d="M108 130 Q118 114 130 126" stroke="#FFB8D0" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M148 122 Q158 108 170 120" stroke="#FFB8D0" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M186 128 Q196 114 208 126" stroke="#FFB8D0" strokeWidth="2" fill="none" strokeLinecap="round" />
            <circle cx="122" cy="132" r="3.5" fill="#FF6B9D" />
            <circle cx="144" cy="124" r="3.5" fill="#A78BFA" />
            <circle cx="164" cy="128" r="3.5" fill="#34D399" />
            <circle cx="186" cy="124" r="3.5" fill="#FBBF24" />
            <circle cx="205" cy="132" r="3.5" fill="#F87171" />
          </g>

          {/* CANDLES */}
          <g id="g-candles">
            {/* Lilin 1 */}
            {!isFlameVisible(0)
              ? <>
                  <ellipse cx="118" cy="92" rx="4" ry="2" fill="#aaa" className="smoke" />
                  <ellipse cx="118" cy="88" rx="3" ry="2" fill="#bbb" style={{ animation: 'smokeRise 1.4s ease-out 0.3s infinite' }} />
                </>
              : <>
                  <circle cx="118" cy="80" r="12" fill="#ff88ff" opacity="0.25" className="glow1" />
                  <path className="flame1" d="M118 95 Q106 82 109 68 Q111 56 118 50 Q125 56 127 68 Q130 82 118 95Z" fill="#cc44ff" />
                  <path className="flame1" d="M118 93 Q109 82 111 70 Q113 60 118 55 Q123 60 125 70 Q127 82 118 93Z" fill="#ff88ff" />
                  <path className="flame1" d="M118 90 Q113 82 114 72 Q116 65 118 62 Q120 65 122 72 Q123 82 118 90Z" fill="#ffccff" />
                  <path className="flame1" d="M118 88 Q115 82 116 75 Q117 70 118 68 Q119 70 120 75 Q121 82 118 88Z" fill="white" opacity="0.85" />
                </>
            }
            <line x1="118" y1="95" x2="118" y2="103" stroke="#555" strokeWidth="2" strokeLinecap="round" />
            <rect x="108" y="103" width="20" height="62" rx="4" fill="#FF7EB3" stroke="#C94070" strokeWidth="2" />
            <rect x="108" y="115" width="20" height="5" fill="#FFB8D0" opacity="0.7" />
            <rect x="108" y="130" width="20" height="5" fill="#FFB8D0" opacity="0.7" />
            <rect x="108" y="145" width="20" height="5" fill="#FFB8D0" opacity="0.7" />
            <rect x="112" y="105" width="5" height="18" rx="2.5" fill="white" opacity="0.3" />
            <ellipse cx="118" cy="165" rx="10" ry="4" fill="#C94070" />

            {/* Lilin 2 */}
            {!isFlameVisible(1)
              ? <>
                  <ellipse cx="160" cy="82" rx="4" ry="2" fill="#aaa" className="smoke" />
                  <ellipse cx="160" cy="78" rx="3" ry="2" fill="#bbb" style={{ animation: 'smokeRise 1.4s ease-out 0.3s infinite' }} />
                </>
              : <>
                  <circle cx="160" cy="70" r="12" fill="#ffaaff" opacity="0.25" className="glow2" />
                  <path className="flame2" d="M160 86 Q148 73 151 59 Q153 47 160 41 Q167 47 169 59 Q172 73 160 86Z" fill="#9933ff" />
                  <path className="flame2" d="M160 84 Q151 73 153 61 Q155 51 160 46 Q165 51 167 61 Q169 73 160 84Z" fill="#ffaaff" />
                  <path className="flame2" d="M160 81 Q154 73 155 63 Q157 56 160 53 Q163 56 165 63 Q166 73 160 81Z" fill="#ffddff" />
                  <path className="flame2" d="M160 79 Q157 73 158 66 Q159 61 160 59 Q161 61 162 66 Q163 73 160 79Z" fill="white" opacity="0.85" />
                </>
            }
            <line x1="160" y1="86" x2="160" y2="94" stroke="#555" strokeWidth="2" strokeLinecap="round" />
            <rect x="150" y="94" width="20" height="68" rx="4" fill="#A78BFA" stroke="#7C3AED" strokeWidth="2" />
            <rect x="150" y="106" width="20" height="5" fill="#C4B5FD" opacity="0.7" />
            <rect x="150" y="121" width="20" height="5" fill="#C4B5FD" opacity="0.7" />
            <rect x="150" y="136" width="20" height="5" fill="#C4B5FD" opacity="0.7" />
            <rect x="154" y="96" width="5" height="20" rx="2.5" fill="white" opacity="0.3" />
            <ellipse cx="160" cy="162" rx="10" ry="4" fill="#7C3AED" />

            {/* Lilin 3 */}
            {!isFlameVisible(2)
              ? <>
                  <ellipse cx="202" cy="92" rx="4" ry="2" fill="#aaa" className="smoke" />
                  <ellipse cx="202" cy="88" rx="3" ry="2" fill="#bbb" style={{ animation: 'smokeRise 1.4s ease-out 0.3s infinite' }} />
                </>
              : <>
                  <circle cx="202" cy="80" r="12" fill="#ff88ff" opacity="0.25" className="glow3" />
                  <path className="flame3" d="M202 95 Q190 82 193 68 Q195 56 202 50 Q209 56 211 68 Q214 82 202 95Z" fill="#cc44ff" />
                  <path className="flame3" d="M202 93 Q193 82 195 70 Q197 60 202 55 Q207 60 209 70 Q211 82 202 93Z" fill="#ff88ff" />
                  <path className="flame3" d="M202 90 Q197 82 198 72 Q200 65 202 62 Q204 65 206 72 Q207 82 202 90Z" fill="#ffccff" />
                  <path className="flame3" d="M202 88 Q199 82 200 75 Q201 70 202 68 Q203 70 204 75 Q205 82 202 88Z" fill="white" opacity="0.85" />
                </>
            }
            <line x1="202" y1="95" x2="202" y2="103" stroke="#555" strokeWidth="2" strokeLinecap="round" />
            <rect x="192" y="103" width="20" height="62" rx="4" fill="#34D399" stroke="#059669" strokeWidth="2" />
            <rect x="192" y="115" width="20" height="5" fill="#6EE7B7" opacity="0.7" />
            <rect x="192" y="130" width="20" height="5" fill="#6EE7B7" opacity="0.7" />
            <rect x="192" y="145" width="20" height="5" fill="#6EE7B7" opacity="0.7" />
            <rect x="196" y="105" width="5" height="18" rx="2.5" fill="white" opacity="0.3" />
            <ellipse cx="202" cy="165" rx="10" ry="4" fill="#059669" />
          </g>
        </svg>

        {/* Tombol Tiup Sekarang — fade in setelah lilin muncul */}
        {showBlowBtn && !blowMode && (
          <button
            onClick={handleStartBlow}
            className="pointer-events-auto mt-6 z-20 px-8 py-3 rounded-2xl text-white font-bold text-lg shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #ff6b9d, #a78bfa)',
              boxShadow: '0 0 30px #ff6b9d88',
              animation: 'fadeIn 0.8s ease forwards',
            }}
          >
            💨 Tiup Sekarang!
          </button>
        )}

        {/* Blow mode overlay */}
        {blowMode && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center px-6 select-none"
            style={{ animation: 'fadeIn 0.6s ease forwards', background: 'rgba(10,0,20,0.5)' }}
          >
            {/* Ripples */}
            {ripples.map(rp => (
              <span key={rp.id} className="absolute rounded-full pointer-events-none"
                style={{
                  left: rp.x - 30, top: rp.y - 30, width: 60, height: 60,
                  background: 'radial-gradient(circle, #ff88ff55, transparent)',
                  animation: 'rippleOut 0.5s ease-out forwards',
                }}
              />
            ))}

            {/* Konten blow — diposisikan di bawah kue */}
            <div
            className="absolute bottom-10 left-0 right-0 flex flex-col items-center px-8 pointer-events-none"
            style={{ animation: 'fadeIn 0.6s ease forwards' }}
            >
            {!done ? (
                <>
                <p className="text-white text-sm font-semibold mb-3 text-center">
                    👆 Tap tap tap layar ini secepat mungkin untuk meniup lilin!
                </p>
                <div className="w-full max-w-xs">
                    <div className="flex justify-between text-xs text-pink-300 mb-1">
                    <span>💨 Hembusan</span>
                    <span>{deadCandles.length} / {CANDLE_COUNT} lilin padam</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
                    <div className="h-4 rounded-full transition-all duration-150"
                        style={{ width: `${progress * 100}%`, background: 'linear-gradient(90deg, #a78bfa, #ff6b9d)' }}
                    />
                    </div>
                </div>
                </>
            ) : (
                <div className="text-center" style={{ animation: 'fadeIn 0.5s ease forwards' }}>
                <p className="text-4xl mb-2">🎉</p>
                <p className="text-white text-lg font-bold">Semua lilin padam!</p>
                <p className="text-pink-300 text-sm">Sebentar lagi...</p>
                </div>
            )}
            </div>
          </div>
        )}

        {/* Scroll hint */}
        {currentStep < 5 && !blowMode && (
          <div className="absolute bottom-8 flex flex-col items-center gap-1 animate-bounce z-10 pointer-events-none">
            <p className="text-pink-300 text-xs tracking-widest uppercase">scroll</p>
            <svg className="w-5 h-5 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}
      </div>

      {/* Scroll spacer */}
      <div className="relative z-0">
        {steps.map((_, i) => (
          <div key={i} id={`step-${i}`} className="h-screen" />
        ))}
      </div>
    </div>
  )
}