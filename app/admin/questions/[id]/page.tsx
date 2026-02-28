'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function EditQuestionPage() {
  const router = useRouter()
  const { id } = useParams()
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', '', '', ''])
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [order, setOrder] = useState(0)
  const [modelFile, setModelFile] = useState<File | null>(null)
  const [currentModel, setCurrentModel] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/questions/${id}`)
      .then(r => r.json())
      .then(data => {
        setQuestion(data.question)
        setOptions(data.options)
        setCorrectAnswer(data.correctAnswer)
        setOrder(data.order)
        setCurrentModel(data.modelPath)
      })
  }, [id])

  const handleOptionChange = (i: number, val: string) => {
    const updated = [...options]
    updated[i] = val
    setOptions(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    let modelPath = currentModel

    if (modelFile) {
      const formData = new FormData()
      formData.append('file', modelFile)
      const uploadRes = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      const uploadData = await uploadRes.json()
      modelPath = uploadData.modelPath
    }

    await fetch(`/api/admin/questions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, modelPath, options, correctAnswer, order })
    })

    setUploading(false)
    router.push('/admin/questions')
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-8">Edit Soal</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Pertanyaan</label>
            <input
              type="text"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              required
              className="w-full bg-gray-900 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Pilihan Jawaban</label>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <input
                  key={i}
                  type="text"
                  value={opt}
                  onChange={e => handleOptionChange(i, e.target.value)}
                  required
                  className="w-full bg-gray-900 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder={`Pilihan ${i + 1}`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Jawaban Benar</label>
            <select
              value={correctAnswer}
              onChange={e => setCorrectAnswer(e.target.value)}
              className="w-full bg-gray-900 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="">-- Pilih jawaban benar --</option>
              {options.filter(o => o).map((opt, i) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Urutan Soal</label>
            <input
              type="number"
              value={order}
              onChange={e => setOrder(Number(e.target.value))}
              className="w-full bg-gray-900 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">
              Ganti Model 3D (.glb) — kosongkan jika tidak ingin ganti
            </label>
            {currentModel && (
              <p className="text-xs text-gray-500 mb-2">Model saat ini: {currentModel}</p>
            )}
            <input
              type="file"
              accept=".glb"
              onChange={e => setModelFile(e.target.files?.[0] ?? null)}
              className="w-full bg-gray-900 rounded-xl px-4 py-3 text-white outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white py-3 rounded-xl font-medium transition"
          >
            {uploading ? 'Menyimpan...' : 'Update Soal'}
          </button>
        </form>
      </div>
    </div>
  )
}