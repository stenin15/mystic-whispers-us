-- O bucket palm-reports é público e tinha uma policy de SELECT ampla para o role
-- `public`, o que permitia a qualquer pessoa LISTAR e baixar todos os relatórios
-- de clientes. Hoje o bucket está vazio, então isto é preventivo — ele se enche
-- de material de cliente assim que o funil rodar.
--
-- O bucket precisa continuar público: generate-palm-report-preview e
-- generate-palm-report-full servem os relatórios via getPublicUrl(). Buckets
-- públicos entregam o objeto por URL direta sem passar por RLS, então esta
-- policy não é necessária para a entrega — ela só habilita a enumeração.
--
-- service_role_palm_reports (ALL para service_role) permanece intacta: é por ela
-- que as Edge Functions gravam.

DROP POLICY IF EXISTS public_read_palm_reports ON storage.objects;
