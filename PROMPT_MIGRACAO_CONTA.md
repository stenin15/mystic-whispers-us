# Prompt — migrar a operação para a conta MADAM BR

Cole o bloco abaixo no Claude do navegador, com o TikTok Ads Manager aberto e
logado.

---

```
Você está no TikTok Ads Manager. A tarefa é preparar a conta de anúncios
"MADAM BR" para rodar uma campanha que hoje existe na conta "MADAM AURORA_adv".

CONTEXTO
As duas contas pertencem ao mesmo Business Center: MADAM AURORA_bc_vdmeqz
- Conta ORIGEM:  MADAM AURORA_adv   — ID 7666598491497594896
- Conta DESTINO: MADAM BR           — ID 7766608266818011157
- Pixel/dataset: MadamAurora_Web_US — ID D9KAQ53C77UD7F80GIT0
- Site: https://madam-aurora.co

A interface pode aparecer em português (o Chrome traduz). Equivalências:
Campaign=Campanha · Ad group=Grupo de anúncios · Ad=Anúncio ·
Website URL=URL do site · Creative assets=Recursos criativos ·
Automatic enhancements=Melhorias automáticas · Publish all=Publicar tudo

NÃO PUBLIQUE NADA. Ao final, deixe tudo em rascunho e reporte.

═══════════════════════════════════════════════════
ETAPA 1 — Compartilhar o pixel com a conta MADAM BR
═══════════════════════════════════════════════════

O pixel pertence ao Business Center, não à conta de anúncios. Ele NÃO deve ser
recriado nem transferido — apenas compartilhado. Recriar perderia todo o
histórico e quebraria a integração de servidor que já está funcionando.

1. Abra o Business Center (menu de aplicativos, canto superior esquerdo) e
   entre em MADAM AURORA_bc_vdmeqz.
2. Vá em Assets / Ativos → Events / Eventos (ou "Pixels").
3. Localize o dataset "MadamAurora_Web_US" (ID D9KAQ53C77UD7F80GIT0).
4. Abra as opções dele e escolha "Share" / "Assign" / "Compartilhar".
5. Selecione a conta de anúncios "MADAM BR" e conceda permissão de uso
   (Analyst/Operator ou equivalente — a permissão que permite usar em campanha).
6. Confirme.

VALIDAÇÃO obrigatória: troque a conta ativa para MADAM BR, abra
Ferramentas → Events Manager, e confirme que "MadamAurora_Web_US" aparece
listado. Se não aparecer, o compartilhamento não foi concluído — repita.

═══════════════════════════════════════════════════
ETAPA 2 — Compartilhar a Identity (a conta TikTok da marca)
═══════════════════════════════════════════════════

Os anúncios usam a identidade "Madam Aurora". Ela também precisa estar
disponível na conta nova.

1. Business Center → Assets → TikTok accounts / Identities.
2. Localize a identidade usada nos anúncios (nome de exibição "Madam Aurora").
3. Compartilhe com a conta MADAM BR.

Se não existir identidade compartilhável, reporte — o dono decide se cria uma
Custom Identity na conta nova.

═══════════════════════════════════════════════════
ETAPA 3 — Conferir a conta MADAM BR antes de montar
═══════════════════════════════════════════════════

Com a conta MADAM BR ativa, verifique e REPORTE:

a) Moeda da conta (USD ou BRL?) — muda a leitura de custo.
b) Fuso horário da conta.
c) Existe método de pagamento válido cadastrado?
d) A conta está com algum aviso, restrição ou pedido de verificação?
e) Já existe alguma campanha nela? Se sim, liste nome e status (não altere).

Reporte estes cinco itens ANTES de seguir para a Etapa 4.

═══════════════════════════════════════════════════
ETAPA 4 — Montar a campanha em MADAM BR
═══════════════════════════════════════════════════

CAMPANHA
- Objetivo: Website Conversions (aparece como "Sales" / "Vendas")
- Destino de vendas: Site (NÃO "Loja do TikTok", NÃO "Aplicativo")
- Campanha de busca: DESLIGADA
- Nome: MW-US-Palm-Cold-02
- Budget strategy: "Ad group budget" (NÃO "Campaign budget" — CBO desligado)
- Total limit for all ad groups: deixar VAZIO
- Special ad categories: nenhuma

AD GROUP
- Nome: AG-US-W25-54-Broad
- Optimization location: Website
- Optimization goal: Conversion
- Data connection / Pixel: MadamAurora_Web_US
- Evento de otimização: Initiate checkout
- Bid strategy: Maximum results (SEM valor de custo alvo, sem bid cap)
- Orçamento: Daily 20.00 USD (ou equivalente se a conta for BRL — reporte)
- Schedule: rodar continuamente
- Dayparting: desligado

SEGMENTAÇÃO — clicar em "Switch to manual targeting"
- Location: United States
- Ages: marcar SOMENTE 25-34, 35-44, 45-54
  (NUNCA marcar 13-17 nem 18-24 — a categoria exige piso de 18+)
- Genders: Female
- Languages: English
- Interests & behaviors: vazio
- Custom audiences: nenhuma

POSICIONAMENTO — o erro mais caro se errar
- Placement: Manual (não "Automatic")
- Deixar SOMENTE TikTok marcado
- DESMARCAR Pangle
- DESMARCAR Lemon8
- DESMARCAR Global App Bundle / News Feed App Series

OUTROS
- Allow video download: DESLIGADO
- Allow comments / organic comments / sharing: ligados

═══════════════════════════════════════════════════
ETAPA 5 — Os três anúncios
═══════════════════════════════════════════════════

Em TODOS os três:
- Identity: Madam Aurora
- "Only show as ads": MARCADO
- Call to action: SOMENTE "Learn more" (remover todos os outros — vem com
  "Apply now" e mais 9 por padrão)
- "This ad contains AI-generated content": MARCADO, e depois clicar em
  "Select creative assets" para designar o arquivo
- Automatic enhancements: TODAS DESLIGADAS. Tem que ficar "Turned on: None".
  As perigosas são "Translate and dub" (apaga a narração), "Music refresh"
  (troca a música) e "Resize" (corta as bordas onde ficam preço e disclaimer).
- Featured product / Product image / Product details / Promo code: VAZIOS
- Impression tracking URL e Click tracking URL: VAZIOS
- Um único texto por anúncio (o campo aceita no máximo 100 caracteres)
- A prévia tem que ficar em "1 / 1". Se aparecer "1 / 2" ou mais, parar e reportar.

─── ANÚNCIO 1 — vídeo ───
Nome: AD-video-called-me-out
Arquivo: madam-aurora-called-me-out-v4-voz.mp4
  (23 segundos, COM ÁUDIO. Se estiver mudo ou com outra duração, é arquivo
   errado — pare e reporte.)
URL:
https://madam-aurora.co?utm_source=tiktok&utm_medium=paid&utm_campaign=cold02&utm_content=video_calledout
Texto:
One photo of my hand. This is what the AI wrote back. $9.90. For entertainment only.

MÚSICA (só neste anúncio): o vídeo JÁ TEM NARRAÇÃO. Se adicionar música, ela
entra POR BAIXO da voz — faixa instrumental sem vocal da Commercial Music
Library, volume em 15–20%, sem mexer no volume original do vídeo. Se não for
possível controlar o volume, subir SEM música.

─── ANÚNCIO 2 — estático ───
Nome: AD-static-this-line
Arquivo: o estático "Most people never look at this line"
URL:
https://madam-aurora.co?utm_source=tiktok&utm_medium=paid&utm_campaign=cold02&utm_content=static_line
Texto:
One photo of your palm. An AI reads the lines that are there. $9.90. For entertainment only.

─── ANÚNCIO 3 — estático ───
Nome: AD-static-how-you-love
Arquivo: o estático "Curious what your palm says about how you love?"
URL:
https://madam-aurora.co?utm_source=tiktok&utm_medium=paid&utm_campaign=cold02&utm_content=static_love
Texto:
One photo of your palm. The AI describes the lines it sees. $9.90. For entertainment only.

CONFERÊNCIA VISUAL DOS ESTÁTICOS: nos dois, a tela do celular dentro da imagem
tem que estar CLARA, com aparência de pergaminho. Existem versões antigas com a
tela ESCURA mostrando um app com cards — essas reprovam na moderação. Se a tela
estiver escura, é o arquivo errado.

═══════════════════════════════════════════════════
PROIBIDO
═══════════════════════════════════════════════════

- Não publicar. Deixar tudo em rascunho.
- Não apagar, pausar nem alterar nada na conta MADAM AURORA_adv.
- Não recriar o pixel. Ele é do Business Center e só precisa ser compartilhado.
- Não usar o botão "Promover" do app do TikTok.
- Não reescrever os textos: eles foram validados contra as regras da categoria
  "Horoscope and fortune-telling" (restrita) e contra o limite de 100 caracteres.
- Não aceitar sugestões do painel direito ("Adicione 6 vídeos", "Aumente o
  orçamento", "Use segmentação automática").

═══════════════════════════════════════════════════
RELATÓRIO FINAL
═══════════════════════════════════════════════════

1. O pixel MadamAurora_Web_US aparece no Events Manager da conta MADAM BR? (sim/não)
2. A identidade "Madam Aurora" está disponível na conta nova? (sim/não)
3. Os cinco itens da Etapa 3 (moeda, fuso, pagamento, avisos, campanhas existentes)
4. Print de cada nível: campanha, ad group, e os três anúncios
5. Qualquer campo que você não conseguiu configurar como especificado, e o motivo
```

---

## Depois que ele terminar

Confira nos prints, nesta ordem de importância:

1. **Pixel** = `MadamAurora_Web_US` no ad group
2. **Evento** = Initiate checkout
3. **Pangle desmarcado**
4. **Idades** sem 13-17 e sem 18-24
5. **Automatic enhancements** = "Turned on: None" nos três anúncios
6. **Prévia 1 / 1** nos três
