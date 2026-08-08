# Briefing — narração do criativo v4 (ElevenLabs)

**Vídeo:** `creatives/madam-aurora-called-me-out-v4.mp4` — 23,1s, 9:16
**Entrega:** **um único arquivo de áudio** com as 7 falas na ordem
**Uso:** anúncio pago no TikTok, público feminino nos EUA, 25–54 anos

---

## Um arquivo só, com pausas entre as falas

Gere tudo numa **única passada**. Assim o ElevenLabs mantém a entonação
atravessando as frases — sete gerações separadas soariam picotadas, cada uma
começando com a mesma energia inicial, e isso denuncia que é IA.

**O requisito que torna isso possível:** deixe uma **pausa clara de ~0,7 segundo
entre uma fala e outra**. No campo de texto, separe cada fala por uma **linha em
branco**. Essas pausas são o que permite fatiar e alinhar o áudio ao vídeo depois.

Sem as pausas, o áudio vira um bloco contínuo e não há como sincronizar com os
cortes.

**Nome do arquivo:** `narracao-v4.mp3`

---

## A voz

| Critério | Valor |
|---|---|
| Gênero | **Feminino** — obrigatório, sem exceção |
| Sotaque | **American** |
| Idade que aparenta | 30–45 |
| Tom | Conversa com uma amiga, levemente surpresa |
| O que evitar | Voz de locutora, propaganda, narração de documentário |

**O gênero não é preferência estética.** O roteiro é em 1ª pessoa ("eu deixei uma
IA ler minha mão") e o público é feminino. Voz masculina quebra a premissa no
primeiro segundo e invalida o criativo inteiro.

Na biblioteca do ElevenLabs, filtre por **Female + American**, e prefira vozes
marcadas como *conversational* ou *social media* em vez de *narration*.

---

## Configurações no ElevenLabs

| Parâmetro | Valor | Motivo |
|---|---|---|
| Modelo | o de **maior qualidade** para inglês (Multilingual v2 ou superior) | Não use Turbo/Flash — trocam qualidade por velocidade |
| Stability | **40–50%** | Abaixo disso fica instável; acima fica robótico |
| Similarity | **~75%** | |
| Style exaggeration | **20–30%** | Dá emoção sem virar teatral |
| Speaker boost | **Ligado** | |
| Formato | **MP3 128 kbps ou superior**, ou WAV | |

⚠️ **Licença comercial.** O plano gratuito do ElevenLabs **não** dá direito de uso
comercial. Como isso vai virar anúncio pago, é obrigatório estar num plano pago
com licença comercial antes de gerar. Confirme isso antes de começar.

---

## O roteiro

**Não altere nenhuma palavra.** Cada frase foi escrita para descrever **a linha da
mão**, nunca a espectadora — é isso que mantém o anúncio dentro da regra de
*personal attributes* do TikTok. Trocar "my heart line" por "your heart line"
transforma um anúncio aprovável num reprovável.

### 01 — o gancho *(máx. 2,8s)*
```
I let an AI read my palm. It called me out.
```
Entrega: direta, quase divertida. É a frase que segura o scroll.

### 02 — o mecanismo *(máx. 2,5s)*
```
One photo of my hand. That's all it needed.
```
Entrega: casual, como quem explica algo simples.

### 03 — o quiz *(máx. 2,0s)*
```
Then seven quick questions.
```
Entrega: rápida, quase de passagem.

### 04 — a análise *(máx. 2,8s)*
```
And it read the actual lines on my palm.
```
Entrega: um pouco mais lenta. Ênfase leve em **actual**.

### 05 — a citação *(máx. 3,6s)*
```
It said my heart line curves downward. A deep sensitivity I carry within.
```
Entrega: mais baixa e mais lenta, como quem lê algo em voz alta. Pequena pausa
depois de "downward".

### 06 — o momento *(máx. 2,0s)*
```
I never told it any of that.
```
**Esta é a frase que vende.** Peça uma pausa curta antes de começar, e entrega
mais baixa — surpresa contida, não exclamação.

### 07 — a oferta *(máx. 3,2s)*
```
Nine ninety. One payment. Tap to try yours.
```
Entrega: clara e sem pressa. Nada de tom de vendedor.

---

## Checagem antes de entregar

- [ ] Voz **feminina** e **americana**
- [ ] **Um** arquivo, com as 7 falas na ordem
- [ ] **Pausa audível entre cada fala** (linha em branco entre elas no texto)
- [ ] Duração total entre **20 e 24 segundos**
- [ ] Nenhuma fala passou da duração máxima indicada
- [ ] Nenhuma palavra do roteiro foi alterada
- [ ] Plano com **licença comercial** ativo
- [ ] Ouviu tudo em fone: sem estalos, sem respiração cortada no início

Se alguma fala ficar acima do limite, **regenere com a mesma voz** em vez de
acelerar depois — áudio acelerado fica com timbre metálico e denuncia que é IA.

Se só uma fala sair ruim, dá para regenerar **só ela** e mandar como arquivo
extra, indicando o número. Não precisa refazer tudo.

---

## O que NÃO fazer

- Não entregue as falas grudadas, sem pausa entre elas
- Não use voz masculina
- Não adicione música — a música entra depois, no editor do TikTok
- Não adicione efeitos, reverb ou eco
- Não reescreva nenhuma frase, nem para "melhorar"
