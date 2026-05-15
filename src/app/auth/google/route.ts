import { signIn } from '@/lib/auth-config'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const callbackUrl = searchParams.get('callbackUrl') || '/cabinet'
  
  await signIn('google', { redirectTo: callbackUrl })
}
