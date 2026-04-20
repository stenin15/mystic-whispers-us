# Protocolo MJX — Claude Code Config

## Projeto
Funil de quiz para suplemento Protocolo MJX (gotas emagrecimento).
Stack: Next.js 14, TypeScript, Tailwind, Supabase, Vercel.
Dev server: `npm run dev` → http://localhost:3000

## Arquivos críticos
- `components/QuizResultClient.tsx` — página de resultado (principal)
- `components/quiz/QuizFlow.tsx` — quiz (7 perguntas)
- `lib/profiles.ts` — 4 perfis metabólicos + copy por perfil
- `lib/pixel.ts` — Meta Pixel + Google Ads tracking
- `app/quiz-resultado/page.tsx` — route do resultado
- `tailwind.config.js` — tokens de design
- `app/globals.css` — animações e estilos globais

## Design tokens
- Brand: `#FF6A1A` (laranja principal)
- Background: `#0D0D0D`
- Surface: `#161616`
- Card: `#1B1B1B`
- Border: `#2A2A2A`
- Text primário: `#F5F5F5`
- Text secundário: `#B8B8B8`

## 4 Perfis do quiz
1. **Metabolismo em Platô** — metabolismo adaptou, não responde mais
2. **Resistência Hormonal** — hormônios sabotando o processo
3. **Compulsão Metabólica** — fome e compulsão fora de controle
4. **Inflamação Crônica** — inchaço, retenção, inflamação sistêmica

## Tracking
- Meta Pixel ID: `1668583754590121`
- Eventos: PageView, ViewContent, Lead, CompleteRegistration, InitiateCheckout, Contact

## URLs
- Local: http://localhost:3000
- Produção: https://mounjax-phi.vercel.app
- Quiz: /quiz
- Resultado: /quiz-resultado?resultado=[perfil]&objetivo=[texto]
- Checkout: Braip (externo, UTM passthrough)

## Imagens do produto (public/)
- `Mounjax-1.jpg` — foto principal
- `Mounjax-2.jpg` — benefícios (fundo azul escuro)
- `Mounjax-3.png` — "onde o emagrecimento encontra seu metabolismo"
- `Mounjax-4.jpg` — benefícios com modelo (fundo roxo)

## Pendências críticas
1. Deploy Vercel com env vars completas
2. Aplicar schema.sql no Supabase Dashboard
3. Criar Facebook Page "Protocolo MJX"
4. Conectar pixel ao ad set 120240981202760780
