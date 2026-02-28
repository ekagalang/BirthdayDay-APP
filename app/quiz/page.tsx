'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const FishViewer = dynamic(() => import('@/components/FishViewer'), { ssr: false })

interface Question {
  id: string
  question: string
  modelPath: string
  options: string[]
  correctAnswer: string
}

type AppStage = 'intro' | 'countdown' | 'quiz' | 'result'

const introSteps = [
  {
    emoji: '📺',
    title: 'SELAMAT!',
    sub: 'Kamu terpilih sebagai peserta spesial',
    detail: 'dari jutaan orang di seluruh dunia...',
    bg: 'from-yellow-900 to-amber-950',
    accent: '#fbbf24',
  },
  {
    emoji: '🎙️',
    title: 'KUIS IKAN LAUT',
    sub: 'Edisi Eksklusif & Super Spesial',
    detail: 'Hanya untuk orang-orang terpilih saja!',
    bg: 'from-blue-950 to-cyan-900',
    accent: '#22d3ee',
  },
  {
    emoji: '🏆',
    title: 'HADIAHNYA?',
    sub: 'Rahasia... tapi dijamin bikin',
    detail: 'hati berbunga-bunga 🌸',
    bg: 'from-pink-950 to-rose-900',
    accent: '#fb7185',
  },
  {
    emoji: '📋',
    title: 'PERATURAN',
    sub: 'Jawab semua soal dengan jujur',
    detail: 'Tidak ada yang mengawasimu... atau ada? 👀',
    bg: 'from-purple-950 to-violet-900',
    accent: '#a78bfa',
  },
  {
    emoji: '🐟',
    title: 'SIAP MULAI?',
    sub: 'Tebak nama ikan dari gambar 3D-nya',
    detail: 'Scroll untuk mulai kuis!',
    bg: 'from-teal-950 to-emerald-900',
    accent: '#34d399',
  },
]

