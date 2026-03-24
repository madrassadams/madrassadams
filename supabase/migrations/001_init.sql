-- Extensions (gen_random_uuid on some Postgres versions)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. elèves
CREATE TABLE eleves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  prenom text NOT NULL,
  cours text[] NOT NULL DEFAULT '{}', -- values: 'arabe', 'coran'
  niveau int NOT NULL DEFAULT 1 CHECK (niveau BETWEEN 1 AND 5),
  telephone text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. cotisations
CREATE TABLE cotisations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  eleve_id uuid NOT NULL REFERENCES eleves (id) ON DELETE CASCADE,
  montant numeric(8, 2) NOT NULL,
  mois date NOT NULL,
  statut text NOT NULL DEFAULT 'en_attente' CHECK (
    statut IN ('paye', 'retard', 'en_attente')
  ),
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (eleve_id, mois)
);

-- 3. message_templates
CREATE TABLE message_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titre text NOT NULL,
  contenu text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. rappels
CREATE TABLE rappels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  eleve_id uuid NOT NULL REFERENCES eleves (id) ON DELETE CASCADE,
  template_id uuid REFERENCES message_templates (id) ON DELETE SET NULL,
  type text NOT NULL, -- 'cotisation' | 'retard' | 'autre'
  envoye_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Seed message templates
INSERT INTO message_templates (titre, contenu)
VALUES
  (
    'Rappel cotisation',
    'Bonjour {prenom}, votre cotisation de {montant}€ pour {mois} est en attente. Merci de régler dès que possible.'
  ),
  (
    'Retard paiement',
    'Bonjour {prenom}, nous n''avons pas encore reçu votre cotisation de {montant}€ pour {mois}. Merci de régulariser rapidement.'
  ),
  (
    'Confirmation reçu',
    'Bonjour {prenom}, nous avons bien reçu votre paiement de {montant}€ pour {mois}. Merci !'
  );

-- RLS (single-admin app: permissive policies)
ALTER TABLE eleves ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE rappels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all" ON eleves FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "admin_all" ON cotisations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "admin_all" ON message_templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "admin_all" ON rappels FOR ALL USING (true) WITH CHECK (true);
