# Design: marcador de leitura, salto orbital e mídia mista

Data: 2026-07-24
Repositório: `juparana-dev/cdmtimeline`
Escopo principal: `index.html`

## 1. Objetivo

Evoluir timeline do CDM com quatro capacidades:

1. Definir manualmente, no código, ponto atual da timeline por flag `lidoAteAqui: true`.
2. Ao clicar logo CDM central da órbita, executar animação curta de viagem espacial e navegar até marco atual.
3. Aplicar estética de conteúdo já visto em todos itens anteriores ao marcador.
4. Suportar mídia `webp` e vídeo `mp4`, com reprodução somente no modal.

Também adicionar marcos de 16/07, 21/07 e 23/07. Marco de 23/07 usa vídeo.

## 2. Não objetivos

- Não criar painel administrativo para escolher marcador.
- Não persistir progresso por usuário.
- Não adicionar backend, DB ou armazenamento externo.
- Não incluir libs externas de animação.
- Não reproduzir vídeo diretamente no card.
- Não habilitar áudio automático.
- Não refatorar projeto além do necessário ao recurso.

## 3. Estado atual relevante

- Timeline é gerada por array manual dentro de `renderVals()`.
- Caminho da imagem é inferido como `assets/timeline-XX.webp`.
- Card renderiza somente `<img>`.
- Modal renderiza somente imagem.
- Logo CDM central da órbita é visual, sem interação.
- Destaque do item no centro da viewport já usa atributos `data-marco-*` e atualização em `requestAnimationFrame`.

## 4. Abordagem escolhida

Manter app atual e enriquecer modelo dos marcos. Evitar reescrita completa.

Cada marco passa a declarar mídia e estado manualmente. Funções centrais calculam:

- `jaLido`
- `marcador`
- `normal`

Também centralizam abertura do modal e execução do salto orbital.

## 5. Modelo de dados

Substituir arrays posicionais por objetos explícitos:

```js
const dados = [
  {
    data: "14/07",
    rotulo: "Busca",
    titulo: "Busca e acompanhamento aprimorados",
    texto: "Pesquisa de similares, navegação e histórico do aprovador foram refinados, ampliando prevenção de duplicidade e visibilidade.",
    media: {
      type: "image",
      src: "assets/timeline-17.webp"
    },
    lidoAteAqui: true
  },
  {
    data: "16/07",
    rotulo: "Evolução",
    titulo: "Marco de 16/07",
    texto: "Conteúdo temporário para revisão posterior.",
    media: {
      type: "image",
      src: "assets/timeline-18.webp"
    }
  },
  {
    data: "21/07",
    rotulo: "Evolução",
    titulo: "Marco de 21/07",
    texto: "Conteúdo temporário para revisão posterior.",
    media: {
      type: "image",
      src: "assets/timeline-19.webp"
    }
  },
  {
    data: "23/07",
    rotulo: "Demonstração",
    titulo: "Marco de 23/07",
    texto: "Conteúdo temporário para revisão posterior.",
    media: {
      type: "video",
      src: "assets/timeline-20.mp4",
      poster: "assets/timeline-20.webp"
    }
  }
];
```

Regras:

- Exatamente um item deve usar `lidoAteAqui: true`.
- Nenhum marcador: manter todos como `normal`, desabilitar navegação orbital e emitir `console.warn`.
- Mais de um marcador: usar primeiro, emitir `console.warn` e não quebrar página.
- Não inferir tipo pela extensão. Usar `media.type` como fonte autoritativa.
- `poster` é obrigatório para vídeo.

## 6. Cálculo de estado visual

```js
const markerIndexes = dados
  .map((item, index) => item.lidoAteAqui === true ? index : -1)
  .filter((index) => index >= 0);

const indiceMarcador = markerIndexes[0] ?? -1;

const status = indiceMarcador === -1
  ? "normal"
  : index < indiceMarcador
    ? "jaLido"
    : index === indiceMarcador
      ? "marcador"
      : "normal";
```

