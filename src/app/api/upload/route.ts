import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE_MB = 5
const MAX_FILES = 8

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'Необхідна авторизація' }, { status: 401 })
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Файли не знайдено' }, { status: 400 })
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: `Максимум ${MAX_FILES} фото` }, { status: 400 })
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    const urls: string[] = []

    for (const file of files) {
      // Validate type
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ error: 'Дозволені тільки зображення (JPEG, PNG, WebP, GIF)' }, { status: 400 })
      }

      // Validate size
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        return NextResponse.json({ error: `Максимальний розмір файлу — ${MAX_SIZE_MB}MB` }, { status: 400 })
      }

      const ext = file.type.split('/')[1].replace('jpeg', 'jpg')
      const filename = `${userId}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const filepath = join(uploadDir, filename)

      const buffer = Buffer.from(await file.arrayBuffer())
      await writeFile(filepath, buffer)

      urls.push(`/uploads/${filename}`)
    }

    return NextResponse.json({ urls })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Помилка завантаження' }, { status: 500 })
  }
}
