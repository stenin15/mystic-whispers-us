-- Remover políticas antigas inseguras
DROP POLICY IF EXISTS "Anyone can insert palm readings" ON palm_readings;
DROP POLICY IF EXISTS "Anyone can read palm readings" ON palm_readings;
DROP POLICY IF EXISTS "public_read" ON palm_readings;
DROP POLICY IF EXISTS "public_access" ON palm_readings;

-- Criar política segura de INSERT (anon pode enviar, mas não ler)
CREATE POLICY "allow_insert_only"
ON palm_readings
FOR INSERT
TO anon
WITH CHECK (true);

-- Criar política de SELECT SOMENTE para service role
CREATE POLICY "service_can_read"
ON palm_readings
FOR SELECT
TO service_role
USING (true);

-- Bloquear UPDATE e DELETE públicos
REVOKE UPDATE, DELETE ON palm_readings FROM anon;