'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateQuestionPage() {
  const router = useRouter()
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', '', '', ''])
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [order, setOrder] = useState(0)
  const [modelFile, setModelFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleOptionChange = (i: number, val: string) => {
    const updated = [...options]
    updated[i] = val
    setOptions(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!modelFile) return setError('Upload file .glb terlebih dahulu')
    if (!correctAnswer) return setError('Pilih jawaban yang benar')

    setUploading(true)

    // Upload model
    const formData = new FormData()
    formData.append('file', modelFile)
    const uploadRes = await fetch('/api/admin/upload', { method: 'POST', body: formData })
    const uploadData = await uploadRes.json()

    if (!uploadRes.ok) {
      setError(uploadData.error)
      setUploading(false)
      return
    }

    // Save question
    await fetch('/api/admin/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        modelPath: uploadData.modelPath,
        options,
        correctAnswer,
        order
      })
    })

    setUploading(false)
    router.push('/admin/questions')
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-8">Tambah Soal Baru</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Pertanyaan</label>
            <input
              type="text"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              required
              className="w-full bg-gray-900 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Ikan apakah ini?"
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
            <label className="text-sm text-gray-400 mb-1 block">Model 3D (.glb)</label>
            <input
              type="file"
              accept=".glb"
              onChange={e => setModelFile(e.target.files?.[0] ?? null)}
              className="w-full bg-gray-900 rounded-xl px-4 py-3 text-white outline-none"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white py-3 rounded-xl font-medium transition"
          >
            {uploading ? 'Menyimpan...' : 'Simpan Soal'}
          </button>
        </form>
      </div>
    </div>
  )
}