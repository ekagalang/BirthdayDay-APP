'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Question {
  id: string
  question: string
  correctAnswer: string
  order: number
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  const fetchQuestions = async () => {
    const res = await fetch('/api/admin/questions')
    const data = await res.json()
    setQuestions(data)
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus soal ini?')) return
    await fetch(`/api/admin/questions/${id}`, { method: 'DELETE' })
    fetchQuestions()
  }

  useEffect(() => { fetchQuestions() }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Soal Kuis 🐟</h1>
          <Link
            href="/admin/questions/create"
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
          >
            + Tambah Soal
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : questions.length === 0 ? (
          <p className="text-gray-400">Belum ada soal.</p>
        ) : (
          <div className="space-y-3">
            {questions.map((q, i) => (
              <div key={q.id} className="bg-gray-900 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Soal {i + 1}</p>
                  <p className="font-medium">{q.question}</p>
                  <p className="text-xs text-green-400 mt-1">Jawaban: {q.correctAnswer}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Link
                    href={`/admin/questions/${q.id}`}
                    className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="text-xs bg-red-900 hover:bg-red-800 px-3 py-1.5 rounded-lg transition"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}