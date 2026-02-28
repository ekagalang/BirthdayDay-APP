import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const questions = await prisma.question.findMany({
    orderBy: { order: 'asc' }
  })
  return NextResponse.json(questions)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { question, modelPath, options, correctAnswer, order } = body

  const created = await prisma.question.create({
    data: { question, modelPath, options, correctAnswer, order: order ?? 0 }
  })

  return NextResponse.json(created, { status: 201 })
}