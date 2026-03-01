-- ============================================
-- Imperium Developments - Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. HELPER FUNCTION: Auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- 2. BLOGS TABLE
-- ============================================
CREATE TABLE blogs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT NOT NULL UNIQUE,
  title_en        TEXT NOT NULL,
  title_ar        TEXT NOT NULL,
  video_url       TEXT,
  video_public_id TEXT,
  is_published    BOOLEAN NOT NULL DEFAULT true,
  display_order   INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for public blog listing (published, ordered)
CREATE INDEX idx_blogs_published_order ON blogs (is_published, display_order, created_at DESC);

-- Index for slug lookups
CREATE INDEX idx_blogs_slug ON blogs (slug);

-- Trigger: auto-update updated_at on row change
CREATE TRIGGER blogs_updated_at
  BEFORE UPDATE ON blogs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- ============================================
-- 3. BLOG_IMAGES TABLE
-- ============================================
CREATE TABLE blog_images (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id       UUID NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
  url           TEXT NOT NULL,
  file_id       TEXT NOT NULL,
  thumbnail_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fetching images by blog
CREATE INDEX idx_blog_images_blog_id ON blog_images (blog_id, display_order);


-- ============================================
-- 4. LEADS TABLE
-- ============================================
CREATE TABLE leads (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name    TEXT NOT NULL,
  company_name TEXT NOT NULL DEFAULT '',
  phone        TEXT NOT NULL,
  email        TEXT NOT NULL,
  project_type TEXT NOT NULL DEFAULT '',
  message      TEXT NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for admin dashboard listing
CREATE INDEX idx_leads_created_at ON leads (created_at DESC);


-- ============================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- BLOGS: anon can only read published blogs
CREATE POLICY "Public can read published blogs"
  ON blogs
  FOR SELECT
  TO anon
  USING (is_published = true);

-- BLOGS: service_role (admin) has full access
CREATE POLICY "Service role full access on blogs"
  ON blogs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- BLOG_IMAGES: anon can read images of published blogs only
CREATE POLICY "Public can read blog images"
  ON blog_images
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM blogs
      WHERE blogs.id = blog_images.blog_id
      AND blogs.is_published = true
    )
  );

-- BLOG_IMAGES: service_role has full access
CREATE POLICY "Service role full access on blog_images"
  ON blog_images
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- LEADS: anon can only insert (contact form submissions)
CREATE POLICY "Public can insert leads"
  ON leads
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- LEADS: service_role has full access (admin dashboard reads)
CREATE POLICY "Service role full access on leads"
  ON leads
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
