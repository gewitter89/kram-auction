import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v2 as cloudinary } from 'cloudinary'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE_MB = 5
const MAX_FILES = 8

// Configure Cloudinary if URL is provided
if (process.env.CLOUDINARY_URL) {
  cloudinary.config(true) // Configures using CLOUDINARY_URL
}

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

      const buffer = Buffer.from(await file.arrayBuffer())

      if (process.env.CLOUDINARY_URL) {
        // Upload to Cloudinary
        const uploadResult = await new Promise<string>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'kram_uploads', resource_type: 'image' },
            (error, result) => {
              if (error) reject(error)
              else resolve(result!.secure_url)
            }
          )
          uploadStream.end(buffer)
        })
        urls.push(uploadResult)
      } else {
        // Fallback to local storage (for local development only)
        console.warn('⚠️ CLOUDINARY_URL is missing. Using ephemeral local storage.')
        const uploadDir = join(process.cwd(), 'public', 'uploads')
        await mkdir(uploadDir, { recursive: true })
        const ext = file.type.split('/')[1].replace('jpeg', 'jpg')
        const filename = `${userId}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const filepath = join(uploadDir, filename)
        await writeFile(filepath, buffer)
        urls.push(`/uploads/${filename}`)
      }
    }

    return NextResponse.json({ urls })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Помилка завантаження' }, { status: 500 })
  }
}