Cada artigo recebe:

```html
<article
  data-marco="true"
  data-marco-status="{{ m.status }}"
  data-marco-atual="{{ m.ehMarcador }}"
  tabindex="-1"
>
```

## 7. Estados da timeline

### 7.1 `jaLido`

Aplicar somente aos itens anteriores ao marcador:

- mídia com `filter: grayscale(1) saturate(.35)`
- opacidade visual aproximada de `0.68`
- data, rótulo, título, texto e ponto central em tons neutros
- borda de destaque central continua funcional, mas sem recuperar saturação total
- modal continua disponível
- hover continua disponível
- transições de `filter`, `opacity`, `color` e `transform`

Não ocultar nem reduzir legibilidade abaixo de contraste aceitável.

### 7.2 `marcador`

- manter cores normais
- usar `data-marco-atual="true"`
- sem badge ou texto novo
- chegada orbital adiciona classe temporária `marco-chegada`
- ponto central executa dois pulsos
- card recebe glow curto

### 7.3 `normal`

- itens posteriores mantêm estética atual
- sem filtro cinza
- sem destaque persistente

## 8. Logo CDM como controle

Transformar contêiner central do logo em botão sem alterar composição visual:

```html
<button
  type="button"
  aria-label="Ir até marco atual"
  onClick="{{ viajarAteMarcador }}"
  data-orbit-trigger="true"
>
```

Comportamento:

- clique, `Enter` e `Space` disparam ação
- cursor `pointer`
- hover: escala leve `1.04` e glow verde/dourado
- foco visível por teclado
- durante viagem, `disabled` lógico e visual discreto
- cliques repetidos ignorados

## 9. Salto orbital

### 9.1 Fase 1 - preparação

Duração aproximada: 450 ms.

- acelerar órbitas por classe `orbit-traveling`
- aumentar glow do logo
- aplicar escala leve ao núcleo
- exibir overlay de estrelas com baixa opacidade
- sem bloquear ponteiro fora do botão

### 9.2 Fase 2 - deslocamento

Duração aproximada: 1.300 ms desktop e 900 ms mobile.

Usar `requestAnimationFrame` e easing:

```js
const easeInOutCubic = (t) =>
  t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
```

Destino:

```js
const targetY =
  window.scrollY +
  marker.getBoundingClientRect().top -
  (window.innerHeight - marker.offsetHeight) / 2;
```

Regras:

- recalcular destino no início da fase 2
- limitar destino entre `0` e altura máxima da página
- manter timeline visível durante percurso
- partículas com movimento vertical e leve streak
- sem túnel agressivo
- sem blur pesado
- sem flash

### 9.3 Fase 3 - chegada

Duração aproximada: 500 ms.

- dissolver overlay
- restaurar velocidades orbitais
- adicionar `marco-chegada`
- executar dois pulsos no ponto
- exibir glow no card
- focar artigo com `focus({ preventScroll: true })`
- remover classe temporária após animação
- liberar novo clique

Duração total alvo: até 2,2 s desktop e até 1,6 s mobile.

### 9.4 Limpeza e falhas

Implementar fluxo com `try/finally` ou limpeza equivalente:

- marcador ausente: `console.warn`, não animar
- elemento não renderizado: abortar e limpar estado
- exceção durante scroll: remover overlay e classes
- desmontagem do componente: cancelar `requestAnimationFrame`, `setTimeout` e listeners

## 10. Acessibilidade e redução de movimento

Para `prefers-reduced-motion: reduce`:

- sem overlay
- sem partículas
- sem aceleração das órbitas
- usar `scrollIntoView({ block: "center" })`
- focar marcador
- manter navegação por teclado

Overlay deve usar `aria-hidden="true"` e `pointer-events:none`.

## 11. Mídia mista

### 11.1 Imagem

- manter `.webp`
- card usa `<img>`
- modal usa `<img>`
- fallback atual pode ser reaproveitado e generalizado

### 11.2 Vídeo no card fechado

Vídeo não deve rodar no card.

