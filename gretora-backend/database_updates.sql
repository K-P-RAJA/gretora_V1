ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_accepted_policy BOOLEAN DEFAULT FALSE;

CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    greeting_id UUID NOT NULL
        REFERENCES greetings(id)
        ON DELETE CASCADE,

    reason VARCHAR(255) NOT NULL,

    details TEXT,

    reported_at TIMESTAMP WITH TIME ZONE
        DEFAULT CURRENT_TIMESTAMP,

    status VARCHAR(50)
        DEFAULT 'Pending',

    CONSTRAINT chk_report_status
        CHECK (status IN ('Pending', 'Reviewed', 'Rejected', 'Removed'))
);

-- Optional indexes for faster admin queries
CREATE INDEX idx_reports_greeting_id
ON reports(greeting_id);

CREATE INDEX idx_reports_status
ON reports(status);

CREATE INDEX idx_reports_reported_at
ON reports(reported_at DESC);

-- Admin Panel updates (is_admin and is_banned)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;

-- QR Codes Tracking Table
CREATE TABLE IF NOT EXISTS public.qr_codes (
  id uuid not null default gen_random_uuid (),
  video_id uuid null,
  watch_url text not null,
  scan_count integer null default 0,
  created_at timestamp without time zone null default now(),
  constraint qr_codes_pkey primary key (id)
);

-- QR Scan Logs Table for Country Analytics
CREATE TABLE IF NOT EXISTS public.scan_logs (
  id uuid not null default gen_random_uuid (),
  qr_id uuid null,
  scanned_at timestamp without time zone null default now(),
  country_code text null,
  constraint scan_logs_pkey primary key (id),
  constraint scan_logs_qr_id_fkey foreign KEY (qr_id) references public.qr_codes (id) ON DELETE CASCADE
);

-- Support Tickets Table
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  CONSTRAINT support_tickets_pkey PRIMARY KEY (id),
  CONSTRAINT chk_ticket_status CHECK (status IN ('Pending', 'Resolved'))
);



