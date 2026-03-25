'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/',             label: 'Tableau de bord' },
  { href: '/eleves',       label: 'Élèves'          },
  { href: '/cotisations',  label: 'Cotisations'     },
  { href: '/messages',     label: 'Messages'        },
]

type Props = {
  onNavigate?: () => void
}

export default function SidebarNav({ onNavigate }: Props) {
  const pathname = usePathname()

  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {links.map(({ href, label }) => {
        const isActive = href === '/'
          ? pathname === '/'
          : pathname.startsWith(href)

        return (
          <li key={href}>
            <Link
              href={href}
              onClick={() => onNavigate?.()}
              style={{
                display: 'block',
                padding: '0.625rem 1.5rem',
                fontSize: '0.875rem',
                textDecoration: 'none',
                color: isActive ? '#111827' : '#6b7280',
                fontWeight: isActive ? 500 : 400,
                borderLeft: isActive ? '2px solid #111827' : '2px solid transparent',
                backgroundColor: isActive ? '#f9fafb' : 'transparent',
                transition: 'color 0.15s, background-color 0.15s',
              }}
            >
              {label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
