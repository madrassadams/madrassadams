'use client'

import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        fontSize: '0.875rem',
        color: '#9ca3af',
        cursor: 'pointer',
        letterSpacing: '0.01em',
      }}
    >
      Déconnexion
    </button>
  )
}
