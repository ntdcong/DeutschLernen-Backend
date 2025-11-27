-- Migration: Add Public Sharing Fields to Decks Table
-- Description: Adds fields to support public deck sharing with unique tokens

-- Add public_share_token column (unique, nullable)
ALTER TABLE decks 
ADD COLUMN public_share_token VARCHAR(255) NULL UNIQUE;

-- Add is_public_shareable column (boolean, default false)
ALTER TABLE decks 
ADD COLUMN is_public_shareable BOOLEAN NOT NULL DEFAULT FALSE;

-- Add public_share_enabled_at column (timestamp, nullable)
ALTER TABLE decks 
ADD COLUMN public_share_enabled_at TIMESTAMP NULL;

-- Create index on public_share_token for faster lookups
CREATE INDEX idx_decks_public_share_token ON decks(public_share_token);

-- Create index on is_public_shareable for filtering
CREATE INDEX idx_decks_is_public_shareable ON decks(is_public_shareable);

COMMENT ON COLUMN decks.public_share_token IS 'Unique UUID token for public sharing';
COMMENT ON COLUMN decks.is_public_shareable IS 'Whether this deck can be accessed via public link';
COMMENT ON COLUMN decks.public_share_enabled_at IS 'Timestamp when public sharing was enabled';
