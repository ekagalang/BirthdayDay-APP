'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Submission {
  id: string
  createdAt: string
  quizScore: number
  quizAnswers: Record<string, string>
  wishText: string
}

export default function AdminResultsPage() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const getPassword = () => sessionStorage.getItem('adminPassword') ?? ''

  const fetchData = async () => {
    const res = await fetch('/api/admin/results', {
      headers: { 'x-admin-password': getPassword() }
    })

    if (res.status === 401) {
      router.replace('/admin')
      return
    }

    const data = await res.json()
    setSubmissions(data)
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus submission ini?')) return
    setDeleting(id)

    await fetch('/api/admin/results', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': getPassword()
      },
      body: JSON.stringify({ id })
    })

    setDeleting(null)
    fetchData()
  }

  const handleExportCSV = () => {
    const headers = ['No', 'Waktu', 'Skor Quiz', 'Harapan']
    const rows = submissions.map((s, i) => [
      i + 1,
      new Date(s.createdAt).toLocaleString('id-ID'),
      `${s.quizScore}`,
      `"${s.wishText.replace(/"/g, '""')}"`,
    ])

    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'birthday-results.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    const password = sessionStorage.getItem('adminPassword')
    if (!password) {
      router.replace('/admin')
      return
    }
    fetchData()
  }, [])

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="sticky top-0 bg-gray-950 border-b border-gray-800 px-6 py-4 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">Hasil & Harapan 🎂</h1>
            <p className="text-gray-400 text-xs">{submissions.length} submission</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-xl transition"
            >
              Export CSV
            </button>
            <Link
              href="/admin/questions"
              className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-xl transition"
            >
              Soal Kuis
            </Link>
            <button
              onClick={() => { sessionStorage.removeItem('adminPassword'); router.replace('/admin') }}
              className="text-xs bg-red-900 hover:bg-red-800 px-3 py-2 rounded-xl transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-4">
        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-400">Memuat data...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-400">Belum ada submission</p>
          </div>
        ) : (
          submissions.map((s, i) => (
            <div key={s.id} className="bg-gray-900 rounded-2xl overflow-hidden">
              {/* Card header */}
              <button
                className="w-full px-5 py-4 flex items-center justify-between text-left"
                onClick={() => setExpanded(expanded === s.id ? null : s.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ background: 'linear-gradient(135deg, #ff6b9d, #a78bfa)' }}>
                    {submissions.length - i}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{formatDate(s.createdAt)}</p>
                    <p className="text-xs text-gray-400">Skor: {s.quizScore} benar</p>
                  </div>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${expanded === s.id ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Expanded detail */}
              {expanded === s.id && (
                <div className="px-5 pb-5 space-y-4 border-t border-gray-800 pt-4">
                  {/* Harapan */}
                  <div>
                    <p className="text-xs text-gray-400 mb-2">✨ Harapan</p>
                    <div className="bg-amber-50 rounded-xl p-4">
                      <p className="text-gray-700 text-sm italic leading-relaxed">"{s.wishText}"</p>
                    </div>
                  </div>

                  {/* Jawaban quiz */}
                  <div>
                    <p className="text-xs text-gray-400 mb-2">🐟 Jawaban Kuis</p>
                    <div className="space-y-1">
                      {Object.entries(s.quizAnswers).map(([qId, answer], idx) => (
                        <div key={qId} className="flex justify-between text-xs bg-gray-800 rounded-lg px-3 py-2">
                          <span className="text-gray-400">Soal {idx + 1}</span>
                          <span className="text-white">{answer}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hapus */}
                  <button
                    onClick={() => handleDelete(s.id)}
                    disabled={deleting === s.id}
                    className="w-full py-2 rounded-xl text-red-400 text-sm border border-red-900 hover:bg-red-900 transition disabled:opacity-50"
                  >
                    {deleting === s.id ? 'Menghapus...' : 'Hapus Submission'}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}