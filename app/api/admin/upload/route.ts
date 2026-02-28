import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
  if (!file.name.endsWith('.glb')) {
    return NextResponse.json({ error: 'Only .glb files allowed' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`
  const filepath = path.join(process.cwd(), 'public/models', filename)

  await writeFile(filepath, buffer)

  return NextResponse.json({ modelPath: `/models/${filename}` })
}