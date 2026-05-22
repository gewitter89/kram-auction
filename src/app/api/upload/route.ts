import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v2 as cloudinary } from "cloudinary";
import { readSessionToken, COOKIE_NAME } from "@/lib/session";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 4;
const MAX_FILES = 8;

function hasCloudinaryConfig() {
  return Boolean(
    process.env.CLOUDINARY_URL ||
      (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
  );
}

function configureCloudinary() {
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config(true);
    return;
  }

  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }
}

configureCloudinary();

export async function POST(request: NextRequest) {
  try {
    const user = readSessionToken(request.cookies.get(COOKIE_NAME)?.value);
    if (!user?.id) return NextResponse.json({ error: "Необхідна авторизація" }, { status: 401 });

    if (!hasCloudinaryConfig() && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Завантаження фото не налаштовано. Додайте CLOUDINARY_URL або CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET у Vercel Environment Variables." },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) return NextResponse.json({ error: "Файли не знайдено" }, { status: 400 });
    if (files.length > MAX_FILES) return NextResponse.json({ error: `Максимум ${MAX_FILES} фото` }, { status: 400 });

    const urls: string[] = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ error: "Дозволені тільки зображення JPEG, PNG або WebP" }, { status: 400 });
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        return NextResponse.json({ error: `Максимальний розмір файлу — ${MAX_SIZE_MB}MB` }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      if (hasCloudinaryConfig()) {
        const uploadResult = await new Promise<string>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "kram_uploads", resource_type: "image", overwrite: false, unique_filename: true },
            (error, result) => {
              if (error) reject(error);
              else if (result?.secure_url) resolve(result.secure_url);
              else reject(new Error("Cloudinary did not return secure_url"));
            }
          );
          uploadStream.end(buffer);
        });
        urls.push(uploadResult);
      } else {
        const uploadDir = join(process.cwd(), "public", "uploads");
        await mkdir(uploadDir, { recursive: true });
        const ext = file.type.split("/")[1].replace("jpeg", "jpg");
        const filename = `${user.id}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const filepath = join(uploadDir, filename);
        await writeFile(filepath, buffer);
        urls.push(`/uploads/${filename}`);
      }
    }

    return NextResponse.json({ urls });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Помилка завантаження" }, { status: 500 });
  }
}
