import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { cookies } from 'next/headers'
import ResponsiveShell from '@/components/ResponsiveShell'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Madrasa',
  description: 'Gestion des élèves',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const isAuthenticated = !!cookieStore.get('admin_session')?.value

  if (!isAuthenticated) {
    return (
      <html lang="fr">
        <body className={inter.className}>{children}</body>
      </html>
    )
  }

  return (
    <html lang="fr">
      <body className={inter.className}>
        <ResponsiveShell>{children}</ResponsiveShell>
      </body>
    </html>
  )
}
