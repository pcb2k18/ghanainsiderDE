-- Add Authors Table and Storage Bucket
-- Run this after the initial schema.sql

-- Create authors table
CREATE TABLE IF NOT EXISTS authors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  bio TEXT,
  avatar_url VARCHAR(500),
  is_default BOOLEAN DEFAULT FALSE,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add author_id to posts table
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES authors(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);

-- Add trigger for updated_at
CREATE TRIGGER update_authors_updated_at BEFORE UPDATE ON authors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default author
INSERT INTO authors (name, email, is_default, bio) VALUES
('Ghana Insider', 'redaktion@ghanainsider.com', true, 'Ghana Insider Redaktion')
ON CONFLICT (email) DO NOTHING;

-- Enable RLS
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;

-- Public can read authors
CREATE POLICY "Public can read authors" ON authors
    FOR SELECT USING (true);

-- Create storage bucket for images (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for post-images bucket
CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-images');

CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'post-images');

CREATE POLICY "Authenticated users can update their images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'post-images');

CREATE POLICY "Authenticated users can delete their images"
ON storage.objects FOR DELETE
USING (bucket_id = 'post-images');

-- Function to auto-assign default author
CREATE OR REPLACE FUNCTION assign_default_author()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.author_id IS NULL THEN
        SELECT id INTO NEW.author_id FROM authors WHERE is_default = true LIMIT 1;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-assign default author on post creation
CREATE TRIGGER auto_assign_author
    BEFORE INSERT ON posts
    FOR EACH ROW
    EXECUTE FUNCTION assign_default_author();

-- Update post_count when posts are created/deleted
CREATE OR REPLACE FUNCTION update_author_post_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE authors SET post_count = post_count + 1 WHERE id = NEW.author_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE authors SET post_count = post_count - 1 WHERE id = OLD.author_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.author_id != NEW.author_id THEN
        UPDATE authors SET post_count = post_count - 1 WHERE id = OLD.author_id;
        UPDATE authors SET post_count = post_count + 1 WHERE id = NEW.author_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_author_count
    AFTER INSERT OR UPDATE OR DELETE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_author_post_count();
