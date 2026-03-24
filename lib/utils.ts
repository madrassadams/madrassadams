import type { StatutCotisation } from '@/types'

export function getStatutClasses(statut: StatutCotisation): string {
  const map: Record<StatutCotisation, string> = {
    paye:       'bg-green-100 text-green-800',
    retard:     'bg-red-100 text-red-800',
    en_attente: 'bg-yellow-100 text-yellow-800',
  }
  return map[statut]
}

export function getStatutLabel(statut: StatutCotisation): string {
  const map: Record<StatutCotisation, string> = {
    paye:       'Payé',
    retard:     'Retard',
    en_attente: 'En attente',
  }
  return map[statut]
}

export function getStatutDotClass(statut: StatutCotisation): string {
  const map: Record<StatutCotisation, string> = {
    paye:       'bg-green-500',
    retard:     'bg-red-500',
    en_attente: 'bg-yellow-400',
  }
  return map[statut]
}

export function formatMois(isoDate: string): string {
  return new Date(isoDate + 'T12:00:00Z').toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function replaceTemplateVars(
  template: string,
  vars: Record<string, string>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`)
}

export function buildWhatsAppUrl(telephone: string, message: string): string {
  const clean = telephone.replace(/[\s\-().+]/g, '')
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`
}

export function currentMoisISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

export function moisToInputValue(isoDate: string): string {
  return isoDate.slice(0, 7)
}

export function inputValueToMois(value: string): string {
  return `${value}-01`
}

export function renderStars(niveau: number): string {
  return '★'.repeat(niveau) + '☆'.repeat(5 - niveau)
}

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
