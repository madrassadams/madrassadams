'use client'

import { useEffect, useState } from 'react'
import SidebarNav from '@/components/SidebarNav'
import LogoutButton from '@/components/LogoutButton'
import { usePathname } from 'next/navigation'

type Props = {
  children: React.ReactNode
}

export default function ResponsiveShell({ children }: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close sidebar on route change (mobile UX).
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  // Prevent background scroll when sidebar is open (mobile).
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Top bar (mobile only) */}
      <div className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-gray-200 bg-white px-4 md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-gray-200 text-gray-900"
          aria-label="Ouvrir le menu"
        >
          <span className="text-2xl leading-none">≡</span>
        </button>
        <div className="text-base font-semibold tracking-wide text-gray-900">
          Madrasa
        </div>
      </div>

      {/* Backdrop (mobile) */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity md:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setOpen(false)}
        aria-hidden
      />

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-[240px] border-r border-gray-200 bg-white transition-transform duration-200 ease-out md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } md:block`}
        aria-label="Navigation"
      >
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center justify-between border-b border-gray-200 px-6 md:h-auto md:py-6">
            <span className="text-[1.1rem] font-semibold tracking-[0.06em] uppercase">
              Madrasa
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-gray-200 text-gray-900 md:hidden"
              aria-label="Fermer le menu"
            >
              <span className="text-xl leading-none">×</span>
            </button>
          </div>

          <nav className="flex-1 py-4">
            <SidebarNav onNavigate={() => setOpen(false)} />
          </nav>

          <div className="border-t border-gray-200 px-6 py-5">
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="w-full overflow-x-hidden px-4 py-6 md:ml-[240px] md:px-10 md:py-8">
        {children}
      </main>
    </div>
  )
}

