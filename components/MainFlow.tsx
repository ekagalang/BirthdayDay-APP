'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import confetti from 'canvas-confetti'

gsap.registerPlugin(ScrollTrigger)

interface MainFlowProps {
  onComplete: () => void
}

const steps = [
  {
    text: 'Untuk kamu, satu-satunya yang membuat duniaku terasa lengkap 💌',
    sub: 'Ada sesuatu yang sudah lama ingin aku sampaikan... scroll pelan-pelan ya',
    bg: 'from-pink-950 to-rose-900'
  },
  {
    text: 'Hari ini, bertahun-tahun yang lalu, seseorang yang paling berharga hadir ke dunia ✨',
    sub: 'Dan aku bersyukur setiap hari bahwa takdir mempertemukan kita',
    bg: 'from-blue-950 to-cyan-900'
  },
  {
    text: 'Terima kasih sudah hadir, sudah bertahan, sudah memilihku setiap harinya 💕',
    sub: 'Tidak semua orang seberuntung aku — memiliki kamu di sisiku',
    bg: 'from-green-950 to-emerald-900'
  },
  {
    text: 'Bersamamu, bahkan hari yang paling biasa pun terasa seperti hadiah 🌷',
    sub: 'Kamu adalah alasan aku percaya bahwa kebaikan itu nyata',
    bg: 'from-slate-900 to-stone-800'
  },
  {
    text: 'Aku berharap setiap harimu seindah cara kamu membuatku merasa dicintai 🍓',
    sub: 'Semoga kebahagiaan selalu menemanimu, hari ini dan selamanya',
    bg: 'from-orange-950 to-pink-900'
  },
  {
    text: 'Selamat ulang tahun, sayangku 🎂',
    sub: 'Semoga tahun ini membawamu lebih banyak tawa, lebih sedikit air mata, dan lebih banyak momen indah bersama orang-orang yang mencintaimu — termasuk aku',
    bg: 'from-pink-950 to-gray-950'
  },
]

// Theme: none, aquarium, zoo, oldcity, food, celebration
const layerThemes = ['none', 'aquarium', 'zoo', 'oldcity', 'food', 'celebration']
const layerIds = ['g-plate', 'g-base', 'g-middle', 'g-top', 'g-frosting', 'g-candles']

const TOTAL_CLICKS = 30
const CANDLE_COUNT = 3

// ===== AQUARIUM BACKGROUND =====
function AquariumBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const fish = Array.from({ length: 8 }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: 100 + Math.random() * (canvas.height - 200),
      size: 18 + Math.random() * 22,
      speed: 0.4 + Math.random() * 0.8,
      dir: Math.random() > 0.5 ? 1 : -1,
      color: ['#22d3ee', '#06b6d4', '#0ea5e9', '#38bdf8', '#7dd3fc', '#a5f3fc'][i % 6],
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.02 + Math.random() * 0.02,
    }))

    const bubbles = Array.from({ length: 20 }, () => ({
      x: Math.random() * canvas.width,
      y: canvas.height + Math.random() * 100,
      r: 3 + Math.random() * 8,
      speed: 0.3 + Math.random() * 0.5,
      wobble: Math.random() * Math.PI * 2,
    }))

    const seaweeds = Array.from({ length: 7 }, () => ({
      x: 60 + Math.random() * (canvas.width - 120),
      segments: 5 + Math.floor(Math.random() * 4),
      phase: Math.random() * Math.PI * 2,
      height: 40 + Math.random() * 60,
    }))

    let frame = 0
    let animId: number

    const drawFish = (f: typeof fish[0]) => {
      ctx.save()
      ctx.translate(f.x, f.y + Math.sin(f.wobble) * 6)
      if (f.dir < 0) ctx.scale(-1, 1)
      ctx.beginPath()
      ctx.ellipse(0, 0, f.size, f.size * 0.55, 0, 0, Math.PI * 2)
      ctx.fillStyle = f.color
      ctx.fill()
      // tail
      ctx.beginPath()
      ctx.moveTo(-f.size * 0.8, 0)
      ctx.lineTo(-f.size * 1.5, -f.size * 0.5)
      ctx.lineTo(-f.size * 1.5, f.size * 0.5)
      ctx.closePath()
      ctx.fillStyle = f.color
      ctx.fill()
      // eye
      ctx.beginPath()
      ctx.arc(f.size * 0.4, -f.size * 0.1, f.size * 0.12, 0, Math.PI * 2)
      ctx.fillStyle = 'white'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(f.size * 0.43, -f.size * 0.1, f.size * 0.07, 0, Math.PI * 2)
      ctx.fillStyle = '#1e293b'
      ctx.fill()
      ctx.restore()
    }

    const drawSeaweed = (s: typeof seaweeds[0], t: number) => {
      const segH = s.height / s.segments
      ctx.beginPath()
      ctx.moveTo(s.x, canvas.height - 60)
      for (let i = 0; i < s.segments; i++) {
        const sway = Math.sin(t * 0.02 + s.phase + i * 0.5) * 12
        const y = canvas.height - 60 - i * segH
        ctx.lineTo(s.x + sway, y)
      }
      ctx.strokeStyle = '#16a34a'
      ctx.lineWidth = 4
      ctx.lineCap = 'round'
      ctx.stroke()
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      frame++

      // Water gradient
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height)
      grad.addColorStop(0, 'rgba(14,116,144,0.15)')
      grad.addColorStop(1, 'rgba(8,47,73,0.3)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Seaweeds
      seaweeds.forEach(s => drawSeaweed(s, frame))

      // Sand bottom
      ctx.fillStyle = 'rgba(234,179,8,0.15)'
      ctx.fillRect(0, canvas.height - 60, canvas.width, 60)

      // Fish
      fish.forEach(f => {
        f.x += f.speed * f.dir
        f.wobble += f.wobbleSpeed
        if (f.x > canvas.width + 60) f.x = -60
        if (f.x < -60) f.x = canvas.width + 60
        drawFish(f)
      })

      // Bubbles
      bubbles.forEach(b => {
        b.y -= b.speed
        b.wobble += 0.03
        const bx = b.x + Math.sin(b.wobble) * 4
        if (b.y < -20) { b.y = canvas.height + 20; b.x = Math.random() * canvas.width }
        ctx.beginPath()
        ctx.arc(bx, b.y, b.r, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(186,230,253,0.5)'
        ctx.lineWidth = 1.5
        ctx.stroke()
        ctx.fillStyle = 'rgba(186,230,253,0.08)'
        ctx.fill()
      })

      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animId)
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ opacity: 0.9 }} />
}

