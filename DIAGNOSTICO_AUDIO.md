# 🔍 DIAGNÓSTICO DE ÁUDIO DA IA

## 📍 ONDE O ÁUDIO É USADO

O áudio da IA é usado em **3 páginas**:
1. **Quiz** (`/quiz`) - Áudio das perguntas
2. **Analise** (`/analise`) - Áudio das fases da análise
3. **Resultado** (`/resultado`) - Áudio da leitura final

⚠️ **A página VSL (`/`) NÃO tem áudio** - é apenas uma landing page.

---

## ⚠️ PROBLEMAS COMUNS

### 1. Edge Function não deployada
A função `text-to-speech` precisa estar deployada no Supabase.

**Como verificar:**
- Acesse o Supabase Dashboard
- Vá em "Edge Functions"
- Verifique se `text-to-speech` está listada e com status "Active"

**Como deployar:**
```bash
# No terminal, na raiz do projeto:
npx supabase functions deploy text-to-speech
```

---

### 2. Variável de ambiente OPENAI_API_KEY não configurada
A edge function precisa da chave da API da OpenAI.

**Como configurar:**
1. Acesse o Supabase Dashboard
2. Vá em "Edge Functions" → "text-to-speech"
3. Clique em "Settings" ou "Environment Variables"
4. Adicione:
   - **Key:** `OPENAI_API_KEY`
   - **Value:** Sua chave da API da OpenAI (formato: `sk-...`)

**Como obter a chave:**
- Acesse https://platform.openai.com/api-keys
- Crie uma nova chave de API
- Copie a chave (ela começa com `sk-`)

---

### 3. Erro silencioso (mais comum)
O código captura erros silenciosamente. Verifique o console do navegador.

**Como verificar:**
1. Abra o DevTools (F12)
2. Vá na aba "Console"
3. Procure por erros como:
   - `TTS error:`
   - `Error generating voice message:`
   - `Audio generation failed`

**Se houver erro:**
- Verifique se a edge function está deployada
- Verifique se a `OPENAI_API_KEY` está configurada
- Verifique se você tem créditos na conta da OpenAI

---

### 4. Autoplay bloqueado pelo navegador
Alguns navegadores bloqueiam autoplay de áudio até que o usuário interaja com a página.

**Como resolver:**
- O usuário precisa **clicar em algum lugar da página** antes do áudio tocar
- Na página Quiz, há um modal de confirmação de áudio que deve ser aceito

---

## ✅ CHECKLIST DE DIAGNÓSTICO

1. [ ] Edge function `text-to-speech` está deployada?
2. [ ] Variável `OPENAI_API_KEY` está configurada no Supabase?
3. [ ] Você tem créditos na conta da OpenAI?
4. [ ] Abriu o console do navegador (F12) para ver erros?
5. [ ] Você está na página correta? (Quiz, Analise ou Resultado)
6. [ ] Interagiu com a página (clicou em algum lugar)?

---

## 🧪 TESTE RÁPIDO

1. Abra o DevTools (F12)
2. Vá na aba "Console"
3. Execute este código:
```javascript
// Teste se a função está acessível
fetch('https://uwoaqvviyfbbovfebmns.supabase.co/functions/v1/text-to-speech', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer SUA_SUPABASE_ANON_KEY'
  },
  body: JSON.stringify({
    text: 'Teste de áudio'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

Se retornar erro 404 ou 500, a função não está deployada ou há problema de configuração.

---

## 📝 NOTAS IMPORTANTES

- O áudio é gerado **sob demanda** - pode levar alguns segundos
- O áudio é **cacheado** - depois da primeira geração, é mais rápido
- Se a geração falhar, a página **continua funcionando** (fallback silencioso)
- Erros são **logados no console**, não aparecem para o usuário




