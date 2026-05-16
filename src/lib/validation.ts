import { z } from 'zod'

// Bid validation schema
export const bidSchema = z.object({
  listingId: z.string().min(1, 'ID лота обов\'язковий'),
  amount: z.number().positive('Сума має бути додатньою'),
  isAuto: z.boolean().optional(),
  autoMax: z.number().positive().optional(),
})

// Register validation schema
export const registerSchema = z.object({
  name: z.string().min(2, 'Ім\'я має бути від 2 символів').max(50),
  email: z.string().email('Невірний формат email'),
  password: z.string().min(8, 'Пароль має бути мінімум 8 символів'),
  phone: z.string().optional(),
})

// Create lot validation schema
export const createLotSchema = z.object({
  title: z.string().min(5, 'Назва має бути від 5 символів').max(100),
  description: z.string().max(2000).optional(),
  categoryId: z.string().min(1, 'Категорія обов\'язкова'),
  condition: z.enum(['new', 'used', 'like_new']),
  startPrice: z.number().positive('Початкова ціна має бути додатньою'),
  buyNowPrice: z.number().positive().optional(),
  reservePrice: z.number().positive().optional(),
  minIncrement: z.number().min(1).default(10),
  duration: z.number().min(1).max(30, 'Тривалість не більше 30 днів'),
  city: z.string().min(2).max(50),
  delivery: z.enum(['nova_poshta', 'ukrposhta', 'pickup']),
  images: z.array(z.string().url()).max(10, 'Максимум 10 фото').optional(),
})

// Message validation schema
export const messageSchema = z.object({
  receiverId: z.string().min(1, 'ID отримувача обов\'язковий'),
  text: z.string().min(1, 'Повідомлення не може бути порожнім').max(1000, 'Максимум 1000 символів'),
  listingId: z.string().optional(),
})

// API response wrapper
export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown): { data?: T; error?: string } {
  const result = schema.safeParse(body)
  if (!result.success) {
    const issues = result.error.issues || []
    const errorMessages = issues
      .map((issue: { path: (string | number)[]; message: string }) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ')
    return { error: errorMessages || 'Validation failed' }
  }
  return { data: result.data }
}