// ===== ZOO BACKGROUND =====
function ZooBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const animals = [
      { x: canvas.width * 0.1, y: canvas.height * 0.65, type: 'elephant', phase: 0 },
      { x: canvas.width * 0.35, y: canvas.height * 0.7, type: 'giraffe', phase: 1 },
      { x: canvas.width * 0.65, y: canvas.height * 0.65, type: 'lion', phase: 0.5 },
      { x: canvas.width * 0.88, y: canvas.height * 0.7, type: 'panda', phase: 1.5 },
    ]

    const trees = Array.from({ length: 5 }, (_, i) => ({
      x: (canvas.width / 5) * i + canvas.width * 0.1,
      y: canvas.height * 0.55,
      size: 30 + Math.random() * 20,
      phase: Math.random() * Math.PI * 2,
    }))

    const butterflies = Array.from({ length: 5 }, () => ({
      x: Math.random() * canvas.width,
      y: canvas.height * 0.2 + Math.random() * canvas.height * 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.4,
      amp: 30 + Math.random() * 40,
      color: ['#f472b6', '#a78bfa', '#fb923c', '#34d399'][Math.floor(Math.random() * 4)],
    }))

    let frame = 0
    let animId: number

    const drawTree = (t: typeof trees[0], f: number) => {
      const sway = Math.sin(f * 0.01 + t.phase) * 3
      // trunk
      ctx.fillStyle = '#92400e'
      ctx.fillRect(t.x - 5, t.y, 10, 40)
      // leaves
      ctx.save()
      ctx.translate(t.x, t.y)
      ctx.rotate(sway * 0.05)
      ctx.beginPath()
      ctx.arc(0, -t.size * 0.5, t.size, 0, Math.PI * 2)
      ctx.fillStyle = '#16a34a'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(-t.size * 0.4, -t.size * 0.2, t.size * 0.7, 0, Math.PI * 2)
      ctx.fillStyle = '#15803d'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(t.size * 0.4, -t.size * 0.2, t.size * 0.7, 0, Math.PI * 2)
      ctx.fillStyle = '#166534'
      ctx.fill()
      ctx.restore()
    }

    const drawElephant = (x: number, y: number, bob: number) => {
      const s = 38
      ctx.save()
      ctx.translate(x, y + bob)
      // body
      ctx.beginPath()
      ctx.ellipse(0, 0, s, s * 0.75, 0, 0, Math.PI * 2)
      ctx.fillStyle = '#9ca3af'
      ctx.fill()
      // head
      ctx.beginPath()
      ctx.ellipse(s * 0.85, -s * 0.3, s * 0.55, s * 0.5, 0.3, 0, Math.PI * 2)
      ctx.fillStyle = '#9ca3af'
      ctx.fill()
      // trunk
      ctx.beginPath()
      ctx.moveTo(s * 1.2, -s * 0.1)
      ctx.quadraticCurveTo(s * 1.6, s * 0.3, s * 1.3, s * 0.6)
      ctx.strokeStyle = '#6b7280'
      ctx.lineWidth = 8
      ctx.lineCap = 'round'
      ctx.stroke()
      // ear
      ctx.beginPath()
      ctx.ellipse(s * 0.5, -s * 0.4, s * 0.3, s * 0.4, -0.3, 0, Math.PI * 2)
      ctx.fillStyle = '#d1d5db'
      ctx.fill()
      // eye
      ctx.beginPath()
      ctx.arc(s * 1.05, -s * 0.45, 4, 0, Math.PI * 2)
      ctx.fillStyle = '#1e293b'
      ctx.fill()
      ctx.restore()
    }

    const drawGiraffe = (x: number, y: number, bob: number) => {
      ctx.save()
      ctx.translate(x, y + bob)
      // body
      ctx.beginPath()
      ctx.ellipse(0, 0, 20, 28, 0, 0, Math.PI * 2)
      ctx.fillStyle = '#fbbf24'
      ctx.fill()
      // neck
      ctx.beginPath()
      ctx.moveTo(-8, -20)
      ctx.lineTo(8, -20)
      ctx.lineTo(5, -80)
      ctx.lineTo(-5, -80)
      ctx.closePath()
      ctx.fillStyle = '#f59e0b'
      ctx.fill()
      // head
      ctx.beginPath()
      ctx.ellipse(0, -92, 14, 10, 0, 0, Math.PI * 2)
      ctx.fillStyle = '#fbbf24'
      ctx.fill()
      // spots
      ;[[0, -10], [12, 5], [-12, 8], [5, -50], [-5, -65]].forEach(([sx, sy]) => {
        ctx.beginPath()
        ctx.ellipse(sx, sy, 7, 5, Math.random(), 0, Math.PI * 2)
        ctx.fillStyle = '#92400e'
        ctx.fill()
      })
      // eye
      ctx.beginPath()
      ctx.arc(7, -95, 3, 0, Math.PI * 2)
      ctx.fillStyle = '#1e293b'
      ctx.fill()
      ctx.restore()
    }

    const drawLion = (x: number, y: number, bob: number) => {
      const s = 32
      ctx.save()
      ctx.translate(x, y + bob)
      // mane
      ctx.beginPath()
      ctx.arc(s * 0.6, -s * 0.3, s * 0.75, 0, Math.PI * 2)
      ctx.fillStyle = '#92400e'
      ctx.fill()
      // body
      ctx.beginPath()
      ctx.ellipse(0, 0, s, s * 0.65, 0, 0, Math.PI * 2)
      ctx.fillStyle = '#fbbf24'
      ctx.fill()
      // head
      ctx.beginPath()
      ctx.arc(s * 0.6, -s * 0.3, s * 0.55, 0, Math.PI * 2)
      ctx.fillStyle = '#fcd34d'
      ctx.fill()
      // snout
      ctx.beginPath()
      ctx.ellipse(s * 1.0, -s * 0.15, s * 0.22, s * 0.18, 0, 0, Math.PI * 2)
      ctx.fillStyle = '#fde68a'
      ctx.fill()
      // nose
      ctx.beginPath()
      ctx.arc(s * 1.05, -s * 0.22, 4, 0, Math.PI * 2)
      ctx.fillStyle = '#be185d'
      ctx.fill()
      // eye
      ctx.beginPath()
      ctx.arc(s * 0.82, -s * 0.45, 4, 0, Math.PI * 2)
      ctx.fillStyle = '#1e293b'
      ctx.fill()
      // tail
      ctx.beginPath()
      ctx.moveTo(-s, 0)
      ctx.quadraticCurveTo(-s * 1.5, -s * 0.5, -s * 1.3, -s)
      ctx.strokeStyle = '#f59e0b'
      ctx.lineWidth = 5
      ctx.lineCap = 'round'
      ctx.stroke()
      ctx.restore()
    }

    const drawPanda = (x: number, y: number, bob: number) => {
      const s = 30
      ctx.save()
      ctx.translate(x, y + bob)
      // body
      ctx.beginPath()
      ctx.ellipse(0, 0, s, s * 0.85, 0, 0, Math.PI * 2)
      ctx.fillStyle = 'white'
      ctx.fill()
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 1
      ctx.stroke()
      // head
      ctx.beginPath()
      ctx.arc(0, -s * 1.1, s * 0.7, 0, Math.PI * 2)
      ctx.fillStyle = 'white'
      ctx.fill()
      // ears
      ;[[-s * 0.45, -s * 1.7], [s * 0.45, -s * 1.7]].forEach(([ex, ey]) => {
        ctx.beginPath()
        ctx.arc(ex, ey, s * 0.28, 0, Math.PI * 2)
        ctx.fillStyle = '#1e293b'
        ctx.fill()
      })
      // eye patches
      ;[[-s * 0.25, -s * 1.2], [s * 0.25, -s * 1.2]].forEach(([ex, ey]) => {
        ctx.beginPath()
        ctx.ellipse(ex, ey, s * 0.22, s * 0.18, 0, 0, Math.PI * 2)
        ctx.fillStyle = '#1e293b'
        ctx.fill()
        ctx.beginPath()
        ctx.arc(ex, ey, s * 0.09, 0, Math.PI * 2)
        ctx.fillStyle = 'white'
        ctx.fill()
      })
      // nose
      ctx.beginPath()
      ctx.arc(0, -s * 0.95, s * 0.1, 0, Math.PI * 2)
      ctx.fillStyle = '#1e293b'
      ctx.fill()
      // arms
      ;[[-s * 0.9, s * 0.1], [s * 0.9, s * 0.1]].forEach(([ax, ay]) => {
        ctx.beginPath()
        ctx.ellipse(ax, ay, s * 0.28, s * 0.5, 0.4, 0, Math.PI * 2)
        ctx.fillStyle = '#1e293b'
        ctx.fill()
      })
      ctx.restore()
    }

    const drawButterfly = (b: typeof butterflies[0], f: number) => {
      const bx = b.x + Math.sin(f * b.speed * 0.02 + b.phase) * b.amp
      const by = b.y + Math.cos(f * b.speed * 0.015 + b.phase) * 20
      const wingFlap = Math.sin(f * 0.15) * 0.4
      ctx.save()
      ctx.translate(bx, by)
      // wings
      for (const side of [-1, 1]) {
        ctx.save()
        ctx.scale(side, 1)
        ctx.rotate(wingFlap * side)
        ctx.beginPath()
        ctx.ellipse(10, -6, 14, 9, -0.5, 0, Math.PI * 2)
        ctx.fillStyle = b.color + 'cc'
        ctx.fill()
        ctx.beginPath()
        ctx.ellipse(8, 6, 10, 7, 0.5, 0, Math.PI * 2)
        ctx.fillStyle = b.color + '99'
        ctx.fill()
        ctx.restore()
      }
      // body
      ctx.beginPath()
      ctx.ellipse(0, 0, 3, 8, 0, 0, Math.PI * 2)
      ctx.fillStyle = '#1e293b'
      ctx.fill()
      ctx.restore()
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      frame++

      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height)
      skyGrad.addColorStop(0, 'rgba(134,239,172,0.1)')
      skyGrad.addColorStop(1, 'rgba(20,83,45,0.25)')
      ctx.fillStyle = skyGrad
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Ground
      ctx.fillStyle = 'rgba(134,239,172,0.2)'
      ctx.fillRect(0, canvas.height * 0.75, canvas.width, canvas.height * 0.25)
      ctx.fillStyle = 'rgba(101,163,13,0.15)'
      ctx.fillRect(0, canvas.height * 0.78, canvas.width, canvas.height * 0.22)

      // Trees
      trees.forEach(t => drawTree(t, frame))

      // Butterflies
      butterflies.forEach(b => drawButterfly(b, frame))

      // Animals with bob
      const bob = Math.sin(frame * 0.04) * 3
      drawElephant(animals[0].x, animals[0].y, Math.sin(frame * 0.03 + animals[0].phase) * 3)
      drawGiraffe(animals[1].x, animals[1].y, Math.sin(frame * 0.025 + animals[1].phase) * 3)
      drawLion(animals[2].x, animals[2].y, Math.sin(frame * 0.035 + animals[2].phase) * 3)
      drawPanda(animals[3].x, animals[3].y, Math.sin(frame * 0.03 + animals[3].phase) * 3)

      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animId)
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ opacity: 0.9 }} />
}

