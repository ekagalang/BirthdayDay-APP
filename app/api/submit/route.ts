import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { quizScore, quizAnswers, wishText } = body

  if (!wishText?.trim()) {
    return NextResponse.json({ error: 'Harapan tidak boleh kosong' }, { status: 400 })
  }

  const submission = await prisma.submission.create({
    data: {
      quizScore: Number(quizScore),
      quizAnswers,
      wishText: wishText.trim(),
    }
  })

  return NextResponse.json(submission, { status: 201 })
}