Renderizar poster como imagem estática:

- mesma proporção `3/2`
- mesmo `object-fit: cover`
- ícone play discreto no centro
- clique abre modal
- sem `<video autoplay>` no card

Uso de `<video preload="metadata">` no card é desnecessário. Preferir somente poster para evitar tráfego e reprodução acidental.

### 11.3 Vídeo no modal

Renderizar:

```html
<video
  src="assets/timeline-20.mp4"
  poster="assets/timeline-20.webp"
  autoplay
  loop
  muted
  playsinline
  preload="metadata"
>
```

Regras:

- iniciar somente após abertura do modal
- rodar em loop
- permanecer mudo
- sem controles nativos
- clique no player não fecha modal
- clique no backdrop fecha
- `Escape` fecha
- fechamento chama `pause()` e redefine `currentTime = 0`
- desmontagem remove player junto com estado do modal

### 11.4 Erro de vídeo

Se `.mp4` falhar:

- pausar player
- ocultar player quebrado
- mostrar poster
- exibir texto discreto `Vídeo indisponível`
- não deixar mensagem nativa do navegador exposta

## 12. Estado do modal

Renomear conceitos de imagem para mídia:

```js
state = {
  aberto: null,
  isTraveling: false,
  videoErro: false
};
```

Funções:

- `abrirMidia(marco)`
- `fecharModal()`
- `pararClique(event)`
- `viajarAteMarcador()`
- `renderModalMedia()`

Ao abrir nova mídia, redefinir `videoErro: false`.

## 13. Novos assets esperados

- `assets/timeline-18.webp`
- `assets/timeline-19.webp`
- `assets/timeline-20.mp4`
- `assets/timeline-20.webp` como poster

O recurso deve manter fallback visual enquanto algum asset ainda não existir.

## 14. Organização de código

Manter mudança concentrada em `index.html`, seguindo arquitetura atual.

Separar dentro de `Component`:

- validação do marcador
- normalização dos dados
- abertura e fechamento de mídia
- renderização do modal
- animação orbital
- limpeza de recursos

Não editar `support.js`, pois arquivo é gerado.

## 15. Testes manuais obrigatórios

### Marcador

- 1 marcador em 14/07
- itens anteriores ficam cinza
- 14/07 permanece colorido
- posteriores permanecem coloridos
- 0 marcadores não quebra página
- 2 marcadores usam primeiro e avisam no console

### Navegação orbital

- clique no logo leva ao 14/07
- animação termina com item centralizado
- dois cliques rápidos não duplicam animação
- teclado funciona
- foco termina no artigo
- mobile não apresenta travamento
- `prefers-reduced-motion` elimina efeitos extras

### Imagem

- card abre modal
- clique fora fecha
- `Escape` fecha
- imagem ausente exibe fallback

### Vídeo

- card fechado não reproduz
- modal inicia vídeo automaticamente
- vídeo fica mudo
- vídeo roda em loop
- clique fora pausa e zera
- `Escape` pausa e zera
- reabrir começa em `0`
- erro do `.mp4` mostra poster e `Vídeo indisponível`

### Regressão

- destaque por scroll continua funcional
- borda ativa continua acompanhando item central
- imagens anteriores continuam abrindo
- layout desktop e mobile permanece estável
- GitHub Pages carrega assets por caminhos relativos

## 16. Critérios de aceite

Implementação aprovada quando:

1. `14/07` está marcado por `lidoAteAqui: true`.
2. Todos itens anteriores aparecem como já vistos.
3. Marcador e itens posteriores mantêm cores normais.
4. Clique no logo executa salto orbital elegante e centraliza marcador.
5. Animação respeita redução de movimento.
6. `16/07` e `21/07` usam imagem.
7. `23/07` usa `mp4` e poster.
8. Vídeo só roda no modal, em loop e mudo.
9. Fechar modal pausa e zera vídeo.
10. Nenhuma lib externa é adicionada.
11. `support.js` não é editado.
12. Página continua compatível com GitHub Pages.
