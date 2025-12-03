-- Add email field to clients table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'clients' 
        AND column_name = 'email'
    ) THEN
        ALTER TABLE clients ADD COLUMN email TEXT;
    END IF;
END $$;