export default function QuizPage() {
  const router = useRouter()
  const [stage, setStage] = useState<AppStage>('intro')
  const [questions, setQuestions] = useState<Question[]>([])
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [countdown, setCountdown] = useState(3)
  const [stars, setStars] = useState<{ width: number; height: number; top: string; left: string; opacity: number }[]>([])

  useEffect(() => {
    setStars(
      [...Array(16)].map(() => ({
        width: Math.random() * 2.5 + 1,
        height: Math.random() * 2.5 + 1,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        opacity: Math.random() * 0.5 + 0.1,
      }))
    )
  }, [])

  // Intro scroll state
  const introRef = useRef<HTMLDivElement>(null)
  const [currentIntroStep, setCurrentIntroStep] = useState(0)
  const [introTextKey, setIntroTextKey] = useState(0)

  // Quiz scroll state
  const quizRef = useRef<HTMLDivElement>(null)
  const [currentQ, setCurrentQ] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({})
  const [lockedQ, setLockedQ] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetch('/api/admin/questions')
      .then(r => r.json())
      .then(data => {
        setQuestions(data)
        setLoading(false)
      })
  }, [])

  // Intro scroll triggers
  useEffect(() => {
    if (stage !== 'intro') return
    const ctx = gsap.context(() => {
      introSteps.forEach((_, i) => {
        ScrollTrigger.create({
          trigger: `#intro-step-${i}`,
          start: 'top center',
          onEnter: () => { setCurrentIntroStep(i); setIntroTextKey(k => k + 1) },
          onEnterBack: () => { setCurrentIntroStep(i); setIntroTextKey(k => k + 1) },
        })
      })
      ScrollTrigger.create({
        trigger: '#intro-end',
        start: 'top bottom',
        onEnter: () => startCountdown(),
      })
    }, introRef)
    return () => ctx.revert()
  }, [stage])

  // Quiz scroll triggers
  useEffect(() => {
    if (stage !== 'quiz' || questions.length === 0) return
    const ctx = gsap.context(() => {
      questions.forEach((_, i) => {
        ScrollTrigger.create({
          trigger: `#quiz-step-${i}`,
          start: 'top center',
          onEnter: () => setCurrentQ(i),
          onEnterBack: () => setCurrentQ(i),
        })
      })
      ScrollTrigger.create({
        trigger: '#quiz-end',
        start: 'top center',
        onEnter: () => {
          if (Object.keys(selectedAnswers).length === questions.length) {
            finishQuiz()
          }
        },
      })
    }, quizRef)
    return () => ctx.revert()
  }, [stage, questions])

  const startCountdown = () => {
    setStage('countdown')
    let c = 3
    setCountdown(c)
    const interval = setInterval(() => {
      c--
      if (c <= 0) {
        clearInterval(interval)
        setTimeout(() => setStage('quiz'), 500)
      } else {
        setCountdown(c)
      }
    }, 1000)
  }

  const handleSelect = (qIndex: number, qId: string, option: string) => {
    if (lockedQ.has(qIndex)) return
    setLockedQ(prev => new Set(prev).add(qIndex))
    setSelectedAnswers(prev => ({ ...prev, [qIndex]: option }))

    const isCorrect = option === questions[qIndex].correctAnswer
    if (isCorrect) setScore(s => s + 1)
    setAnswers(prev => ({ ...prev, [qId]: option }))
  }

  const finishQuiz = () => {
    setStage('result')
  }

  const handleFinish = () => {
    sessionStorage.setItem('quizScore', String(score))
    sessionStorage.setItem('quizAnswers', JSON.stringify(answers))
    router.push('/')
  }

  const introStep = introSteps[currentIntroStep]

  // ===== INTRO STAGE =====
  if (stage === 'intro') {
    return (
      <div ref={introRef} className="relative">
        {/* Sticky intro display */}
        <div className={`sticky top-0 h-screen flex flex-col items-center justify-center bg-gradient-to-b ${introStep.bg} transition-all duration-700 z-10 overflow-hidden pointer-events-none`}>

          {/* Dekorasi spotlight */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10"
              style={{ background: `radial-gradient(circle, ${introStep.accent}, transparent)` }} />
            <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full opacity-5"
              style={{ background: `radial-gradient(circle, ${introStep.accent}, transparent)` }} />
            {/* Bintang */}
            {stars.map((s, i) => (
              <div key={i} className="absolute rounded-full bg-white"
                style={s} />
            ))}
          </div>

          {/* TV Frame decoration */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-white text-xs font-mono opacity-70">ON AIR</span>
            </div>
            <div className="text-white text-xs font-mono opacity-50">
              KUIS SPESIAL • LIVE
            </div>
            <div className="text-white text-xs font-mono opacity-70">
              {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          {/* Content */}
          <div key={introTextKey} className="text-center px-8 z-10" style={{ animation: 'introFadeIn 0.6s ease forwards' }}>
            <div className="text-7xl mb-6" style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))' }}>
              {introStep.emoji}
            </div>

            {/* Badge */}
            <div className="inline-block px-4 py-1 rounded-full text-xs font-bold mb-4 border"
              style={{ borderColor: introStep.accent, color: introStep.accent, background: `${introStep.accent}22` }}>
              ● SIARAN LANGSUNG
            </div>

            <h1 className="text-white text-4xl font-black mb-3 tracking-wide drop-shadow-lg"
              style={{ textShadow: `0 0 30px ${introStep.accent}66` }}>
              {introStep.title}
            </h1>
            <p className="text-white text-lg font-semibold mb-2 drop-shadow">
              {introStep.sub}
            </p>
            <p className="text-white text-sm opacity-70">
              {introStep.detail}
            </p>
          </div>

          {/* Progress dots */}
          <div className="absolute bottom-20 flex gap-2 z-10">
            {introSteps.map((_, i) => (
              <div key={i} className="rounded-full transition-all duration-300"
                style={{
                  width: i === currentIntroStep ? 20 : 8,
                  height: 8,
                  background: i === currentIntroStep ? introStep.accent : 'rgba(255,255,255,0.3)',
                }} />
            ))}
          </div>

          {/* Scroll hint */}
          <div className="absolute bottom-8 flex flex-col items-center gap-1 animate-bounce z-10">
            <p className="text-white text-xs tracking-widest uppercase opacity-60">scroll</p>
            <svg className="w-4 h-4 text-white opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Scroll spacers */}
        <div className="relative z-0">
          {introSteps.map((_, i) => (
            <div key={i} id={`intro-step-${i}`} className="h-screen" />
          ))}
          <div id="intro-end" className="h-32" />
        </div>

        <style jsx>{`
          @keyframes introFadeIn {
            from { opacity: 0; transform: translateY(12px) scale(0.97); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>
      </div>
    )
  }

  // ===== COUNTDOWN STAGE =====
  if (stage === 'countdown') {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center">
        <p className="text-white text-lg mb-6 opacity-70">Kuis dimulai dalam...</p>
        <div className="text-white font-black"
          style={{ fontSize: 120, lineHeight: 1, animation: 'countPop 1s ease infinite', textShadow: '0 0 60px #a78bfa' }}>
          {countdown}
        </div>
        <style jsx>{`
          @keyframes countPop {
            0%   { transform: scale(1.2); opacity: 0.5; }
            50%  { transform: scale(1);   opacity: 1; }
            100% { transform: scale(0.9); opacity: 0.7; }
          }
        `}</style>
      </div>
    )
  }

  // ===== RESULT STAGE =====
  if (stage === 'result') {
    const pct = Math.round((score / questions.length) * 100)
    const emoji = pct === 100 ? '🏆' : pct >= 60 ? '🎉' : '🐟'
    const msg = pct === 100
      ? 'Sempurna! Kamu ahli ikan!'
      : pct >= 60
      ? 'Bagus! Lumayan jago juga!'
      : 'Hehe, belajar lagi ya sayang!'

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 to-pink-950 flex flex-col items-center justify-center px-6"
        style={{ animation: 'fadeIn 0.6s ease forwards' }}>
        <div className="text-center w-full max-w-sm">
          <div className="text-7xl mb-4">{emoji}</div>
          <h2 className="text-white text-2xl font-black mb-1">Kuis Selesai!</h2>
          <p className="text-pink-300 text-sm mb-8">{msg}</p>

          {/* Score card */}
          <div className="bg-gray-900 rounded-3xl p-6 mb-6">
            <p className="text-gray-400 text-xs mb-3 uppercase tracking-widest">Skor Akhir</p>
            <div className="flex items-end justify-center gap-2 mb-4">
              <span className="text-white font-black" style={{ fontSize: 64, lineHeight: 1 }}>{score}</span>
              <span className="text-gray-400 text-2xl mb-2">/ {questions.length}</span>
            </div>
            {/* Progress bar skor */}
            <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
              <div className="h-3 rounded-full transition-all duration-1000"
                style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #a78bfa, #ff6b9d)' }} />
            </div>
            <p className="text-gray-400 text-xs mt-2">{pct}% benar</p>
          </div>

          {/* Review jawaban */}
          <div className="space-y-2 mb-8 text-left">
            {questions.map((q, i) => {
              const userAnswer = selectedAnswers[i]
              const isCorrect = userAnswer === q.correctAnswer
              return (
                <div key={q.id} className="bg-gray-900 rounded-2xl px-4 py-3">
                  <p className="text-gray-400 text-xs mb-1">Soal {i + 1}</p>
                  <p className="text-white text-sm mb-2">{q.question}</p>
                  <div className="flex gap-2 items-center">
                    <span className={`text-xs px-2 py-0.5 rounded-lg ${isCorrect ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                      {isCorrect ? '✓ Benar' : '✗ Salah'}
                    </span>
                    {!isCorrect && (
                      <span className="text-xs text-gray-400">
                        Jawaban: <span className="text-green-400">{q.correctAnswer}</span>
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <button
            onClick={handleFinish}
            className="w-full py-4 rounded-2xl text-white font-bold text-lg transition-transform active:scale-95"
            style={{ background: 'linear-gradient(135deg, #ff6b9d, #a78bfa)', boxShadow: '0 0 30px #ff6b9d66' }}
          >
            Lanjut ke Kejutan 🎂
          </button>
        </div>

        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(16px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    )
  }

  // ===== QUIZ STAGE =====
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-white">Memuat soal...</p>
      </div>
    )
  }

  const q = questions[currentQ]
  const selectedForCurrent = selectedAnswers[currentQ]
  const isLocked = lockedQ.has(currentQ)
  const allAnswered = Object.keys(selectedAnswers).length === questions.length

  return (
    <div ref={quizRef} className="relative">
      {/* Sticky quiz display */}
      <div className="sticky top-0 h-screen flex flex-col bg-gray-950 z-10 overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-6 pb-3 pointer-events-none">
          <div className="flex justify-between items-center mb-2">
            <p className="text-gray-400 text-xs">
              Soal <span className="text-white font-bold">{currentQ + 1}</span> / {questions.length}
            </p>
            <p className="text-gray-400 text-xs">
              ✓ <span className="text-green-400 font-bold">{score}</span> benar
            </p>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-pink-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
          </div>
        </div>

        {/* 3D Fish Model */}
        <div className="mx-6 rounded-2xl overflow-hidden flex-1" style={{ maxHeight: '40vh', minHeight: '180px' }}>
          <Suspense fallback={
            <div className="w-full h-full bg-gray-900 flex items-center justify-center">
              <p className="text-gray-500 text-sm">Loading ikan...</p>
            </div>
          }>
            {q && <FishViewer key={q.id} modelPath={q.modelPath} />}
          </Suspense>
        </div>

        {/* Question & Options */}
        <div className="px-6 py-4 space-y-3">
          {q && (
            <>
              <h2 className="text-white text-lg font-bold text-center">{q.question}</h2>
              <div className="grid grid-cols-2 gap-2">
                {q.options.map((opt) => {
                  let cls = 'bg-gray-900 text-white border border-gray-800'
                  if (isLocked) {
                    if (opt === q.correctAnswer) cls = 'bg-green-700 text-white border border-green-500'
                    else if (opt === selectedForCurrent) cls = 'bg-red-700 text-white border border-red-500'
                    else cls = 'bg-gray-900 text-gray-600 border border-gray-800'
                  }
                  return (
                    <button
                      key={opt}
                      onClick={() => handleSelect(currentQ, q.id, opt)}
                      disabled={isLocked}
                      className={`${cls} rounded-2xl px-3 py-3 text-sm font-medium text-left transition-all active:scale-95`}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>

              {/* Feedback setelah jawab */}
              {isLocked && (
                <p className="text-center text-sm animate-fade-in"
                  style={{ color: selectedForCurrent === q.correctAnswer ? '#4ade80' : '#f87171' }}>
                  {selectedForCurrent === q.correctAnswer
                    ? '✓ Benar! Scroll untuk soal berikutnya →'
                    : `✗ Jawaban: ${q.correctAnswer} • Scroll lanjut →`}
                </p>
              )}

              {/* Tombol selesai di soal terakhir */}
              {isLocked && currentQ === questions.length - 1 && allAnswered && (
                <button
                  onClick={finishQuiz}
                  className="w-full py-3 rounded-2xl text-white font-bold transition-transform active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #ff6b9d, #a78bfa)' }}
                >
                  Lihat Hasil 🏆
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Scroll spacers */}
      <div className="relative z-0">
        {questions.map((_, i) => (
          <div key={i} id={`quiz-step-${i}`} className="h-screen" />
        ))}
        <div id="quiz-end" className="h-32" />
      </div>
    </div>
  )
}