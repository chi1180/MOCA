-- Migration: Refactor stops table schema
-- Changes:
-- 1. Rename stop_type to ability
-- 2. Replace is_base_point with type column
-- 3. Add tags column as TEXT array
-- 4. Update constraints

-- Step 1: Add new columns
ALTER TABLE stops
ADD COLUMN ability VARCHAR(20) DEFAULT 'get_on_off' NOT NULL,
ADD COLUMN type VARCHAR(20) DEFAULT 'traveling' NOT NULL,
ADD COLUMN tags TEXT[] DEFAULT '{}' NOT NULL;

-- Step 2: Migrate data from stop_type to ability
UPDATE stops SET ability = stop_type;

-- Step 3: Migrate data from is_base_point to type
UPDATE stops SET type = 'departure' WHERE is_base_point = true;
UPDATE stops SET type = 'arrival' WHERE is_base_point = false;

-- Step 4: Add constraints for new columns
ALTER TABLE stops
ADD CONSTRAINT stops_ability_check
CHECK (ability IN ('get_on', 'get_off', 'get_on_off'));

ALTER TABLE stops
ADD CONSTRAINT stops_type_check
CHECK (type IN ('departure', 'arrival', 'traveling'));

-- Step 5: Remove old constraints and columns
ALTER TABLE stops
DROP CONSTRAINT stops_stop_type_check;

ALTER TABLE stops
DROP COLUMN stop_type,
DROP COLUMN is_base_point;

-- Step 6: Add comments for documentation
COMMENT ON COLUMN stops.ability IS 'Boarding/alighting ability: get_on (boarding only), get_off (alighting only), get_on_off (both)';
COMMENT ON COLUMN stops.type IS 'Stop type in route: departure (starting point), arrival (ending point), traveling (waypoint)';
COMMENT ON COLUMN stops.tags IS 'Tags for categorizing stops (e.g., [''hospital'', ''central''])';