// ===== OLD CITY BACKGROUND =====
function OldCityBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const buildings = [
      { x: 0,                    w: 90,  h: 200, color: '#78716c', windows: [[15,30],[15,70],[15,110],[50,30],[50,70],[50,110]] },
      { x: 80,                   w: 70,  h: 260, color: '#57534e', windows: [[10,20],[10,60],[10,100],[10,140],[40,20],[40,60],[40,100],[40,140]] },
      { x: canvas.width*0.25,    w: 100, h: 180, color: '#6b7280', windows: [[15,25],[15,65],[60,25],[60,65],[15,105],[60,105]] },
      { x: canvas.width*0.4,     w: 80,  h: 240, color: '#4b5563', windows: [[12,20],[12,60],[12,100],[12,140],[45,20],[45,60],[45,100],[45,140]] },
      { x: canvas.width*0.55,    w: 110, h: 160, color: '#71717a', windows: [[15,25],[15,65],[65,25],[65,65]] },
      { x: canvas.width*0.7,     w: 85,  h: 220, color: '#57534e', windows: [[12,20],[12,60],[12,100],[12,140],[48,20],[48,60]] },
      { x: canvas.width*0.85,    w: 95,  h: 190, color: '#6b7280', windows: [[15,25],[15,65],[15,105],[55,25],[55,65],[55,105]] },
    ]

    const tram = { x: -180, y: canvas.height * 0.78, speed: 0.7 }

    const lamps = Array.from({ length: 6 }, (_, i) => ({
      x: (canvas.width / 5) * i + 60,
      y: canvas.height * 0.72,
      lit: true,
    }))

    const stars = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.6,
      r: 0.5 + Math.random() * 2,
      twinkle: Math.random() * Math.PI * 2,
      speed: 0.02 + Math.random() * 0.03,
    }))

    let frame = 0
    let animId: number

    const drawBuilding = (b: typeof buildings[0], f: number) => {
      const ground = canvas.height * 0.8
      ctx.fillStyle = b.color
      ctx.fillRect(b.x, ground - b.h, b.w, b.h)
      // windows with flicker
      b.windows.forEach(([wx, wy], wi) => {
        const flicker = Math.sin(f * 0.03 + wi * 1.3) > 0.7
        ctx.fillStyle = flicker ? 'rgba(253,224,71,0.9)' : 'rgba(253,224,71,0.3)'
        ctx.fillRect(b.x + wx, ground - b.h + wy, 18, 14)
        // window frame
        ctx.strokeStyle = 'rgba(0,0,0,0.3)'
        ctx.lineWidth = 1
        ctx.strokeRect(b.x + wx, ground - b.h + wy, 18, 14)
      })
      // roof details
      ctx.fillStyle = b.color
      ctx.fillRect(b.x - 5, ground - b.h, b.w + 10, 8)
    }

    const drawTram = (x: number, y: number) => {
      ctx.save()
      ctx.translate(x, y)
      // body
      ctx.beginPath()
      ctx.roundRect(0, -50, 160, 50, 8)
      ctx.fillStyle = '#dc2626'
      ctx.fill()
      // windows
      ;[[10, -42], [50, -42], [90, -42], [125, -42]].forEach(([wx, wy]) => {
        ctx.fillStyle = 'rgba(186,230,253,0.8)'
        ctx.fillRect(wx, wy, 28, 22)
        ctx.strokeStyle = 'rgba(255,255,255,0.5)'
        ctx.lineWidth = 1
        ctx.strokeRect(wx, wy, 28, 22)
      })
      // wheels
      ;[-10, 30, 110, 150].forEach(wx => {
        ctx.beginPath()
        ctx.arc(wx + 5, 4, 10, 0, Math.PI * 2)
        ctx.fillStyle = '#1e293b'
        ctx.fill()
        ctx.beginPath()
        ctx.arc(wx + 5, 4, 5, 0, Math.PI * 2)
        ctx.fillStyle = '#64748b'
        ctx.fill()
      })
      // pantograph
      ctx.beginPath()
      ctx.moveTo(40, -50)
      ctx.lineTo(60, -80)
      ctx.lineTo(100, -80)
      ctx.lineTo(120, -50)
      ctx.strokeStyle = '#94a3b8'
      ctx.lineWidth = 2
      ctx.stroke()
      // stripe
      ctx.fillStyle = '#fbbf24'
      ctx.fillRect(0, -16, 160, 6)
      ctx.restore()
    }

    const drawLamp = (l: typeof lamps[0], f: number) => {
      // pole
      ctx.strokeStyle = '#78716c'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(l.x, l.y)
      ctx.lineTo(l.x, l.y - 80)
      ctx.lineTo(l.x + 20, l.y - 90)
      ctx.stroke()
      // glow
      if (l.lit) {
        const glow = ctx.createRadialGradient(l.x + 20, l.y - 90, 0, l.x + 20, l.y - 90, 30)
        glow.addColorStop(0, 'rgba(253,224,71,0.4)')
        glow.addColorStop(1, 'rgba(253,224,71,0)')
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(l.x + 20, l.y - 90, 30, 0, Math.PI * 2)
        ctx.fill()
      }
      // lamp head
      ctx.beginPath()
      ctx.arc(l.x + 20, l.y - 92, 8, 0, Math.PI * 2)
      ctx.fillStyle = l.lit ? '#fde047' : '#78716c'
      ctx.fill()
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      frame++

      // Night sky gradient
      const sky = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.8)
      sky.addColorStop(0, 'rgba(15,23,42,0.6)')
      sky.addColorStop(1, 'rgba(30,41,59,0.3)')
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, canvas.width, canvas.height * 0.8)

      // Stars
      stars.forEach(s => {
        s.twinkle += s.speed
        const alpha = 0.4 + Math.sin(s.twinkle) * 0.4
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${alpha})`
        ctx.fill()
      })

      // Moon
      ctx.beginPath()
      ctx.arc(canvas.width * 0.85, 60, 30, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(253,224,71,0.25)'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(canvas.width * 0.85, 60, 24, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(253,224,71,0.2)'
      ctx.fill()

      // Road
      ctx.fillStyle = 'rgba(51,65,85,0.5)'
      ctx.fillRect(0, canvas.height * 0.78, canvas.width, canvas.height * 0.22)
      // Road lines
      for (let rx = frame % 60 - 60; rx < canvas.width; rx += 60) {
        ctx.fillStyle = 'rgba(253,224,71,0.25)'
        ctx.fillRect(rx, canvas.height * 0.83, 30, 5)
      }

      // Buildings
      buildings.forEach(b => drawBuilding(b, frame))

      // Lamps
      lamps.forEach(l => drawLamp(l, frame))

      // Tram
      tram.x += tram.speed
      if (tram.x > canvas.width + 200) tram.x = -200
      drawTram(tram.x, tram.y)

      // Cobblestone hint
      for (let cx = 0; cx < canvas.width; cx += 24) {
        for (let cy = canvas.height * 0.79; cy < canvas.height; cy += 14) {
          ctx.strokeStyle = 'rgba(148,163,184,0.1)'
          ctx.lineWidth = 0.5
          ctx.strokeRect(cx + (Math.floor(cy / 14) % 2 === 0 ? 0 : 12), cy, 22, 12)
        }
      }

      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animId)
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ opacity: 0.9 }} />
}

// ===== FOOD BACKGROUND =====
function FoodBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    type FoodItem = {
      x: number; y: number; vy: number; vx: number;
      rot: number; rotSpeed: number; size: number
      type: 'donut' | 'pizza' | 'icecream' | 'strawberry' | 'star' | 'cake'
      color: string; color2: string
    }

    const items: FoodItem[] = Array.from({ length: 18 }, () => {
      const types: FoodItem['type'][] = ['donut', 'pizza', 'icecream', 'strawberry', 'star', 'cake']
      const colors = [
        ['#f472b6', '#fde68a'], ['#fb923c', '#fcd34d'],
        ['#a78bfa', '#f9a8d4'], ['#f87171', '#fde68a'],
        ['#34d399', '#a78bfa'], ['#fbbf24', '#ff6b9d'],
      ]
      const ci = Math.floor(Math.random() * colors.length)
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.2 - Math.random() * 0.4,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        size: 22 + Math.random() * 28,
        type: types[Math.floor(Math.random() * types.length)],
        color: colors[ci][0],
        color2: colors[ci][1],
      }
    })

    const drawDonut = (size: number, c: string, c2: string) => {
      ctx.beginPath()
      ctx.arc(0, 0, size, 0, Math.PI * 2)
      ctx.fillStyle = c
      ctx.fill()
      // icing
      ctx.beginPath()
      ctx.arc(0, 0, size * 0.75, 0, Math.PI * 2)
      ctx.fillStyle = c2
      ctx.fill()
      // hole
      ctx.beginPath()
      ctx.arc(0, 0, size * 0.35, 0, Math.PI * 2)
      ctx.fillStyle = 'transparent'
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fill()
      ctx.globalCompositeOperation = 'source-over'
      // sprinkles
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2
        ctx.save()
        ctx.translate(Math.cos(a) * size * 0.55, Math.sin(a) * size * 0.55)
        ctx.rotate(a)
        ctx.fillStyle = ['#ff6b9d', '#a78bfa', '#34d399', '#fbbf24'][i % 4]
        ctx.fillRect(-4, -1.5, 8, 3)
        ctx.restore()
      }
    }

    const drawPizza = (size: number, c: string) => {
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.arc(0, 0, size, -Math.PI / 6, Math.PI / 2)
      ctx.closePath()
      ctx.fillStyle = '#fcd34d'
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.arc(0, 0, size * 0.85, -Math.PI / 6, Math.PI / 2)
      ctx.closePath()
      ctx.fillStyle = '#ef4444'
      ctx.fill()
      // toppings
      ;[[0.3, 0.3], [-0.2, 0.5], [0.5, 0.1]].forEach(([tx, ty]) => {
        ctx.beginPath()
        ctx.arc(tx * size, ty * size, size * 0.12, 0, Math.PI * 2)
        ctx.fillStyle = c
        ctx.fill()
      })
      ctx.strokeStyle = '#d97706'
      ctx.lineWidth = 1.5
      ctx.stroke()
    }

    const drawIceCream = (size: number, c: string, c2: string) => {
      // cone
      ctx.beginPath()
      ctx.moveTo(-size * 0.5, 0)
      ctx.lineTo(size * 0.5, 0)
      ctx.lineTo(0, size * 1.2)
      ctx.closePath()
      ctx.fillStyle = '#fcd34d'
      ctx.fill()
      // waffle lines
      ctx.strokeStyle = '#d97706'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(-size * 0.2, 0)
      ctx.lineTo(0, size * 0.6)
      ctx.moveTo(size * 0.2, 0)
      ctx.lineTo(0, size * 0.6)
      ctx.stroke()
      // scoop 1
      ctx.beginPath()
      ctx.arc(0, -size * 0.15, size * 0.55, 0, Math.PI * 2)
      ctx.fillStyle = c
      ctx.fill()
      // scoop 2
      ctx.beginPath()
      ctx.arc(0, -size * 0.7, size * 0.45, 0, Math.PI * 2)
      ctx.fillStyle = c2
      ctx.fill()
      // cherry
      ctx.beginPath()
      ctx.arc(0, -size * 1.1, size * 0.15, 0, Math.PI * 2)
      ctx.fillStyle = '#ef4444'
      ctx.fill()
    }

    const drawStrawberry = (size: number) => {
      ctx.beginPath()
      ctx.arc(0, 0, size * 0.7, 0, Math.PI * 2)
      ctx.fillStyle = '#ef4444'
      ctx.fill()
      // leaves
      ctx.fillStyle = '#16a34a'
      ctx.beginPath()
      ctx.ellipse(0, -size * 0.6, size * 0.2, size * 0.35, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(-size * 0.3, -size * 0.55, size * 0.15, size * 0.28, -0.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(size * 0.3, -size * 0.55, size * 0.15, size * 0.28, 0.5, 0, Math.PI * 2)
      ctx.fill()
      // seeds
      ;[[0.1, 0.1], [-0.2, -0.1], [0.2, -0.2], [-0.1, 0.3], [0.15, 0.3]].forEach(([sx, sy]) => {
        ctx.beginPath()
        ctx.ellipse(sx * size, sy * size, 2, 3, 0.3, 0, Math.PI * 2)
        ctx.fillStyle = '#fde68a'
        ctx.fill()
      })
    }

    const drawStar = (size: number, c: string) => {
      ctx.beginPath()
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2
        const b = a + Math.PI / 5
        ctx.lineTo(Math.cos(a) * size, Math.sin(a) * size)
        ctx.lineTo(Math.cos(b) * size * 0.4, Math.sin(b) * size * 0.4)
      }
      ctx.closePath()
      ctx.fillStyle = c
      ctx.fill()
    }

    const drawMiniCake = (size: number, c: string, c2: string) => {
      ctx.fillStyle = c
      ctx.beginPath()
      ctx.roundRect(-size, -size * 0.3, size * 2, size * 0.9, 4)
      ctx.fill()
      ctx.fillStyle = c2
      ctx.beginPath()
      ctx.roundRect(-size * 0.7, -size * 0.8, size * 1.4, size * 0.55, 3)
      ctx.fill()
      // frosting drips
      ctx.fillStyle = 'white'
      ctx.fillRect(-size, -size * 0.3, size * 2, size * 0.15)
      // candle
      ctx.fillStyle = '#f472b6'
      ctx.fillRect(-size * 0.1, -size * 1.1, size * 0.2, size * 0.35)
      ctx.beginPath()
      ctx.arc(0, -size * 1.15, size * 0.13, 0, Math.PI * 2)
      ctx.fillStyle = '#fbbf24'
      ctx.fill()
    }

    let frame = 0
    let animId: number

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      frame++

      // Warm gradient bg
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      grad.addColorStop(0, 'rgba(255,107,157,0.08)')
      grad.addColorStop(0.5, 'rgba(251,191,36,0.06)')
      grad.addColorStop(1, 'rgba(167,139,250,0.08)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Food items
      items.forEach(item => {
        item.x += item.vx
        item.y += item.vy
        item.rot += item.rotSpeed
        if (item.y < -item.size * 2) item.y = canvas.height + item.size
        if (item.x < -item.size * 2) item.x = canvas.width + item.size
        if (item.x > canvas.width + item.size * 2) item.x = -item.size

        ctx.save()
        ctx.translate(item.x, item.y)
        ctx.rotate(item.rot)
        ctx.globalAlpha = 0.75

        switch (item.type) {
          case 'donut':      drawDonut(item.size, item.color, item.color2); break
          case 'pizza':      drawPizza(item.size, item.color); break
          case 'icecream':   drawIceCream(item.size, item.color, item.color2); break
          case 'strawberry': drawStrawberry(item.size); break
          case 'star':       drawStar(item.size, item.color); break
          case 'cake':       drawMiniCake(item.size, item.color, item.color2); break
        }

        ctx.restore()
      })

      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animId)
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ opacity: 0.85 }} />
}

// ===== CELEBRATION BACKGROUND =====
function CelebrationBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 1.2,
      vy: -0.5 - Math.random() * 1,
      size: 4 + Math.random() * 8,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.1,
      color: ['#ff6b9d', '#a78bfa', '#fbbf24', '#34d399', '#f87171', '#22d3ee'][Math.floor(Math.random() * 6)],
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    }))

    let animId: number
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        p.rot += p.rotSpeed
        if (p.y < -20) { p.y = canvas.height + 20; p.x = Math.random() * canvas.width }
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.globalAlpha = 0.7
        ctx.fillStyle = p.color
        if (p.shape === 'rect') ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        else { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill() }
        ctx.restore()
      })
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animId)
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}

// ===== MAIN COMPONENT =====
export default function MainFlow({ onComplete }: MainFlowProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgCakeRef = useRef<SVGSVGElement>(null)
  const animatedRef = useRef<Set<number>>(new Set())

  const [currentStep, setCurrentStep] = useState(-1)
  const [textKey, setTextKey] = useState(0)
  const [showBlowBtn, setShowBlowBtn] = useState(false)
  const [blowMode, setBlowMode] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const audioUnlockedRef = useRef(false)
  const audioDoneRef = useRef(false)
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [audioDone, setAudioDone] = useState(false)
  const [activeTheme, setActiveTheme] = useState<string>('none')

  const [clicks, setClicks] = useState(0)
  const [deadCandles, setDeadCandles] = useState<number[]>([])
  const [done, setDone] = useState(false)
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])
  const prevDeadCount = useRef(0)
  const completedRef = useRef(false)
  const rippleId = useRef(0)
  const isBlowActive = useRef(false)

  // Unlock audio on first user gesture (pointerdown/touchstart = most reliable cross-browser)
  useEffect(() => {
    const unlock = () => {
      if (audioUnlockedRef.current || !audioRef.current) return
      audioRef.current.play().then(() => {
        audioRef.current!.pause()
        audioRef.current!.currentTime = 0
        audioUnlockedRef.current = true
      }).catch(() => {})
    }
    window.addEventListener('pointerdown', unlock)
    window.addEventListener('touchstart', unlock, { passive: true })
    window.addEventListener('keydown', unlock)
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('touchstart', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [])

  const progress = Math.min(clicks / TOTAL_CLICKS, 1)
  const targetDead = Math.floor(progress * CANDLE_COUNT)

  const revealLayer = useCallback((index: number) => {
    if (!svgCakeRef.current) return
    if (animatedRef.current.has(index)) return
    animatedRef.current.add(index)
    const el = svgCakeRef.current.getElementById(layerIds[index])
    if (!el) return
    gsap.fromTo(el,
      { attr: { transform: 'translate(0,-40)' }, opacity: 0 },
      { attr: { transform: 'translate(0,0)' }, opacity: 1, duration: 0.55, ease: 'bounce.out' }
    )
  }, [])

  const hideLayer = useCallback((index: number) => {
    if (!svgCakeRef.current) return
    animatedRef.current.delete(index)
    const el = svgCakeRef.current.getElementById(layerIds[index])
    if (!el) return
    gsap.set(el, { attr: { transform: 'translate(0,-40)' }, opacity: 0 })
  }, [])

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
            setActiveTheme(layerThemes[i])
            for (let j = 0; j <= i; j++) revealLayer(j)
            if (i === steps.length - 1) {
              setTimeout(() => {
                if (audioRef.current && !audioDoneRef.current) {
                  audioRef.current.currentTime = 0
                  audioRef.current.play().then(() => {
                    setAudioPlaying(true)
                  }).catch(() => {
                    audioDoneRef.current = true
                    setAudioDone(true)
                    setShowBlowBtn(true)
                  })
                } else {
                  setShowBlowBtn(true)
                }
              }, 700)
            }
          },
          onEnterBack: () => {
            if (isBlowActive.current) return
            setCurrentStep(i)
            setTextKey(k => k + 1)
            setActiveTheme(layerThemes[i])
            setShowBlowBtn(false)
            for (let j = i + 1; j < steps.length; j++) hideLayer(j)
          },
        })
      })
    }, containerRef)

    return () => ctx.revert()
  }, [revealLayer, hideLayer])

  useEffect(() => {
    if (targetDead > prevDeadCount.current) {
      setDeadCandles([...Array(targetDead)].map((_, i) => i))
      prevDeadCount.current = targetDead
    }
  }, [targetDead])

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

  const handleStartBlow = () => { setBlowMode(true); isBlowActive.current = true }

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
      <audio
        ref={audioRef}
        src="/bgm.mp3"
        preload="auto"
        onEnded={() => {
          audioDoneRef.current = true
          setAudioDone(true)
          setShowBlowBtn(true)
        }}
      />
      <div
        className={`sticky top-0 h-screen flex flex-col items-center justify-center bg-gradient-to-b ${step.bg} transition-all duration-700 z-10 overflow-hidden ${blowMode ? 'pointer-events-auto' : 'pointer-events-none'}`}
        onPointerDown={handleTap}
      >
        {/* ===== THEMED BACKGROUND ===== */}
        <div className="absolute inset-0 z-0 transition-opacity duration-700" style={{ opacity: activeTheme === 'aquarium' ? 1 : 0 }}>
          {activeTheme === 'aquarium' && <AquariumBg />}
        </div>
        <div className="absolute inset-0 z-0 transition-opacity duration-700" style={{ opacity: activeTheme === 'zoo' ? 1 : 0 }}>
          {activeTheme === 'zoo' && <ZooBg />}
        </div>
        <div className="absolute inset-0 z-0 transition-opacity duration-700" style={{ opacity: activeTheme === 'oldcity' ? 1 : 0 }}>
          {activeTheme === 'oldcity' && <OldCityBg />}
        </div>
        <div className="absolute inset-0 z-0 transition-opacity duration-700" style={{ opacity: activeTheme === 'food' ? 1 : 0 }}>
          {activeTheme === 'food' && <FoodBg />}
        </div>
        <div className="absolute inset-0 z-0 transition-opacity duration-700" style={{ opacity: activeTheme === 'celebration' ? 1 : 0 }}>
          {activeTheme === 'celebration' && <CelebrationBg />}
        </div>

        {/* Stars for non-themed steps */}
        {activeTheme === 'none' && (
          <div className="absolute inset-0 pointer-events-none z-0">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="absolute rounded-full bg-white"
                style={{
                  width: Math.random() * 2.5 + 1, height: Math.random() * 2.5 + 1,
                  top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.4 + 0.1,
                }} />
            ))}
          </div>
        )}

        {/* Theme label badge */}
        {activeTheme !== 'none' && activeTheme !== 'celebration' && !blowMode && (
          <div className="absolute top-4 right-4 z-20 pointer-events-none"
            style={{ animation: 'fadeIn 0.5s ease forwards' }}>
            <div className="px-3 py-1 rounded-full text-xs font-bold text-white backdrop-blur-sm"
              style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.2)' }}>
              {{
                aquarium: '🐠 Aquarium',
                zoo: '🦁 Zoo',
                oldcity: '🏙️ Old City',
                food: '🍩 Food',
              }[activeTheme]}
            </div>
          </div>
        )}

        {/* Message */}
        {!blowMode && (
          <div key={textKey} className="text-center px-8 mb-6 z-10 animate-fade-in pointer-events-none"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>
            <p className="text-white text-2xl font-bold drop-shadow-lg">{step.text}</p>
            <p className="text-pink-200 text-sm mt-2 drop-shadow">{step.sub}</p>
          </div>
        )}

        {blowMode && (
          <div className="text-center px-8 mb-4 z-10 pointer-events-none" style={{ animation: 'fadeIn 0.6s ease forwards' }}>
            <p className="text-white text-2xl font-bold drop-shadow-lg">Tiup lilinnya! 🕯️</p>
            <p className="text-pink-300 text-sm mt-1">{done ? 'Selamat! 🎉' : 'Tap di mana saja secepat mungkin!'}</p>
          </div>
        )}

        {/* ===== CAKE SVG ===== */}
        <svg ref={svgCakeRef} viewBox="0 0 320 420" className="w-72 z-10 pointer-events-none" style={{ overflow: 'visible', filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.5))' }}>
          <defs>
            <style>{`
              @keyframes flicker1{0%,100%{transform:scaleX(1) scaleY(1) translateY(0px);opacity:.95}25%{transform:scaleX(.85) scaleY(1.1) translateY(-2px);opacity:1}50%{transform:scaleX(1.1) scaleY(.95) translateY(1px);opacity:.9}75%{transform:scaleX(.9) scaleY(1.08) translateY(-1px);opacity:1}}
              @keyframes flicker2{0%,100%{transform:scaleX(1.05) scaleY(1) translateY(0px);opacity:.92}30%{transform:scaleX(.9) scaleY(1.12) translateY(-3px);opacity:1}60%{transform:scaleX(1.08) scaleY(.92) translateY(2px);opacity:.88}80%{transform:scaleX(.88) scaleY(1.06) translateY(-1px);opacity:.95}}
              @keyframes flicker3{0%,100%{transform:scaleX(.95) scaleY(1.02) translateY(0px);opacity:.93}20%{transform:scaleX(1.08) scaleY(.9) translateY(2px);opacity:.88}55%{transform:scaleX(.88) scaleY(1.1) translateY(-2px);opacity:1}85%{transform:scaleX(1.05) scaleY(.95) translateY(1px);opacity:.9}}
              @keyframes glowPulse{0%,100%{opacity:.3}50%{opacity:.6}}
              @keyframes smokeRise{0%{transform:translateY(0px) scaleX(1);opacity:.6}100%{transform:translateY(-20px) scaleX(1.5);opacity:0}}
              @keyframes fadeIn{from{opacity:0}to{opacity:1}}
              @keyframes rippleOut{0%{transform:scale(.5);opacity:.8}100%{transform:scale(2.5);opacity:0}}
              .flame1{animation:flicker1 .9s ease-in-out infinite;transform-origin:center bottom;transform-box:fill-box}
              .flame2{animation:flicker2 .75s ease-in-out infinite;transform-origin:center bottom;transform-box:fill-box}
              .flame3{animation:flicker3 1.1s ease-in-out infinite;transform-origin:center bottom;transform-box:fill-box}
              .glow1{animation:glowPulse .9s ease-in-out infinite}
              .glow2{animation:glowPulse .75s ease-in-out infinite}
              .glow3{animation:glowPulse 1.1s ease-in-out infinite}
              .smoke{animation:smokeRise 1.2s ease-out infinite;transform-origin:center bottom;transform-box:fill-box}
            `}</style>
            <linearGradient id="frostingGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" /><stop offset="100%" stopColor="#ffe0ee" />
            </linearGradient>
          </defs>

          {/* PLATE */}
          <g id="g-plate">
            <ellipse cx="160" cy="400" rx="148" ry="13" fill="#8B4513" stroke="#5C2D0A" strokeWidth="2" />
            <ellipse cx="160" cy="395" rx="148" ry="13" fill="#D4A96A" stroke="#8B6340" strokeWidth="2" />
            <ellipse cx="160" cy="391" rx="144" ry="10" fill="#EEC98A" />
            <ellipse cx="115" cy="388" rx="28" ry="4" fill="white" opacity="0.2" />
          </g>

          {/* BASE — Aquarium theme decoration */}
          <g id="g-base">
            <rect x="18" y="295" width="284" height="98" rx="10" fill="#FF6B9D" stroke="#C94070" strokeWidth="3" />
            {/* Aquarium mini fish decorations on base */}
            <text x="35"  y="355" fontSize="18" opacity="0.7">🐠</text>
            <text x="85"  y="340" fontSize="14" opacity="0.6">🐟</text>
            <text x="185" y="355" fontSize="16" opacity="0.7">🐡</text>
            <text x="245" y="340" fontSize="14" opacity="0.6">🦀</text>
            <path d="M18 295 Q36 278 54 295 Q72 312 90 295 Q108 278 126 295 Q144 312 162 295 Q180 278 198 295 Q216 312 234 295 Q252 278 270 295 Q288 312 302 300 L302 308 Q288 296 270 308 Q252 325 234 308 Q216 291 198 308 Q180 325 162 308 Q144 291 126 308 Q108 325 90 308 Q72 291 54 308 Q36 325 18 308 Z" fill="url(#frostingGrad)" />
            <rect x="18" y="295" width="284" height="98" rx="10" fill="none" stroke="#C94070" strokeWidth="3" />
          </g>

          {/* MIDDLE — Zoo theme decoration */}
          <g id="g-middle">
            <rect x="48" y="210" width="224" height="88" rx="10" fill="#FF9EBB" stroke="#C94070" strokeWidth="3" />
            <text x="60"  y="268" fontSize="16" opacity="0.7">🦁</text>
            <text x="108" y="258" fontSize="14" opacity="0.6">🐼</text>
            <text x="168" y="268" fontSize="16" opacity="0.7">🦒</text>
            <text x="222" y="258" fontSize="14" opacity="0.6">🐘</text>
            <path d="M48 210 Q64 195 80 210 Q96 225 112 210 Q128 195 144 210 Q160 225 176 210 Q192 195 208 210 Q224 225 240 210 Q256 195 272 210 Q272 210 272 218 Q256 203 240 218 Q224 233 208 218 Q192 203 176 218 Q160 233 144 218 Q128 203 112 218 Q96 233 80 218 Q64 203 48 218 Z" fill="url(#frostingGrad)" />
            <rect x="48" y="210" width="224" height="88" rx="10" fill="none" stroke="#C94070" strokeWidth="3" />
          </g>

          {/* TOP — Old City theme decoration */}
          <g id="g-top">
            <rect x="82" y="138" width="156" height="75" rx="10" fill="#FFCDE0" stroke="#C94070" strokeWidth="3" />
            <text x="92"  y="195" fontSize="13" opacity="0.7">🏛️</text>
            <text x="130" y="188" fontSize="12" opacity="0.6">🚋</text>
            <text x="178" y="195" fontSize="13" opacity="0.7">🏙️</text>
            <path d="M82 138 Q96 125 110 138 Q124 151 138 138 Q152 125 166 138 Q180 151 194 138 Q208 125 222 138 Q236 151 238 140 L238 148 Q224 135 210 148 Q196 161 182 148 Q168 135 154 148 Q140 161 126 148 Q112 135 98 148 Q84 161 82 150 Z" fill="url(#frostingGrad)" />
            <rect x="82" y="138" width="156" height="75" rx="10" fill="none" stroke="#C94070" strokeWidth="3" />
          </g>

          {/* FROSTING — Food theme decoration */}
          <g id="g-frosting">
            <path d="M88 138 Q100 108 116 122 Q128 100 144 118 Q156 96 172 118 Q188 100 204 122 Q218 108 232 138 Z" fill="white" stroke="#f0d0e0" strokeWidth="1.5" />
            <circle cx="110" cy="125" r="4" fill="#FF6B9D" />
            <circle cx="130" cy="113" r="3.5" fill="#A78BFA" />
            <circle cx="152" cy="108" r="4" fill="#FBBF24" />
            <circle cx="172" cy="112" r="3.5" fill="#34D399" />
            <circle cx="193" cy="120" r="4" fill="#F87171" />
            <circle cx="212" cy="128" r="3.5" fill="#FB923C" />
            {/* Food emoji decorations */}
            <text x="100" y="132" fontSize="10" opacity="0.8">🍓</text>
            <text x="148" y="124" fontSize="10" opacity="0.8">🍩</text>
            <text x="196" y="130" fontSize="10" opacity="0.8">🍰</text>
          </g>

          {/* CANDLES */}
          <g id="g-candles">
            {/* Lilin 1 */}
            {!isFlameVisible(0) ? <>
              <ellipse cx="118" cy="92" rx="4" ry="2" fill="#aaa" className="smoke" />
              <ellipse cx="118" cy="88" rx="3" ry="2" fill="#bbb" style={{ animation: 'smokeRise 1.4s ease-out 0.3s infinite' }} />
            </> : <>
              <circle cx="118" cy="80" r="12" fill="#ff88ff" opacity="0.25" className="glow1" />
              <path className="flame1" d="M118 95 Q106 82 109 68 Q111 56 118 50 Q125 56 127 68 Q130 82 118 95Z" fill="#cc44ff" />
              <path className="flame1" d="M118 93 Q109 82 111 70 Q113 60 118 55 Q123 60 125 70 Q127 82 118 93Z" fill="#ff88ff" />
              <path className="flame1" d="M118 90 Q113 82 114 72 Q116 65 118 62 Q120 65 122 72 Q123 82 118 90Z" fill="#ffccff" />
              <path className="flame1" d="M118 88 Q115 82 116 75 Q117 70 118 68 Q119 70 120 75 Q121 82 118 88Z" fill="white" opacity="0.85" />
            </>}
            <line x1="118" y1="95" x2="118" y2="103" stroke="#555" strokeWidth="2" strokeLinecap="round" />
            <rect x="108" y="103" width="20" height="62" rx="4" fill="#FF7EB3" stroke="#C94070" strokeWidth="2" />
            <rect x="108" y="115" width="20" height="5" fill="#FFB8D0" opacity="0.7" />
            <rect x="108" y="130" width="20" height="5" fill="#FFB8D0" opacity="0.7" />
            <rect x="108" y="145" width="20" height="5" fill="#FFB8D0" opacity="0.7" />
            <rect x="112" y="105" width="5" height="18" rx="2.5" fill="white" opacity="0.3" />
            <ellipse cx="118" cy="165" rx="10" ry="4" fill="#C94070" />

            {/* Lilin 2 */}
            {!isFlameVisible(1) ? <>
              <ellipse cx="160" cy="82" rx="4" ry="2" fill="#aaa" className="smoke" />
              <ellipse cx="160" cy="78" rx="3" ry="2" fill="#bbb" style={{ animation: 'smokeRise 1.4s ease-out 0.3s infinite' }} />
            </> : <>
              <circle cx="160" cy="70" r="12" fill="#ffaaff" opacity="0.25" className="glow2" />
              <path className="flame2" d="M160 86 Q148 73 151 59 Q153 47 160 41 Q167 47 169 59 Q172 73 160 86Z" fill="#9933ff" />
              <path className="flame2" d="M160 84 Q151 73 153 61 Q155 51 160 46 Q165 51 167 61 Q169 73 160 84Z" fill="#ffaaff" />
              <path className="flame2" d="M160 81 Q154 73 155 63 Q157 56 160 53 Q163 56 165 63 Q166 73 160 81Z" fill="#ffddff" />
              <path className="flame2" d="M160 79 Q157 73 158 66 Q159 61 160 59 Q161 61 162 66 Q163 73 160 79Z" fill="white" opacity="0.85" />
            </>}
            <line x1="160" y1="86" x2="160" y2="94" stroke="#555" strokeWidth="2" strokeLinecap="round" />
            <rect x="150" y="94" width="20" height="68" rx="4" fill="#A78BFA" stroke="#7C3AED" strokeWidth="2" />
            <rect x="150" y="106" width="20" height="5" fill="#C4B5FD" opacity="0.7" />
            <rect x="150" y="121" width="20" height="5" fill="#C4B5FD" opacity="0.7" />
            <rect x="150" y="136" width="20" height="5" fill="#C4B5FD" opacity="0.7" />
            <rect x="154" y="96" width="5" height="20" rx="2.5" fill="white" opacity="0.3" />
            <ellipse cx="160" cy="162" rx="10" ry="4" fill="#7C3AED" />

            {/* Lilin 3 */}
            {!isFlameVisible(2) ? <>
              <ellipse cx="202" cy="92" rx="4" ry="2" fill="#aaa" className="smoke" />
              <ellipse cx="202" cy="88" rx="3" ry="2" fill="#bbb" style={{ animation: 'smokeRise 1.4s ease-out 0.3s infinite' }} />
            </> : <>
              <circle cx="202" cy="80" r="12" fill="#ff88ff" opacity="0.25" className="glow3" />
              <path className="flame3" d="M202 95 Q190 82 193 68 Q195 56 202 50 Q209 56 211 68 Q214 82 202 95Z" fill="#cc44ff" />
              <path className="flame3" d="M202 93 Q193 82 195 70 Q197 60 202 55 Q207 60 209 70 Q211 82 202 93Z" fill="#ff88ff" />
              <path className="flame3" d="M202 90 Q197 82 198 72 Q200 65 202 62 Q204 65 206 72 Q207 82 202 90Z" fill="#ffccff" />
              <path className="flame3" d="M202 88 Q199 82 200 75 Q201 70 202 68 Q203 70 204 75 Q205 82 202 88Z" fill="white" opacity="0.85" />
            </>}
            <line x1="202" y1="95" x2="202" y2="103" stroke="#555" strokeWidth="2" strokeLinecap="round" />
            <rect x="192" y="103" width="20" height="62" rx="4" fill="#34D399" stroke="#059669" strokeWidth="2" />
            <rect x="192" y="115" width="20" height="5" fill="#6EE7B7" opacity="0.7" />
            <rect x="192" y="130" width="20" height="5" fill="#6EE7B7" opacity="0.7" />
            <rect x="192" y="145" width="20" height="5" fill="#6EE7B7" opacity="0.7" />
            <rect x="196" y="105" width="5" height="18" rx="2.5" fill="white" opacity="0.3" />
            <ellipse cx="202" cy="165" rx="10" ry="4" fill="#059669" />
          </g>
        </svg>

        {/* Tombol Tiup */}
        {showBlowBtn && !blowMode && (
          <button onClick={handleStartBlow}
            className="pointer-events-auto mt-6 z-20 px-8 py-3 rounded-2xl text-white font-bold text-lg shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #ff6b9d, #a78bfa)', boxShadow: '0 0 30px #ff6b9d88', animation: 'fadeIn 0.8s ease forwards' }}>
            💨 Tiup Sekarang!
          </button>
        )}

        {/* Blow overlay */}
        {blowMode && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 select-none"
            style={{ animation: 'fadeIn 0.6s ease forwards', background: 'rgba(10,0,20,0.5)' }}>
            {ripples.map(rp => (
              <span key={rp.id} className="absolute rounded-full pointer-events-none"
                style={{ left: rp.x - 30, top: rp.y - 30, width: 60, height: 60, background: 'radial-gradient(circle, #ff88ff55, transparent)', animation: 'rippleOut 0.5s ease-out forwards' }} />
            ))}
            <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center px-8 pointer-events-none"
              style={{ animation: 'fadeIn 0.6s ease forwards' }}>
              {!done ? <>
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
                      style={{ width: `${progress * 100}%`, background: 'linear-gradient(90deg, #a78bfa, #ff6b9d)' }} />
                  </div>
                </div>
              </> : (
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