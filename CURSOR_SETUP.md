# Como Conectar o Cursor a Este Projeto

Este guia explica como configurar o **Cursor** (editor de código com IA) para trabalhar neste projeto e ver as alterações em tempo real.

---

## 📋 Pré-requisitos

1. **Cursor instalado** - Baixe em [cursor.sh](https://cursor.sh)
2. **Node.js 18+** - Baixe em [nodejs.org](https://nodejs.org)
3. **Git** - Para clonar o repositório

---

## 🔗 Passo 1: Conectar ao GitHub

Este projeto está sincronizado com o GitHub via Lovable. Para acessar o código:

1. No Lovable, clique em **GitHub** no canto superior direito
2. Se ainda não conectou, clique em **Connect to GitHub**
3. Autorize o Lovable GitHub App
4. Copie a URL do repositório criado

---

## 📥 Passo 2: Clonar o Repositório

Abra o terminal e execute:

```bash
git clone https://github.com/stenin15/mystic-whispers.git
cd mystic-whispers
```

---

## 📦 Passo 3: Instalar Dependências

```bash
npm install
```

---

## ⚙️ Passo 4: Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com:

```env
VITE_SUPABASE_URL=https://badpwouonnopuoovabtz.supabase.co
VITE_SUPABASE_ANON_KEY=<SUA_SUPABASE_ANON_KEY>
```

---

## 🚀 Passo 5: Rodar o Servidor de Desenvolvimento

```bash
npm run dev
```

O projeto estará disponível em: **http://localhost:5173**

---

## 🔄 Sincronização Bidirecional

O Lovable tem **sincronização automática** com o GitHub:

- ✅ Alterações feitas no **Cursor** → Push para GitHub → Sincroniza automaticamente no Lovable
- ✅ Alterações feitas no **Lovable** → Push automático para GitHub → Pull no Cursor

### Para enviar alterações do Cursor para o Lovable:

```bash
git add .
git commit -m "Descrição das alterações"
git push origin main
```

As alterações aparecerão no Lovable em segundos!

---

## 📁 Estrutura do Projeto

```
src/
├── components/     # Componentes React reutilizáveis
│   ├── ui/         # Componentes base (shadcn/ui)
│   ├── shared/     # Componentes compartilhados
│   ├── landing/    # Componentes da landing page
│   └── layout/     # Navbar, Footer, etc.
├── pages/          # Páginas da aplicação
├── hooks/          # Hooks personalizados
├── lib/            # Utilitários e helpers
├── store/          # Estado global (Zustand)
└── integrations/   # Integrações (Supabase)

supabase/
└── functions/      # Edge Functions (backend serverless)
```

---

## 🛠️ Tecnologias Principais

| Tecnologia | Uso |
|------------|-----|
| React 18 | Framework frontend |
| Vite | Build tool |
| TypeScript | Tipagem estática |
| Tailwind CSS | Estilização |
| shadcn/ui | Componentes base |
| Framer Motion | Animações |
| Zustand | Estado global |
| Supabase | Backend (DB, Auth, Edge Functions) |

---

## 💡 Dicas para o Cursor

1. **Use o chat do Cursor** para pedir alterações específicas
2. **Referência arquivos** usando `@` para dar contexto
3. **Peça refatorações** de código quando necessário
4. **Teste localmente** antes de fazer push

### Comandos Úteis:

```bash
npm run dev      # Desenvolvimento local
npm run build    # Build de produção
npm run preview  # Preview do build
```

---

## 🌐 Publicar Alterações

Após fazer push para o GitHub:

1. Acesse o Lovable
2. Verifique se as alterações sincronizaram
3. Clique em **Publish** para colocar em produção

**Produção (recomendado):** Vercel

---

## ⚠️ Importante

- **Não edite** `src/integrations/supabase/types.ts` (gerado automaticamente)
- **Não edite** `supabase/config.toml` diretamente
- **Secrets/API Keys** das Edge Functions devem ser configuradas no Supabase (Edge Functions → Secrets)

---

## 📞 Suporte

Para dúvidas sobre o Lovable: [docs.lovable.dev](https://docs.lovable.dev)
