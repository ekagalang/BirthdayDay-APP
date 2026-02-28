'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Stage = 'write' | 'fold1' | 'fold2' | 'fold3' | 'fold4' | 'plane' | 'flying' | 'done'

export default function WishPage() {
  const router = useRouter()
  const [wish, setWish] = useState('')
  const [stage, setStage] = useState<Stage>('write')
  const [error, setError] = useState('')

  useEffect(() => {
    const score = sessionStorage.getItem('quizScore')
    if (!score) router.replace('/quiz')
  }, [router])

  const handleSubmit = async () => {
    if (!wish.trim()) {
      setError('Tuliskan harapanmu dulu ya 🌸')
      return
    }
    setError('')

    const quizScore = sessionStorage.getItem('quizScore') ?? '0'
    const quizAnswers = JSON.parse(sessionStorage.getItem('quizAnswers') ?? '{}')

    try {
      await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizScore, quizAnswers, wishText: wish }),
      })
    } catch {
      // tetap lanjut animasi
    }

    // Urutan animasi lipat origami
    setStage('fold1')
    setTimeout(() => setStage('fold2'),  700)
    setTimeout(() => setStage('fold3'), 1400)
    setTimeout(() => setStage('fold4'), 2100)
    setTimeout(() => setStage('plane'), 2800)
    setTimeout(() => setStage('flying'), 3600)
    setTimeout(() => setStage('done'),  5800)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-pink-950 flex flex-col items-center justify-center px-6 overflow-hidden">

      {/* ===== WRITE STAGE ===== */}
      {stage === 'write' && (
        <div className="w-full max-w-sm" style={{ animation: 'fadeInUp 0.6s ease forwards' }}>
          <div className="text-center mb-8">
            <p className="text-3xl mb-2">📝</p>
            <p className="text-white text-xl font-bold">Tuliskan harapanmu</p>
            <p className="text-pink-300 text-sm mt-1">Apa yang kamu harapkan hari ini?</p>
          </div>

          {/* Kertas */}
          <div className="relative bg-amber-50 rounded-lg shadow-2xl p-6"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.8)' }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="absolute left-10 right-4 border-b border-blue-100"
                style={{ top: `${52 + i * 32}px` }} />
            ))}
            <div className="absolute left-5 top-8 w-3 h-3 rounded-full bg-gray-200 shadow-inner" />
            <div className="absolute left-5 top-1/2 w-3 h-3 rounded-full bg-gray-200 shadow-inner" />
            <div className="absolute left-5 bottom-8 w-3 h-3 rounded-full bg-gray-200 shadow-inner" />
            <textarea
              value={wish}
              onChange={e => setWish(e.target.value)}
              maxLength={300}
              rows={7}
              placeholder="Tulis harapanmu di sini..."
              className="relative z-10 w-full bg-transparent text-gray-700 text-sm leading-8 resize-none outline-none placeholder-gray-400 pl-6"
              style={{ fontFamily: "'Segoe UI', sans-serif", lineHeight: '32px' }}
            />
            <div className="text-right text-xs text-gray-400 mt-1 relative z-10">{wish.length}/300</div>
          </div>

          {error && <p className="text-pink-400 text-sm text-center mt-3">{error}</p>}

          <button
            onClick={handleSubmit}
            className="w-full mt-6 py-4 rounded-2xl text-white font-bold text-lg transition-transform active:scale-95"
            style={{ background: 'linear-gradient(135deg, #ff6b9d, #a78bfa)', boxShadow: '0 0 30px #ff6b9d66' }}
          >
            Kirim Harapan 🕊️
          </button>
        </div>
      )}

      {/* ===== ORIGAMI FOLD STAGES ===== */}
      {(stage === 'fold1' || stage === 'fold2' || stage === 'fold3' || stage === 'fold4' || stage === 'plane') && (
        <div className="flex flex-col items-center gap-6">
          <p className="text-pink-300 text-sm">
            {stage === 'plane' ? 'Pesawat siap terbang! ✈️' : 'Melipat kertas...'}
          </p>

          <div className="relative" style={{ width: 200, height: 200 }}>
            <svg viewBox="0 0 200 200" width="200" height="200">
              <defs>
                <filter id="shadow">
                  <feDropShadow dx="2" dy="4" stdDeviation="4" floodOpacity="0.3" />
                </filter>
              </defs>

              {/* ===== FOLD 0 — kertas penuh (baseline, selalu ada sampai fold4) ===== */}

              {/* FOLD 1 — lipat atas ke bawah (kertas jadi setengah) */}
              {stage === 'fold1' && (
                <>
                  {/* Bagian bawah kertas */}
                  <rect x="20" y="100" width="160" height="80" fill="#fef3c7" stroke="#d4a574" strokeWidth="1.5" filter="url(#shadow)" />
                  {/* Garis */}
                  <line x1="30" y1="120" x2="170" y2="120" stroke="#bfdbfe" strokeWidth="1" />
                  <line x1="30" y1="138" x2="170" y2="138" stroke="#bfdbfe" strokeWidth="1" />
                  <line x1="30" y1="156" x2="140" y2="156" stroke="#bfdbfe" strokeWidth="1" />
                  {/* Bagian atas yang sedang melipat ke bawah */}
                  <g style={{ animation: 'foldDown 0.6s ease forwards', transformOrigin: '100px 100px', transformBox: 'fill-box' }}>
                    <rect x="20" y="20" width="160" height="80" fill="#fde68a" stroke="#d4a574" strokeWidth="1.5" />
                    <line x1="30" y1="40" x2="170" y2="40" stroke="#bfdbfe" strokeWidth="1" />
                    <line x1="30" y1="58" x2="170" y2="58" stroke="#bfdbfe" strokeWidth="1" />
                    <line x1="30" y1="76" x2="170" y2="76" stroke="#bfdbfe" strokeWidth="1" />
                  </g>
                </>
              )}

              {/* FOLD 2 — kertas sudah setengah, lipat diagonal kiri */}
              {stage === 'fold2' && (
                <>
                  {/* Kertas setengah */}
                  <rect x="20" y="60" width="160" height="80" fill="#fef3c7" stroke="#d4a574" strokeWidth="1.5" filter="url(#shadow)" />
                  <line x1="30" y1="80" x2="170" y2="80" stroke="#bfdbfe" strokeWidth="1" />
                  <line x1="30" y1="100" x2="170" y2="100" stroke="#bfdbfe" strokeWidth="1" />
                  <line x1="30" y1="120" x2="140" y2="120" stroke="#bfdbfe" strokeWidth="1" />
                  {/* Segitiga kiri yang melipat */}
                  <g style={{ animation: 'foldLeft 0.6s ease forwards', transformOrigin: '20px 100px', transformBox: 'fill-box' }}>
                    <polygon points="20,60 100,60 20,140" fill="#fde68a" stroke="#d4a574" strokeWidth="1.5" />
                  </g>
                  {/* Garis lipatan */}
                  <line x1="20" y1="60" x2="20" y2="140" stroke="#d4a574" strokeWidth="1" strokeDasharray="3,2" />
                </>
              )}

              {/* FOLD 3 — lipat diagonal kanan */}
              {stage === 'fold3' && (
                <>
                  {/* Body tengah */}
                  <polygon points="20,60 180,60 180,140 20,140" fill="#fef3c7" stroke="#d4a574" strokeWidth="1.5" filter="url(#shadow)" />
                  {/* Garis lipatan tengah */}
                  <line x1="100" y1="60" x2="100" y2="140" stroke="#d4a574" strokeWidth="1" strokeDasharray="3,2" />
                  {/* Segitiga kanan yang melipat */}
                  <g style={{ animation: 'foldRight 0.6s ease forwards', transformOrigin: '180px 100px', transformBox: 'fill-box' }}>
                    <polygon points="100,60 180,60 180,140 100,140" fill="#fde68a" stroke="#d4a574" strokeWidth="1.5" />
                  </g>
                </>
              )}

              {/* FOLD 4 — bentuk segitiga, hampir jadi pesawat */}
              {stage === 'fold4' && (
                <>
                  {/* Body pesawat kasar */}
                  <polygon points="20,130 100,40 180,130" fill="#fef3c7" stroke="#d4a574" strokeWidth="1.5" filter="url(#shadow)" />
                  {/* Sayap kiri melipat */}
                  <g style={{ animation: 'foldWingL 0.6s ease forwards', transformOrigin: '100px 130px', transformBox: 'fill-box' }}>
                    <polygon points="20,130 100,130 100,40" fill="#fde68a" stroke="#d4a574" strokeWidth="1.5" />
                  </g>
                  {/* Garis tengah */}
                  <line x1="100" y1="40" x2="100" y2="130" stroke="#d4a574" strokeWidth="1" strokeDasharray="3,2" />
                </>
              )}

              {/* PLANE — pesawat kertas jadi! */}
              {stage === 'plane' && (
                <g style={{ animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards' }}>
                  {/* Body utama */}
                  <polygon points="10,100 190,70 190,130" fill="#fef3c7" stroke="#d4a574" strokeWidth="1.5" filter="url(#shadow)" />
                  {/* Sayap bawah */}
                  <polygon points="10,100 190,130 130,115" fill="#fde68a" stroke="#d4a574" strokeWidth="1.2" />
                  {/* Lipatan tengah */}
                  <line x1="10" y1="100" x2="190" y2="100" stroke="#d4a574" strokeWidth="1" strokeDasharray="4,2" opacity="0.6" />
                  {/* Garis lipatan sayap */}
                  <line x1="130" y1="100" x2="190" y2="130" stroke="#d4a574" strokeWidth="0.8" strokeDasharray="2,2" opacity="0.5" />
                </g>
              )}
            </svg>
          </div>
        </div>
      )}

      {/* ===== FLYING STAGE ===== */}
      {stage === 'flying' && (
        <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
          {/* Trail bintang */}
          {[...Array(8)].map((_, i) => (
            <div key={i} className="absolute text-yellow-300"
              style={{
                fontSize: `${10 + i * 2}px`,
                left: `calc(50% - ${i * 22}px)`,
                top: `calc(50% + ${i * 14}px)`,
                animation: `starFade 2s ease-out ${i * 0.08}s forwards`,
              }}>
              ✨
            </div>
          ))}

          {/* Pesawat terbang ke kanan atas */}
          <div style={{ animation: 'flyTopRight 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards' }}>
            <svg viewBox="0 0 200 140" width="160" height="112">
              {/* Body */}
              {/* Flip horizontal — lancip ke kanan */}
            <g transform="scale(-1,1) translate(-200,0)">
                <polygon points="10,70 190,40 190,100" fill="#fef3c7" stroke="#d4a574" strokeWidth="1.5" />
                <polygon points="10,70 190,100 130,85" fill="#fde68a" stroke="#d4a574" strokeWidth="1.2" />
                <line x1="10" y1="70" x2="190" y2="70" stroke="#d4a574" strokeWidth="1" strokeDasharray="4,2" opacity="0.6" />
                <line x1="130" y1="70" x2="190" y2="100" stroke="#d4a574" strokeWidth="0.8" strokeDasharray="2,2" opacity="0.5" />
            </g>
            </svg>
          </div>
        </div>
      )}

      {/* ===== DONE STAGE ===== */}
      {stage === 'done' && (
        <div className="text-center w-full max-w-sm" style={{ animation: 'fadeInUp 0.8s ease forwards' }}>
          <div className="text-6xl mb-6">🌟</div>
          <h2 className="text-white text-2xl font-bold mb-3">Harapanmu sudah terkirim!</h2>
          <p className="text-pink-300 text-sm leading-relaxed mb-8">
            Semoga semua harapanmu terwujud ya sayang. 💕<br />
            Selamat ulang tahun sekali lagi!
          </p>

          <div className="bg-amber-50 rounded-2xl p-5 text-left shadow-xl mb-8"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
            <p className="text-xs text-gray-400 mb-2">Harapanmu ✨</p>
            <p className="text-gray-700 text-sm leading-relaxed italic">"{wish}"</p>
          </div>

          <button
            onClick={() => { sessionStorage.clear(); router.replace('/quiz') }}
            className="text-pink-400 text-sm underline opacity-70"
          >
            Mulai dari awal
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes foldDown {
          from { transform: rotateX(0deg); }
          to   { transform: rotateX(180deg); }
        }
        @keyframes foldLeft {
          from { transform: rotateY(0deg); }
          to   { transform: rotateY(180deg); }
        }
        @keyframes foldRight {
          from { transform: rotateY(0deg); }
          to   { transform: rotateY(-180deg); }
        }
        @keyframes foldWingL {
          from { transform: rotateY(0deg); }
          to   { transform: rotateY(180deg); }
        }
        @keyframes popIn {
          from { transform: scale(0.5) rotate(-10deg); opacity: 0; }
          to   { transform: scale(1) rotate(0deg);    opacity: 1; }
        }
        @keyframes flyTopRight {
          0%   { transform: translate(0, 0)          rotate(-10deg) scale(1);   opacity: 1; }
          20%  { transform: translate(40px, -50px)   rotate(-20deg) scale(1.05);opacity: 1; }
          60%  { transform: translate(140px, -160px) rotate(-25deg) scale(0.85);opacity: 0.8; }
          100% { transform: translate(280px, -320px) rotate(-30deg) scale(0.4); opacity: 0; }
        }
        @keyframes starFade {
          0%   { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0) translateY(-20px); }
        }
      `}</style>
    </div>
  )
}