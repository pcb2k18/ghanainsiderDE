-- Fix posts with null published_at dates
-- This migration updates all published posts that have null published_at
-- to use their created_at date instead

-- Update published posts with null published_at to use created_at
UPDATE posts
SET published_at = created_at
WHERE status = 'published'
  AND published_at IS NULL
  AND created_at IS NOT NULL;

-- For any remaining posts with both dates null, set to current timestamp
UPDATE posts
SET
  published_at = NOW(),
  created_at = COALESCE(created_at, NOW())
WHERE status = 'published'
  AND published_at IS NULL;

-- Add a comment explaining the fix
COMMENT ON COLUMN posts.published_at IS 'Date when the post was published. Set automatically when status changes to published.';
