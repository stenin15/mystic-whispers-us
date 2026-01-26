# Mystic Whispers US (Vite + React + Supabase + Stripe)

This is a Vite + React + TypeScript app using Supabase Edge Functions for server-side logic.

## Payment architecture (Stripe)
Stripe is **server-side only**:
- The frontend calls an Edge Function to **create a Checkout Session** and redirects to `session.url`.
- Stripe **webhooks** write the final purchase to Postgres (`stripe_purchases`).
- The frontend unlocks delivery only after confirming entitlement via an Edge Function (`get-entitlement`).

## Requirements
- Node.js 18+
- A Supabase project
- A Stripe account

## Local setup
1) Install deps:

```bash
npm install
```

2) Create `.env` from `.env.example`:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

3) Run:

```bash
npm run dev
```

## Supabase (DB + Edge Functions)
### Migrations
Run migrations (including `stripe_purchases`) with your normal Supabase workflow.

### Edge Functions
This repo includes:
- `create-checkout-session`
- `stripe-webhook`
- `get-entitlement`
- plus existing functions (`palm-analysis`, `generate-reading`, etc.)

### Required Supabase secrets (server-side)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_BASIC`
- `STRIPE_PRICE_COMPLETE`
- `STRIPE_PRICE_GUIDE`
- `STRIPE_PRICE_UPSELL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Webhook endpoint (Stripe)
Create a webhook endpoint pointing to:
- `https://<project-ref>.functions.supabase.co/stripe-webhook`

Subscribe to events:
- `checkout.session.completed`
- `checkout.session.async_payment_failed`
- `charge.refunded`

## 📦 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Build
npm run build        # Build para produção
npm run build:dev    # Build em modo desenvolvimento

# Qualidade de código
npm run lint         # Executa ESLint

# Preview
npm run preview      # Preview do build de produção
```

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório GitHub à Vercel
2. Configure the frontend env vars on Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Build settings:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
4. O arquivo `vercel.json` já está configurado para SPA routing

### Outras plataformas

O projeto pode ser deployado em qualquer plataforma que suporte aplicações Vite/React:
- Netlify
- Cloudflare Pages
- AWS Amplify
- Railway

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── layout/         # Navbar, Footer
│   ├── shared/         # Componentes compartilhados
│   └── ui/             # Componentes shadcn/ui
├── pages/              # Páginas da aplicação
│   ├── VSL.tsx         # Video Sales Letter
│   ├── Formulario.tsx  # Formulário de dados
│   ├── Quiz.tsx         # Quiz energético
│   ├── Analise.tsx     # Análise em tempo real
│   ├── Checkout.tsx    # Seleção de planos
│   └── ...
├── hooks/              # Custom hooks
├── lib/                # Utilitários e helpers
├── store/              # Zustand store
├── integrations/      # Integrações (Supabase)
└── assets/            # Imagens e recursos estáticos
```

## 🎨 Características Principais

- ✨ **Design Místico**: Interface moderna com gradientes, animações e efeitos visuais
- 🎵 **Áudio Personalizado**: Text-to-speech com mensagens personalizadas
- 📸 **Upload de Fotos**: Análise de palma da mão via IA
- 🔒 **Proteção de Rotas**: Sistema de gate para controlar fluxo do usuário
- 📱 **Responsivo**: Totalmente adaptado para mobile e desktop
- ⚡ **Performance**: Otimizado com lazy loading e code splitting

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado e proprietário. Todos os direitos reservados.

## Support
Open an issue in the repo for support.
