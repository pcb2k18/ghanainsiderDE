-- Ghana Insider Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table with template structures
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  template_structure JSONB NOT NULL,
  seo_defaults JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Posts table
CREATE TABLE posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image VARCHAR(500),
  category_id UUID REFERENCES categories(id),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  post_type VARCHAR(20) DEFAULT 'ai_assisted' CHECK (post_type IN ('ai_assisted', 'guest_post', 'manual')),
  seo_score INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  author_name VARCHAR(100),
  author_email VARCHAR(255),
  original_source TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SEO Metadata table
CREATE TABLE seo_metadata (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE UNIQUE,
  meta_title VARCHAR(70),
  meta_description VARCHAR(160),
  keywords TEXT[],
  schema_markup JSONB,
  canonical_url VARCHAR(500),
  og_image VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Guest Post Submissions table
CREATE TABLE guest_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_name VARCHAR(255),
  contact_email VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  target_keywords TEXT[],
  backlinks JSONB,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'published')),
  payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  amount DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Archive imports tracking
CREATE TABLE archive_imports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  archive_url VARCHAR(500) NOT NULL,
  original_url VARCHAR(500) NOT NULL,
  import_status VARCHAR(20) DEFAULT 'pending' CHECK (import_status IN ('pending', 'processing', 'completed', 'failed')),
  post_id UUID REFERENCES posts(id),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agency contacts for guest posts
CREATE TABLE agencies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  website VARCHAR(500),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blacklisted')),
  total_posts INTEGER DEFAULT 0,
  last_contact TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_posts_published ON posts(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_posts_featured ON posts(is_featured) WHERE status = 'published';

-- Insert default categories with templates
INSERT INTO categories (name, slug, description, template_structure, seo_defaults) VALUES
(
  'Tod/Nachruf',
  'tod',
  'Breaking news about celebrity deaths',
  '{
    "sections": [
      {"type": "intro", "title": null, "word_count": "150-200", "requirements": ["exact_keyword", "trending_context", "hook"]},
      {"type": "section", "title": "Todesursache von {name}", "word_count": "200-250", "requirements": ["cause", "date", "location"]},
      {"type": "section", "title": "{name} Familie: Partner und Kinder", "word_count": "150-200", "requirements": ["spouse", "children", "family_background"]},
      {"type": "section", "title": "Karriere und Vermächtnis von {name}", "word_count": "200-250", "requirements": ["career_highlights", "impact", "legacy"]}
    ],
    "title_template": "{name} Tod: {age}-Jähriger {profession} Verstorben",
    "slug_template": "{name}-tod-ursache-{year}",
    "nlp_terms": ["verstorben", "Todesursache", "Vermächtnis", "Karriere", "Familie", "Nachruf"]
  }',
  '{
    "meta_title_template": "{name} Tod: Ursache, Familie & Vermächtnis {year}",
    "meta_description_template": "{name} ist verstorben. Alles über die Todesursache, Familie und das Vermächtnis. Aktuelle Details hier.",
    "schema_type": ["NewsArticle", "Person"]
  }'
),
(
  'Hochzeit',
  'hochzeit',
  'Celebrity wedding news',
  '{
    "sections": [
      {"type": "intro", "title": null, "word_count": "150-200", "requirements": ["couple_names", "wedding_date", "location"]},
      {"type": "section", "title": "Die Hochzeit von {name1} und {name2}", "word_count": "200-250", "requirements": ["ceremony_details", "venue", "guests"]},
      {"type": "section", "title": "Liebesgeschichte: Wie sie sich kennenlernten", "word_count": "150-200", "requirements": ["how_they_met", "relationship_timeline"]},
      {"type": "section", "title": "Was wir über die Zukunft wissen", "word_count": "150-200", "requirements": ["future_plans", "quotes"]}
    ],
    "title_template": "{name1} und {name2} Hochzeit: Alle Details zur Traumhochzeit",
    "slug_template": "{name1}-{name2}-hochzeit-{year}",
    "nlp_terms": ["Hochzeit", "Trauung", "Braut", "Bräutigam", "Ehepaar", "Liebesgeschichte"]
  }',
  '{
    "meta_title_template": "{name1} & {name2} Hochzeit: Datum, Ort & alle Details {year}",
    "meta_description_template": "{name1} und {name2} haben geheiratet! Alle Infos zur Hochzeit, Location und Gäste.",
    "schema_type": ["NewsArticle", "Event"]
  }'
),
(
  'Breaking News',
  'breaking-news',
  'General breaking news and updates',
  '{
    "sections": [
      {"type": "intro", "title": null, "word_count": "150-200", "requirements": ["what_happened", "when", "where", "who"]},
      {"type": "section", "title": "Was ist passiert?", "word_count": "200-300", "requirements": ["detailed_account", "timeline"]},
      {"type": "section", "title": "Reaktionen und Stellungnahmen", "word_count": "150-200", "requirements": ["official_statements", "public_reaction"]},
      {"type": "section", "title": "Aktuelle Entwicklungen", "word_count": "100-150", "requirements": ["updates", "what_next"]}
    ],
    "title_template": "{headline}: {subheadline}",
    "slug_template": "{topic}-{year}",
    "nlp_terms": ["aktuell", "breaking", "Eilmeldung", "Update", "Entwicklung"]
  }',
  '{
    "meta_title_template": "{headline} - Aktuelle News {year}",
    "meta_description_template": "{summary} Alle aktuellen Informationen und Updates hier.",
    "schema_type": ["NewsArticle"]
  }'
),
(
  'Gastbeitrag',
  'gastbeitrag',
  'Guest posts from agencies',
  '{
    "sections": [
      {"type": "flexible", "min_sections": 3, "max_sections": 10}
    ],
    "title_template": "{custom}",
    "slug_template": "{custom}",
    "nlp_terms": []
  }',
  '{
    "meta_title_template": "{custom}",
    "meta_description_template": "{custom}",
    "schema_type": ["Article"]
  }'
);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seo_metadata_updated_at BEFORE UPDATE ON seo_metadata
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guest_submissions_updated_at BEFORE UPDATE ON guest_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agencies_updated_at BEFORE UPDATE ON agencies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE archive_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;

-- Public read access for published posts
CREATE POLICY "Public can read published posts" ON posts
    FOR SELECT USING (status = 'published');

-- Public can read categories
CREATE POLICY "Public can read categories" ON categories
    FOR SELECT USING (true);

-- Public can read SEO metadata for published posts
CREATE POLICY "Public can read seo for published posts" ON seo_metadata
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM posts 
            WHERE posts.id = seo_metadata.post_id 
            AND posts.status = 'published'
        )
    );

-- Note: Add authenticated user policies based on your auth setup
-- For admin access, you may want to use service role key or add user auth
