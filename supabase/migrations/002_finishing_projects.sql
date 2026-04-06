-- ============================================
-- Finishing Projects & Media Tables
-- Run this in the Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. FINISHING_PROJECTS TABLE
-- ============================================
CREATE TABLE finishing_projects (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en            TEXT NOT NULL,
  title_ar            TEXT NOT NULL,
  slug                TEXT NOT NULL UNIQUE,
  description_en      TEXT,
  description_ar      TEXT,
  location_en         TEXT,
  location_ar         TEXT,
  property_type       TEXT CHECK (property_type IN ('apartment', 'villa', 'building')),
  area                NUMERIC,
  completion_date     DATE,
  cover_image_url     TEXT,
  cover_image_file_id TEXT,
  is_published        BOOLEAN NOT NULL DEFAULT false,
  display_order       INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_finishing_projects_published_order
  ON finishing_projects (is_published, display_order, created_at DESC);

CREATE INDEX idx_finishing_projects_slug
  ON finishing_projects (slug);

-- Trigger: auto-update updated_at on row change
CREATE TRIGGER finishing_projects_updated_at
  BEFORE UPDATE ON finishing_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- ============================================
-- 2. FINISHING_MEDIA TABLE
-- ============================================
CREATE TABLE finishing_media (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES finishing_projects(id) ON DELETE CASCADE,
  type          TEXT NOT NULL CHECK (type IN ('image', 'video')),
  url           TEXT NOT NULL,
  file_id       TEXT,
  public_id     TEXT,
  thumbnail_url TEXT,
  is_before     BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fetching media by project
CREATE INDEX idx_finishing_media_project_id
  ON finishing_media (project_id, display_order);


-- ============================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE finishing_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE finishing_media ENABLE ROW LEVEL SECURITY;

-- FINISHING_PROJECTS: anon can only read published projects
CREATE POLICY "Public can read published finishing projects"
  ON finishing_projects
  FOR SELECT
  TO anon
  USING (is_published = true);

-- FINISHING_PROJECTS: service_role (admin) has full access
CREATE POLICY "Service role full access on finishing_projects"
  ON finishing_projects
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- FINISHING_MEDIA: anon can read media of published projects only
CREATE POLICY "Public can read finishing media"
  ON finishing_media
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM finishing_projects
      WHERE finishing_projects.id = finishing_media.project_id
      AND finishing_projects.is_published = true
    )
  );

-- FINISHING_MEDIA: service_role has full access
CREATE POLICY "Service role full access on finishing_media"
  ON finishing_media
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ============================================
-- 4. SEED DATA
-- ============================================

-- Project 1: Modern Villa in Dreamland
INSERT INTO finishing_projects (id, title_en, title_ar, slug, description_en, description_ar, location_en, location_ar, property_type, area, completion_date, cover_image_url, is_published, display_order)
VALUES (
  'a1b2c3d4-0001-4000-a000-000000000001',
  'Modern Villa — Full Interior Finishing',
  'فيلا عصرية — تشطيب داخلي كامل',
  'modern-villa-dreamland',
  'Complete interior finishing of a 450 sqm standalone villa in Dreamland compound. Scope included flooring, wall treatments, kitchen, bathrooms, lighting design, and landscape.',
  'تشطيب داخلي كامل لفيلا مستقلة 450 متر مربع في كمبوند دريم لاند. يشمل النطاق الأرضيات ومعالجات الحوائط والمطبخ والحمامات وتصميم الإضاءة واللاندسكيب.',
  'Dreamland, 6th of October',
  'دريم لاند، السادس من أكتوبر',
  'villa',
  450,
  '2025-08-15',
  'https://ik.imagekit.io/placeholder/finishing-villa-cover.jpg',
  true,
  1
);

-- Project 2: Luxury Apartment in Sheikh Zayed
INSERT INTO finishing_projects (id, title_en, title_ar, slug, description_en, description_ar, location_en, location_ar, property_type, area, completion_date, cover_image_url, is_published, display_order)
VALUES (
  'a1b2c3d4-0002-4000-a000-000000000002',
  'Luxury Apartment — Premium Finishing',
  'شقة فاخرة — تشطيب بريميوم',
  'luxury-apartment-sheikh-zayed',
  'Premium finishing of a 220 sqm apartment in a high-end residential tower. Modern minimalist design with imported Italian marble, custom joinery, and smart home integration.',
  'تشطيب بريميوم لشقة 220 متر مربع في برج سكني راقي. تصميم حديث بسيط مع رخام إيطالي مستورد ونجارة مخصصة ونظام المنزل الذكي.',
  'Sheikh Zayed City',
  'مدينة الشيخ زايد',
  'apartment',
  220,
  '2025-11-20',
  'https://ik.imagekit.io/placeholder/finishing-apartment-cover.jpg',
  true,
  2
);

