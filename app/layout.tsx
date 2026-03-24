import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { cookies } from 'next/headers'
import SidebarNav from '@/components/SidebarNav'
import LogoutButton from '@/components/LogoutButton'

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
        <div style={{ display: 'flex', minHeight: '100vh' }}>

          {/* Sidebar */}
          <aside style={{
            width: '240px',
            flexShrink: 0,
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100vh',
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column',
          }}>

            {/* App name */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
              <span style={{
                fontSize: '1.1rem',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}>
                Madrasa
              </span>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '1rem 0' }}>
              <SidebarNav />
            </nav>

            {/* Logout */}
            <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid #e5e7eb' }}>
              <LogoutButton />
            </div>

          </aside>

          {/* Main content */}
          <main style={{
            marginLeft: '240px',
            flex: 1,
            padding: '2rem 2.5rem',
            backgroundColor: '#fafafa',
            minHeight: '100vh',
          }}>
            {children}
          </main>

        </div>
      </body>
    </html>
  )
}
