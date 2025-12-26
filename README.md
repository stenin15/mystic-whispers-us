# 🔮 Sussurros Místicos - Leitura de Mãos Espiritual

Uma aplicação moderna e imersiva para leitura de mãos (quiromancia) que combina tecnologia com espiritualidade, oferecendo uma experiência personalizada e envolvente para autoconhecimento.

## ✨ Sobre o Projeto

**Sussurros Místicos** é uma plataforma completa de leitura de mãos que oferece:

- 🎥 **VSL (Video Sales Letter)** - Apresentação inicial
- 📝 **Formulário Personalizado** - Coleta de informações do usuário
- 🧩 **Quiz Energético** - Questionário interativo com áudio
- 🔮 **Análise Espiritual** - Processamento com IA e geração de leitura personalizada
- 💳 **Checkout** - Integração com CartPanda para pagamentos
- 🎨 **Interface Mística** - Design moderno com animações e efeitos visuais

## 🚀 Tecnologias Utilizadas

- **Frontend:**
  - React 18 + TypeScript
  - Vite (build tool)
  - React Router (roteamento)
  - Framer Motion (animações)
  - Tailwind CSS (estilização)
  - shadcn/ui (componentes UI)
  - Zustand (gerenciamento de estado)

- **Backend:**
  - Supabase (banco de dados, autenticação, edge functions)
  - Edge Functions para:
    - Análise de palma da mão (IA)
    - Text-to-Speech (geração de áudio)
    - Envio de emails de boas-vindas

- **Integrações:**
  - CartPanda (checkout/pagamentos)
  - Google Fonts (Playfair Display, Inter)

## 📋 Pré-requisitos

- Node.js 18+ e npm/yarn/pnpm
- Conta no Supabase
- Conta no CartPanda (para checkout)

## 🛠️ Instalação e Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/stenin15/mystic-whispers.git
cd mystic-whispers
```

### 2. Instale as dependências

```bash
npm install
# ou
yarn install
# ou
pnpm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id

# CartPanda (Checkout)
VITE_CARTPANDA_CHECKOUT_BASIC_URL=your_basic_checkout_url
VITE_CARTPANDA_CHECKOUT_COMPLETE_URL=your_complete_checkout_url

# VSL Video (opcional)
VITE_VSL_VIDEO_URL=your_video_url
```

### 4. Configure o Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Configure as Edge Functions necessárias:
   - `palm-analysis` - Para análise de palma da mão
   - `text-to-speech` - Para geração de áudio
   - `send-welcome-email` - Para envio de emails

### 5. Execute o projeto

```bash
npm run dev
```

O projeto estará disponível em `http://localhost:5173`

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
2. Configure as variáveis de ambiente no painel da Vercel
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

## 📞 Suporte

Para suporte, entre em contato através do repositório ou email.

---

**Desenvolvido com ❤️ e magia** ✨
