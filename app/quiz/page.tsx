'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const FishViewer = dynamic(() => import('@/components/FishViewer'), { ssr: false })

interface Question {
  id: string
  question: string
  modelPath: string
  options: string[]
  correctAnswer: string
}

export default function QuizPage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResult, setShowResult] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/questions')
      .then(r => r.json())
      .then(data => {
        setQuestions(data)
        setLoading(false)
      })
  }, [])

  const handleSelect = (option: string) => {
    if (selected) return
    setSelected(option)

    const q = questions[current]
    const isCorrect = option === q.correctAnswer
    if (isCorrect) setScore(s => s + 1)
    setAnswers(prev => ({ ...prev, [q.id]: option }))
  }

  const handleNext = () => {
    if (current + 1 < questions.length) {
      setCurrent(c => c + 1)
      setSelected(null)
    } else {
      setShowResult(true)
    }
  }

  const handleFinish = () => {
    sessionStorage.setItem('quizScore', String(score))
    sessionStorage.setItem('quizAnswers', JSON.stringify(answers))
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    )
  }

  if (showResult) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <p className="text-6xl mb-4">🎉</p>
          <h2 className="text-2xl font-bold mb-2">Selesai!</h2>
          <p className="text-gray-400 mb-6">
            Kamu menjawab benar {score} dari {questions.length} soal
          </p>
          <button
            onClick={handleFinish}
            className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-2xl font-medium transition"
          >
            Lanjut →
          </button>
        </div>
      </div>
    )
  }

  const q = questions[current]
  console.log('Rendering question:', q.id, 'with model:', q.modelPath)

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <p className="text-xs text-gray-500 mb-1">Soal {current + 1} / {questions.length}</p>
        <div className="w-full bg-gray-800 rounded-full h-1.5">
          <div
            className="bg-pink-500 h-1.5 rounded-full transition-all"
            style={{ width: `${((current + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 3D Model */}
      <div className="flex-1 mx-6 rounded-2xl overflow-hidden" style={{ maxHeight: '40vh', minHeight: '200px' }}>
        <Suspense fallback={<div className="w-full h-full bg-gray-900 flex items-center justify-center"><p className="text-gray-500">Loading model...</p></div>}>
          <FishViewer modelPath={q.modelPath} />
        </Suspense>
      </div>

      {/* Question & Options */}
      <div className="px-6 py-6 space-y-4">
        <h2 className="text-lg font-semibold text-center">{q.question}</h2>
        <div className="grid grid-cols-2 gap-3">
          {q.options.map((opt) => {
            let style = 'bg-gray-900 hover:bg-gray-800 text-white'
            if (selected) {
              if (opt === q.correctAnswer) style = 'bg-green-600 text-white'
              else if (opt === selected) style = 'bg-red-600 text-white'
              else style = 'bg-gray-900 text-gray-500'
            }
            return (
              <button
                key={opt}
                onClick={() => handleSelect(opt)}
                className={`${style} rounded-2xl px-4 py-3 text-sm font-medium transition text-left`}
              >
                {opt}
              </button>
            )
          })}
        </div>

        {selected && (
          <button
            onClick={handleNext}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-2xl font-medium transition mt-2"
          >
            {current + 1 < questions.length ? 'Soal Berikutnya →' : 'Lihat Hasil'}
          </button>
        )}
      </div>
    </div>
  )
}