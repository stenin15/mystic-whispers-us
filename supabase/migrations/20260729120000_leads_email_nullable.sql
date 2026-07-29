-- leads.email era NOT NULL, mas o formulário (src/pages/Formulario.tsx) só coleta
-- nome e idade — nunca envia email. Toda inserção violava a constraint e falhava,
-- silenciada por um .catch(() => {}). Resultado: 31 pessoas passaram pelo funil
-- entre 20/05 e 08/06 e nenhum lead foi gravado.
--
-- Tornar a coluna nullable faz o lead ser salvo com nome + UTM + angle/focus,
-- o que recupera a atribuição de campanha. Coletar email no formulário é uma
-- decisão de produto separada; se for feita, o email simplesmente passa a vir
-- preenchido sem precisar de nova migração.

ALTER TABLE public.leads ALTER COLUMN email DROP NOT NULL;
