-- ============================================================
-- EXPIRATION & TRACKING COLUMNS
-- ==========================================================--

-- Add expiration tracking to greetings (already exists, but included for completeness)
ALTER TABLE public.greetings ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITHOUT TIME ZONE;

-- Add soft delete column (from original plan - marks greetings as deleted but keeps them accessible)
ALTER TABLE public.greetings ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- Add permanent preservation column (new - marks greetings to never auto-delete)
ALTER TABLE public.greetings ADD COLUMN IF NOT EXISTS is_permanent BOOLEAN DEFAULT FALSE;

-- Add file size tracking to videos table (for R2 storage calculation)
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS size_bytes BIGINT DEFAULT 0;

-- ============================================================
-- INITIAL MIGRATION: SET EXPIRATIONS & MARK PERMANENT GREETINGS
-- ==========================================================--

-- Step 1: Give ALL existing greetings 3-day expiration from now
UPDATE public.greetings 
SET expires_at = NOW() + INTERVAL '3 days'
WHERE expires_at IS NULL;

-- Step 2: Mark max-scan-count greetings as PERMANENT (preserved forever)
-- Use your existing logic to identify which greetings to keep (max scans per user)
UPDATE greetings
SET is_permanent = TRUE
WHERE id IN (
    SELECT DISTINCT ON (g.user_id) g.id
    FROM greetings g
    LEFT JOIN qr_codes qc ON g.video_id = qc.video_id
    WHERE g.is_deleted = FALSE
    GROUP BY g.id, g.user_id, qc.scan_count, g.created_at
    ORDER BY g.user_id, COALESCE(qc.scan_count, 0) DESC, g.created_at DESC
);

-- Step 3: Optional - Soft delete old greetings that aren't the "keepers"
-- This marks them as deleted but keeps them in DB for reference/recovery
UPDATE greetings
SET is_deleted = TRUE
WHERE id NOT IN (
    SELECT DISTINCT ON (g.user_id) g.id
    FROM greetings g
    LEFT JOIN qr_codes qc ON g.video_id = qc.video_id
    WHERE g.is_deleted = FALSE
    GROUP BY g.id, g.user_id, qc.scan_count, g.created_at
    ORDER BY g.user_id, COALESCE(qc.scan_count, 0) DESC, g.created_at DESC
)
AND is_deleted = FALSE;

-- ============================================================
-- ADMIN / CLEANUP LOGIC (run via worker or admin endpoint)
-- ==========================================================--

-- Soft delete greetings past 3 days (but within 7-day grace period)
-- This sets is_deleted = TRUE, showing "Expired" badge in dashboard
UPDATE greetings
SET is_deleted = TRUE
WHERE is_deleted = FALSE 
  AND expires_at < NOW() 
  AND expires_at >= NOW() - INTERVAL '4 days';

-- Hard delete greetings past 7 days (permanently removes + R2 video deletion)
-- Only delete non-permanent greetings
DELETE FROM greetings
WHERE is_permanent = FALSE
  AND is_deleted = TRUE
  AND expires_at < NOW() - INTERVAL '4 days';

-- Delete R2 videos for hard-deleted greetings (skip permanent videos)
-- Delete from R2 only if video is not marked permanent
-- (This would be in your C# cleanup worker, not pure SQL)
-- Example: DELETE FROM videos WHERE id IN (<list from deleted greetings>) AND is_permanent = FALSE;

-- Clean up orphaned videos (not used by any remaining greeting)
DELETE FROM videos 
WHERE id NOT IN (SELECT DISTINCT video_id FROM greetings WHERE video_id IS NOT NULL);

-- ============================================================
-- INDEXES FOR ADMIN QUERIES (optional but recommended)
-- ==========================================================--

CREATE INDEX idx_greetings_is_permanent ON public.greetings(is_permanent);
CREATE INDEX idx_greetings_is_deleted ON public.greetings(is_deleted);
CREATE INDEX idx_greetings_expires_at ON public.greetings(expires_at);