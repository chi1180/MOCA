-- Migration: Add stop_type column to stops table
-- This column stores the type of stop: 'get_on', 'get_off', or 'get_on_off'

-- Add stop_type column with default value 'get_on_off'
ALTER TABLE stops
ADD COLUMN stop_type VARCHAR(20) DEFAULT 'get_on_off' NOT NULL;

-- Add a check constraint to ensure valid values
ALTER TABLE stops
ADD CONSTRAINT stops_stop_type_check
CHECK (stop_type IN ('get_on', 'get_off', 'get_on_off'));

-- Add a comment for documentation
COMMENT ON COLUMN stops.stop_type IS 'Type of stop: get_on (boarding only), get_off (alighting only), get_on_off (both)';
