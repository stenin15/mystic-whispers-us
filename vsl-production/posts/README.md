# 📅 Posts — Madam Aurora Content Calendar

## Estrutura de Pastas

```
posts/
├── schedule.json          ← Calendário completo (editar para mudar legendas)
├── SEMANA_RESUMO.md       ← Gerado por aurora_organizer.py
├── 2026-06-10/
│   ├── 07h00/
│   │   ├── post.md        ← Legenda + instruções prontas
│   │   └── hook_feminine_energy.png  ← Imagem (se disponível)
│   ├── 09h00/
│   └── ...
├── 2026-06-11/
└── ...
```

---

## Workflow Diário (10 min/dia)

### Manhã (preparação)
```bash
cd vsl-production/
python aurora_organizer.py hoje   # Ver todos os posts do dia
```

### Postagem
1. Abrir a pasta `posts/HOJE/HHhMM/`
2. Ver `post.md` — legenda já está lá, copiar e colar
3. Pegar a imagem da mesma pasta
4. Postar na plataforma certa no horário certo

### Geração de novas imagens (quando precisar)
```bash
# Gera 12 variações de texto em qualquer imagem base:
python aurora_overlay.py minha_imagem_base.jpg

# Depois organiza nas pastas:
python aurora_organizer.py
```

---

## Horários Otimizados (US Eastern Time)

| Horário EST | Por quê |
|------------|---------|
| 07h00 | Morning scroll — maior alcance orgânico |
| 09h00 | Commute / coffee — alto engajamento |
| 12h00 | Almoço — carrosseis perfeitos aqui |
| 15h00 | Afternoon slump — relatable content |
| 18h00 | After work — prime time começa |
| 20h00 | Prime time — maior audiência ativa |
| 21h00 | Peak TikTok — melhor para conversão |
| 22h00 | Late scroll Instagram |
| 23h00 | Pré-sono — hooks curtos |

---

## Semanas 2-4: Rotação de Hooks

Toda segunda-feira, pegar 10 novos hooks de `content/HOOKS_50.md`
e atualizar `schedule.json`. As imagens base são as mesmas —
só muda o texto via `aurora_overlay.py`.

**Custo:** R$0 extra por semana depois da configuração inicial.

---

## Quando Escalar para Ad Pago

| Sinal | Ação |
|-------|------|
| Save rate > 5% | Criar Spark Ad com $5/dia |
| 10k+ views em 24h | Duplicar como dark post no Meta |
| Comments > 50 com dor real | Responder todos + boost $10 |
| CTR > 2% (se já rodando ad) | Aumentar budget 20% |
