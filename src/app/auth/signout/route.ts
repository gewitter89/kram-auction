import { signOut } from '@/lib/auth-config'

export async function GET() {
  await signOut({ redirectTo: '/' })
}