-- Project 3: Residential Building in San Capital
INSERT INTO finishing_projects (id, title_en, title_ar, slug, description_en, description_ar, location_en, location_ar, property_type, area, completion_date, cover_image_url, is_published, display_order)
VALUES (
  'a1b2c3d4-0003-4000-a000-000000000003',
  'Residential Building — Common Areas & 12 Units',
  'عمارة سكنية — مناطق مشتركة و12 وحدة',
  'residential-building-san-capital',
  'Full finishing of a 12-unit residential building including lobby, stairways, elevators, and all apartment interiors. Consistent design language across all units with high-quality local materials.',
  'تشطيب كامل لعمارة سكنية من 12 وحدة يشمل اللوبي والسلالم والمصاعد وجميع الشقق من الداخل. لغة تصميم موحدة في جميع الوحدات بخامات محلية عالية الجودة.',
  'San Capital, New Administrative Capital',
  'سان كابيتال، العاصمة الإدارية الجديدة',
  'building',
  1800,
  '2026-01-10',
  'https://ik.imagekit.io/placeholder/finishing-building-cover.jpg',
  true,
  3
);

-- Project 4: Duplex Villa (draft / unpublished)
INSERT INTO finishing_projects (id, title_en, title_ar, slug, description_en, description_ar, location_en, location_ar, property_type, area, completion_date, cover_image_url, is_published, display_order)
VALUES (
  'a1b2c3d4-0004-4000-a000-000000000004',
  'Duplex Villa — Under Finishing',
  'فيلا دوبلكس — تحت التشطيب',
  'duplex-villa-october',
  'Ongoing finishing project for a 600 sqm duplex villa. Neo-classic design with double-height reception, marble staircase, and landscaped garden.',
  'مشروع تشطيب جارٍ لفيلا دوبلكس 600 متر مربع. تصميم نيو كلاسيك مع ريسبشن مزدوج الارتفاع وسلم رخام وحديقة منسقة.',
  'Palm Hills, 6th of October',
  'بالم هيلز، السادس من أكتوبر',
  'villa',
  600,
  NULL,
  'https://ik.imagekit.io/placeholder/finishing-duplex-cover.jpg',
  false,
  4
);


-- ============================================
-- SEED MEDIA for Project 1 (Villa)
-- ============================================
INSERT INTO finishing_media (project_id, type, url, is_before, display_order) VALUES
  ('a1b2c3d4-0001-4000-a000-000000000001', 'image', 'https://ik.imagekit.io/placeholder/villa-after-1.jpg', false, 1),
  ('a1b2c3d4-0001-4000-a000-000000000001', 'image', 'https://ik.imagekit.io/placeholder/villa-after-2.jpg', false, 2),
  ('a1b2c3d4-0001-4000-a000-000000000001', 'image', 'https://ik.imagekit.io/placeholder/villa-after-3.jpg', false, 3),
  ('a1b2c3d4-0001-4000-a000-000000000001', 'image', 'https://ik.imagekit.io/placeholder/villa-before-1.jpg', true, 1),
  ('a1b2c3d4-0001-4000-a000-000000000001', 'image', 'https://ik.imagekit.io/placeholder/villa-before-2.jpg', true, 2);

-- SEED MEDIA for Project 2 (Apartment)
INSERT INTO finishing_media (project_id, type, url, is_before, display_order) VALUES
  ('a1b2c3d4-0002-4000-a000-000000000002', 'image', 'https://ik.imagekit.io/placeholder/apt-after-1.jpg', false, 1),
  ('a1b2c3d4-0002-4000-a000-000000000002', 'image', 'https://ik.imagekit.io/placeholder/apt-after-2.jpg', false, 2),
  ('a1b2c3d4-0002-4000-a000-000000000002', 'image', 'https://ik.imagekit.io/placeholder/apt-before-1.jpg', true, 1);

-- SEED MEDIA for Project 3 (Building)
INSERT INTO finishing_media (project_id, type, url, is_before, display_order) VALUES
  ('a1b2c3d4-0003-4000-a000-000000000003', 'image', 'https://ik.imagekit.io/placeholder/bldg-after-1.jpg', false, 1),
  ('a1b2c3d4-0003-4000-a000-000000000003', 'image', 'https://ik.imagekit.io/placeholder/bldg-after-2.jpg', false, 2),
  ('a1b2c3d4-0003-4000-a000-000000000003', 'image', 'https://ik.imagekit.io/placeholder/bldg-after-3.jpg', false, 3),
  ('a1b2c3d4-0003-4000-a000-000000000003', 'image', 'https://ik.imagekit.io/placeholder/bldg-after-4.jpg', false, 4),
  ('a1b2c3d4-0003-4000-a000-000000000003', 'image', 'https://ik.imagekit.io/placeholder/bldg-before-1.jpg', true, 1),
  ('a1b2c3d4-0003-4000-a000-000000000003', 'image', 'https://ik.imagekit.io/placeholder/bldg-before-2.jpg', true, 2);
