'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const MainFlow = dynamic(() => import('@/components/MainFlow'), { ssr: false })

export default function Home() {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const score = sessionStorage.getItem('quizScore')
    if (!score) {
      router.replace('/quiz')
      return
    }
    setReady(true)
  }, [router])

  if (!ready) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-white">Loading...</p>
    </div>
  )

  return <MainFlow onComplete={() => router.push('/wish')} />
}