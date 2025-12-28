-- Garantir RLS ligada
ALTER TABLE palm_readings ENABLE ROW LEVEL SECURITY;

-- Apagar TODAS as policies de SELECT
DROP POLICY IF EXISTS "service_can_read" ON palm_readings;
DROP POLICY IF EXISTS "public_read" ON palm_readings;
DROP POLICY IF EXISTS "allow_read" ON palm_readings;
DROP POLICY IF EXISTS "read" ON palm_readings;

-- Recriar apenas INSERT (para anon enviar)
DROP POLICY IF EXISTS "allow_insert_only" ON palm_readings;
CREATE POLICY "allow_insert_only"
ON palm_readings
FOR INSERT
TO anon
WITH CHECK (true);

-- Garantir que NINGUÉM público tenha permissão de SELECT
REVOKE SELECT ON TABLE palm_readings FROM anon;
REVOKE SELECT ON TABLE palm_readings FROM authenticated;