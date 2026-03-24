export type StatutCotisation = 'paye' | 'retard' | 'en_attente'
export type CoursType = 'arabe' | 'coran'

export interface Eleve {
  id: string
  nom: string
  prenom: string
  cours: CoursType[]
  niveau: number
  telephone: string | null
  notes: string | null
  created_at: string
}

export interface Cotisation {
  id: string
  eleve_id: string
  montant: number
  mois: string
  statut: StatutCotisation
  paid_at: string | null
  created_at: string
}

export interface MessageTemplate {
  id: string
  titre: string
  contenu: string
  created_at: string
}

export interface Rappel {
  id: string
  eleve_id: string
  template_id: string | null
  type: string
  envoye_at: string
  created_at: string
}

export type EleveWithCotisation = Eleve & {
  cotisation_mois: Cotisation | null
}
