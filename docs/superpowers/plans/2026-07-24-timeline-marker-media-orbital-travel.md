# Timeline Marker, Mixed Media, and Orbital Travel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a manually configured reading marker, previously-read styling, mixed image and MP4 media, and an elegant orbital navigation animation from the CDM logo to the current timeline marker.

**Architecture:** Keep the current static, single-page architecture. Enrich the timeline data inside `index.html`, derive visual state from one `lidoAteAqui: true` flag, render cards and modal content from explicit media metadata, and implement the orbital trip with CSS plus `requestAnimationFrame`. Add source-contract tests with Node.js built-in `node:test`; behavioral acceptance remains a browser verification because the repository has no browser-test harness.

**Tech Stack:** HTML, CSS, JavaScript, React UMD exposed by `support.js`, `DCLogic`, Node.js built-in test runner, GitHub Pages.

## Global Constraints

- Keep production behavior in `index.html`.
- Do not edit generated `support.js`.
- Add no runtime or development dependencies.
- Keep GitHub Pages compatibility and relative asset paths.
- Exactly one timeline item uses `lidoAteAqui: true`.
- The marker is `14/07 - Busca e acompanhamento aprimorados`.
- Items before `14/07` look previously read; `14/07` and later items remain fully colored.
- Video format is MP4 only.
- Video never plays in the closed card.
- Open video uses `autoPlay`, `loop`, `muted`, `playsInline`, and `preload="metadata"`.
- Closing by backdrop or `Escape` pauses video and resets `currentTime` to `0`.
- No heavy blur, flashes, aggressive tunnel effect, or external animation library.
- Respect `prefers-reduced-motion: reduce`.
- Source correction from current repository state: `14/07` is existing item 18 and therefore remains `assets/timeline-18.webp`. New files are `timeline-19.webp`, `timeline-20.webp`, `timeline-21.mp4`, and `timeline-21.webp`. Do not reuse or overwrite an earlier timeline asset.
- Do not create binary assets in this change. Keep the existing fallback visible until the user supplies those four files.

## File Structure

- Modify: `index.html`
  - Timeline data, state derivation, visual states, accessible orbital trigger, mixed-media cards, mixed-media modal, orbital animation, lifecycle cleanup.
- Create: `tests/timeline-source.test.mjs`
  - Dependency-free source-contract tests for marker uniqueness, asset numbering, required markup, media behavior, accessibility, and reduced-motion support.

---

### Task 1: Replace positional timeline data with explicit media-aware objects

**Files:**
- Create: `tests/timeline-source.test.mjs`
- Modify: `index.html:186-230`

**Interfaces:**
- Consumes: Current `Component.renderVals()` and existing timeline copy.
- Produces:
  - `abrirMidia(marco): void`
  - `validarMarcador(dados): number`
  - `normalizarMarcos(dados): { marcos: object[], indiceMarcador: number }`
  - Normalized fields: `numero`, `status`, `ehMarcador`, `ehVideo`, `cardSrc`, temporary `img`, `ariaAbrir`, `abrir`.

- [ ] **Step 1: Create failing source-contract tests**

Create `tests/timeline-source.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(resolve(here, "..", "index.html"), "utf8");

test("defines exactly one manual reading marker at 14/07", () => {
  const markers = html.match(/lidoAteAqui:\s*true/g) ?? [];
  assert.equal(markers.length, 1);
  assert.match(
    html,
    /data:\s*"14\/07"[\s\S]*?titulo:\s*"Busca e acompanhamento aprimorados"[\s\S]*?lidoAteAqui:\s*true/
  );
});

test("keeps current and new timeline asset numbering collision-free", () => {
  assert.match(html, /data:\s*"14\/07"[\s\S]*?src:\s*"assets\/timeline-18\.webp"/);
  assert.match(html, /data:\s*"16\/07"[\s\S]*?src:\s*"assets\/timeline-19\.webp"/);
  assert.match(html, /data:\s*"21\/07"[\s\S]*?src:\s*"assets\/timeline-20\.webp"/);
  assert.match(
    html,
    /data:\s*"23\/07"[\s\S]*?type:\s*"video"[\s\S]*?src:\s*"assets\/timeline-21\.mp4"[\s\S]*?poster:\s*"assets\/timeline-21\.webp"/
  );
});

test("derives marker state through named normalization methods", () => {
  assert.match(html, /validarMarcador\(dados\)/);
  assert.match(html, /normalizarMarcos\(dados\)/);
  assert.match(html, /const status = indiceMarcador === -1/);
  assert.match(html, /ehMarcador:\s*index === indiceMarcador/);
});
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
node --test tests/timeline-source.test.mjs
```

Expected: FAIL because `index.html` still uses positional arrays and has no `lidoAteAqui`, explicit media metadata, or normalization methods.

- [ ] **Step 3: Replace the data array and add marker normalization**

Inside `class Component extends DCLogic`, add these methods before `renderVals()`:

```js
  abrirMidia(marco) {
    this.setState({ aberto: marco });
  }

  validarMarcador(dados) {
    const markerIndexes = dados
      .map((item, index) => item.lidoAteAqui === true ? index : -1)
      .filter((index) => index >= 0);

    if (markerIndexes.length === 0) {
      console.warn("[timeline] Nenhum item possui lidoAteAqui: true.");
      return -1;
    }

    if (markerIndexes.length > 1) {
      console.warn("[timeline] Mais de um marcador encontrado. Primeiro marcador será usado.");
    }

    return markerIndexes[0];
  }

  normalizarMarcos(dados) {
    const indiceMarcador = this.validarMarcador(dados);

    const marcos = dados.map((item, index) => {
      const numero = String(index + 1).padStart(2, "0");
      const status = indiceMarcador === -1
        ? "normal"
        : index < indiceMarcador
          ? "jaLido"
          : index === indiceMarcador
            ? "marcador"
            : "normal";

      const marco = {
        ...item,
        numero,
        status,
        ehMarcador: index === indiceMarcador,
        ehVideo: item.media.type === "video",
        cardSrc: item.media.type === "video" ? item.media.poster : item.media.src,
        img: item.media.type === "video" ? item.media.poster : item.media.src,
        ariaAbrir: item.media.type === "video"
          ? `Reproduzir vídeo: ${item.titulo}`
          : `Ampliar imagem: ${item.titulo}`
      };

      marco.abrir = () => this.abrirMidia(marco);
      return marco;
    });

    return { marcos, indiceMarcador };
  }
```

Replace the current positional `const dados = [...]` in `renderVals()` with this complete object array:

```js
    const dados = [
      {
        data: "02/06",
        rotulo: "Governança",
        titulo: "Governança de acessos estabilizada",
        texto: "Permissões críticas protegidas, recuperação de acesso concluída e riscos de perda indevida de perfil eliminados.",
        media: { type: "image", src: "assets/timeline-01.webp" }
      },
      {
        data: "03/06",
        rotulo: "Importação",
        titulo: "Importação em lote operacional",
        texto: "CDM passou a processar cadastros em massa com validação, acompanhamento por item e retorno do resultado do SAP.",
        media: { type: "image", src: "assets/timeline-02.webp" }
      },
      {
        data: "04/06",
        rotulo: "Padronização",
        titulo: "Cadastro padronizado",
        texto: "Formulário, configurações e importação passaram a usar mesma estrutura, reduzindo divergências e retrabalho.",
        media: { type: "image", src: "assets/timeline-03.webp" }
      },
      {
        data: "11/06",
        rotulo: "Dados",
        titulo: "Base única consolidada",
        texto: "Estrutura oficial do cadastro foi consolidada como fonte única para telas, regras e templates do CDM.",
        media: { type: "image", src: "assets/timeline-04.webp" }
      },
      {
        data: "22/06",
        rotulo: "Governança",
        titulo: "Novo modelo de governança",
        texto: "CDM deixou de ser apenas tela de cadastro e passou a operar como central de solicitações com revisão e aprovação.",
        media: { type: "image", src: "assets/timeline-05.webp" }
      },
      {
        data: "23/06",
        rotulo: "Workflow",
        titulo: "Fluxo com rastreabilidade",
        texto: "Solicitações passaram a ter persistência, histórico e proteção de documentos conforme perfil e participação no processo.",
        media: { type: "image", src: "assets/timeline-06.webp" }
      },
      {
        data: "24/06",
        rotulo: "Protótipo",
        titulo: "Protótipo governado consolidado",
        texto: "Fluxo de solicitante e aprovador foi organizado, validado e integrado em jornada única de ponta a ponta.",
        media: { type: "image", src: "assets/timeline-07.webp" }
      },
      {
        data: "25/06",
        rotulo: "Experiência",
        titulo: "Evolução da experiência visual",
        texto: "Interface recebeu revisão ampla para melhorar clareza, navegação e entendimento do processo por cada perfil.",
        media: { type: "image", src: "assets/timeline-08.webp" }
      },
      {
        data: "29/06",
        rotulo: "Frontend",
        titulo: "Reconstrução controlada da interface",
        texto: "Frontend antigo foi substituído por base mais limpa, preservando integrações e preparando evolução sustentável.",
        media: { type: "image", src: "assets/timeline-09.webp" }
      },
      {
        data: "01/07",
        rotulo: "Backend",
        titulo: "Backend documentado e reproduzível",
        texto: "Estrutura de dados, regras e integrações passou a ter documentação e pacote técnico para implantação controlada.",
        media: { type: "image", src: "assets/timeline-10.webp" }
      },
      {
        data: "02/07",
        rotulo: "Integração",
        titulo: "Nova experiência integrada",
        texto: "Novo frontend foi conectado ao backend existente, reunindo navegação, workflow e operações em solução única.",
        media: { type: "image", src: "assets/timeline-11.webp" }
      },
      {
        data: "03/07",
        rotulo: "SAP",
        titulo: "ERSA validado com dados reais",
        texto: "Campos e estrutura do material ERSA foram mapeados diretamente no SAP, reduzindo suposições e risco de cadastro incorreto.",
        media: { type: "image", src: "assets/timeline-12.webp" }
      },
      {
        data: "06/07",
        rotulo: "Modelos",
        titulo: "Modelos integrados ao workflow",
        texto: "Modelos cadastrais passaram a orientar novas solicitações, revisão do aprovador e consulta de materiais.",
        media: { type: "image", src: "assets/timeline-13.webp" }
      },
      {
        data: "07/07",
        rotulo: "Estabilidade",
        titulo: "Projeto estabilizado",
        texto: "Repositório, dependências, documentação e validações foram organizados, criando base segura para continuidade.",
        media: { type: "image", src: "assets/timeline-14.webp" }
      },
      {
        data: "08/07",
        rotulo: "Escopo",
        titulo: "Escopo priorizado",
        texto: "Foco imediato concentrado em ERSA e HIBE, reduzindo dispersão e acelerando entrega do fluxo com maior valor.",
        media: { type: "image", src: "assets/timeline-15.webp" }
      },
      {
        data: "09/07",
        rotulo: "Catálogo",
        titulo: "Catálogo ERSA consolidado",
        texto: "Campos, heranças, versões e regras do ERSA foram centralizados, garantindo consistência entre configuração e solicitação.",
        media: { type: "image", src: "assets/timeline-16.webp" }
      },
      {
        data: "10/07",
        rotulo: "SAP",
        titulo: "Fluxo completo validado no SAP",
        texto: "CDM concluiu ciclo de solicitação, aprovação e envio, com criação real de material e retorno do código SAP.",
        media: { type: "image", src: "assets/timeline-17.webp" }
      },
      {
        data: "14/07",
        rotulo: "Busca",
        titulo: "Busca e acompanhamento aprimorados",
        texto: "Pesquisa de similares, navegação e histórico do aprovador foram refinados, ampliando prevenção de duplicidade e visibilidade.",
        media: { type: "image", src: "assets/timeline-18.webp" },
        lidoAteAqui: true
      },
      {
        data: "16/07",
        rotulo: "Evolução",
        titulo: "Novo marco de evolução",
        texto: "Registro visual do avanço realizado em 16/07. O texto definitivo será inserido após revisão editorial.",
        media: { type: "image", src: "assets/timeline-19.webp" }
      },
      {
        data: "21/07",
        rotulo: "Continuidade",
        titulo: "Evolução consolidada",
        texto: "Registro visual do avanço realizado em 21/07. O texto definitivo será inserido após revisão editorial.",
        media: { type: "image", src: "assets/timeline-20.webp" }
      },
      {
        data: "23/07",
        rotulo: "Demonstração",
        titulo: "Evolução em movimento",
        texto: "Demonstração em vídeo do avanço registrado em 23/07. O texto definitivo será inserido após revisão editorial.",
        media: {
          type: "video",
          src: "assets/timeline-21.mp4",
          poster: "assets/timeline-21.webp"
        }
      }
    ];

    const { marcos, indiceMarcador } = this.normalizarMarcos(dados);
```

At the beginning of the returned object, replace the existing `marcos: dados.map(...)` block with:

```js
      marcos,
      indiceMarcador,
```

Do not change the current modal fields yet. Tasks 2 and 3 replace them.

- [ ] **Step 4: Run source-contract tests**

Run:

```bash
node --test tests/timeline-source.test.mjs
```

Expected: 3 tests PASS.

- [ ] **Step 5: Commit Task 1**

```bash
git add index.html tests/timeline-source.test.mjs
git commit -m "refactor: add explicit timeline media model"
```

---

### Task 2: Add previously-read styling and accessible orbital trigger

**Files:**
- Modify: `tests/timeline-source.test.mjs`
- Modify: `index.html:16-78`
- Modify: `index.html:88-108`
- Modify: `index.html:componentDidMount aplicar()`
- Modify: `index.html:renderVals() return object`

**Interfaces:**
- Consumes: `marcos`, `indiceMarcador`, normalized `status`, `ehMarcador`.
- Produces:
  - Article contract: `data-marco-status`, `data-marco-atual`, `tabindex="-1"`.
  - Focus class: `marco-em-foco`.
  - Trigger contract: `data-orbit-trigger`, `data-orbit-scene`, `data-orbit-ring`.
  - Render values: `orbitaDesabilitada`, `viajarAteMarcador`.

- [ ] **Step 1: Extend source-contract tests**

Append to `tests/timeline-source.test.mjs`:

```js
test("renders marker state and focusable timeline articles", () => {
  assert.match(html, /data-marco-status="\{\{ m\.status \}\}"/);
  assert.match(html, /data-marco-atual="\{\{ m\.ehMarcador \}\}"/);
  assert.match(html, /tabindex="-1"/);
  assert.match(html, /classList\.toggle\("marco-em-foco", ativo\)/);
});

test("uses an accessible CDM orbital trigger", () => {
  assert.match(html, /<button[\s\S]*?data-orbit-trigger="true"/);
  assert.match(html, /aria-label="Ir até marco atual"/);
  assert.match(html, /aria-disabled="\{\{ orbitaDesabilitada \}\}"/);
  assert.match(html, /onClick="\{\{ viajarAteMarcador \}\}"/);
  assert.match(html, /data-orbit-scene="true"/);
  assert.match(html, /data-orbit-ring="inner"/);
  assert.match(html, /data-orbit-ring="middle"/);
  assert.match(html, /data-orbit-ring="outer"/);
});
```

- [ ] **Step 2: Run tests and verify new failures**

Run:

```bash
node --test tests/timeline-source.test.mjs
```

Expected: the 3 Task 1 tests PASS; the 2 new tests FAIL because markup and focus-state handling are not implemented.

- [ ] **Step 3: Add CSS for focus, previously-read state, and trigger interaction**

Insert before the existing reduced-motion media query:

```css
[data-marco]{outline:none}
[data-marco]:focus-visible{outline:3px solid rgba(69,129,60,.42);outline-offset:10px;border-radius:18px}
[data-marco-data],[data-marco-label],[data-marco-title],[data-marco-text],[data-marco-ponto],[data-marco-media]{transition:color .45s ease,opacity .45s ease,filter .45s ease,transform .45s cubic-bezier(.2,.8,.2,1),box-shadow .45s ease}
[data-marco-borda]{opacity:0;transform:scale(.985);transition:opacity .5s ease,transform .5s ease}
[data-marco].marco-em-foco [data-marco-data]{color:#45813C!important;transform:translateY(-2px)}
[data-marco].marco-em-foco [data-marco-ponto]{transform:scale(1.55)}
[data-marco].marco-em-foco [data-marco-borda]{opacity:1;transform:scale(1)}
[data-marco-status="jaLido"] [data-marco-data]{color:#929991!important;opacity:.82}
[data-marco-status="jaLido"] [data-marco-label]{color:#aeb4ad!important;opacity:.82}
[data-marco-status="jaLido"] [data-marco-title]{color:#737b72!important;opacity:.82}
[data-marco-status="jaLido"] [data-marco-text]{color:#969d95!important;opacity:.82}
[data-marco-status="jaLido"] [data-marco-ponto]{filter:grayscale(1) saturate(.25);opacity:.66}
[data-marco-status="jaLido"] [data-marco-media]{filter:grayscale(1) saturate(.35);opacity:.68}
[data-marco-status="jaLido"].marco-em-foco [data-marco-data]{color:#737b72!important}
[data-marco-status="jaLido"].marco-em-foco [data-marco-borda]{opacity:.42}
[data-orbit-trigger]{border:0;padding:0;font:inherit;color:inherit;cursor:pointer;transition:transform .28s ease,box-shadow .28s ease}
[data-orbit-trigger]:hover{transform:scale(1.04);box-shadow:0 14px 40px rgba(69,129,60,.22),0 0 0 8px rgba(238,180,30,.08)!important}
[data-orbit-trigger]:focus-visible{outline:3px solid rgba(69,129,60,.5);outline-offset:6px}
[data-orbit-trigger][aria-disabled="true"]{cursor:default;opacity:.8}
```

Replace the current reduced-motion rule with:

```css
@media (prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
  *{animation:none!important}
  [data-marco-data],[data-marco-label],[data-marco-title],[data-marco-text],[data-marco-ponto],[data-marco-media],[data-orbit-trigger]{transition:none!important}
}
```

- [ ] **Step 4: Convert the central CDM logo into a button and label orbit rings**

Replace the current orbit scene wrapper and central logo container with:

```html
        <div data-orbit-scene="true" style="position:absolute;inset:0 0 0 auto;width:50%;overflow:hidden;animation:rise .9s ease .2s both">
          <div style="position:absolute;top:50%;left:78%;width:640px;height:640px;transform:translate(-50%,-50%)">
            <button
              type="button"
              data-orbit-trigger="true"
              aria-label="Ir até marco atual"
              aria-disabled="{{ orbitaDesabilitada }}"
              onClick="{{ viajarAteMarcador }}"
              style="position:absolute;z-index:4;top:50%;left:50%;width:112px;height:112px;margin:-56px 0 0 -56px;border-radius:50%;background:#ffffff;box-shadow:0 12px 34px rgba(23,32,22,.14);display:flex;align-items:center;justify-content:center"
            >
              <span data-orbit-core="true" aria-hidden="true" style="display:flex;align-items:center;justify-content:center;animation:floaty 6s ease-in-out infinite">
                <img src="assets/logo.png" alt="" width="66" height="66" style="display:block;width:66px;height:66px">
              </span>
            </button>
```

Keep the three existing ring blocks, but add these attributes to their opening tags:

```html
<div data-orbit-ring="inner" aria-hidden="true" ...>
<div data-orbit-ring="middle" aria-hidden="true" ...>
<div data-orbit-ring="outer" aria-hidden="true" ...>
```

Remove `aria-hidden="true"` from the scene wrapper. Keep it only on decorative ring blocks.

- [ ] **Step 5: Add timeline state attributes and semantic hooks**

Replace the article opening tag with:

```html
          <article
            data-marco="true"
            data-marco-status="{{ m.status }}"
            data-marco-atual="{{ m.ehMarcador }}"
            tabindex="-1"
            style="position:relative;z-index:2;display:grid;grid-template-columns:1fr 160px 1fr;width:100%;padding:64px 0"
            data-screen-label="{{ m.data }}"
          >
```

Add hooks to existing elements:

```html
<time data-marco-data="true" ...>
<div data-marco-label="true" ...>{{ m.rotulo }}</div>
<div data-marco-ponto="true" ...></div>
<h2 data-marco-title="true" ...>{{ m.titulo }}</h2>
<p data-marco-text="true" ...>{{ m.texto }}</p>
<div data-marco-media="true" ...>
```

Remove `opacity:0;transform:scale(.985);` from the inline style of `[data-marco-borda]`, because CSS now owns those states.

- [ ] **Step 6: Replace direct style mutation with a focus class**

Inside `componentDidMount()`, replace `aplicar` with:

```js
    const aplicar = (el, ativo) => {
      el.classList.toggle("marco-em-foco", ativo);
    };
```

Keep the current center-of-viewport calculation, scroll listener, resize listener, and interval.

- [ ] **Step 7: Add a safe baseline navigation method**

Add before `componentDidMount()`:

```js
  viajarAteMarcador() {
    const marcador = document.querySelector('[data-marco-atual="true"]');
    if (!marcador) {
      console.warn("[timeline] Marcador atual não está disponível no DOM.");
      return;
    }

    marcador.scrollIntoView({ behavior: "smooth", block: "center" });
    marcador.focus({ preventScroll: true });
  }
```

Task 4 replaces this baseline with the orbital animation.

- [ ] **Step 8: Expose trigger values from `renderVals()`**

Add to the returned object:

```js
      orbitaDesabilitada: indiceMarcador < 0 || this.state.isTraveling,
      viajarAteMarcador: () => this.viajarAteMarcador(),
```

- [ ] **Step 9: Run source-contract tests**

Run:

```bash
node --test tests/timeline-source.test.mjs
```

Expected: 5 tests PASS.

- [ ] **Step 10: Commit Task 2**

```bash
git add index.html tests/timeline-source.test.mjs
git commit -m "feat: add timeline reading states and marker trigger"
```

---

### Task 3: Add image and MP4 cards plus a mixed-media modal

**Files:**
- Modify: `tests/timeline-source.test.mjs`
- Modify: `index.html:timeline media card`
- Modify: `index.html:modal markup`
- Modify: `index.html:Component state and media methods`
- Modify: `index.html:componentDidMount and componentWillUnmount`
- Modify: `index.html:renderVals() return object`

**Interfaces:**
- Consumes: `marco.media`, `marco.cardSrc`, `marco.ehVideo`, `marco.ariaAbrir`.
- Produces:
  - `abrirMidia(marco): void`
  - `pausarEReiniciarVideo(): void`
  - `fecharModal(): void`
  - `renderModalMedia(): ReactNode | null`
  - State fields: `aberto`, `isTraveling`, `videoErro`
  - `this._videoElement`.

- [ ] **Step 1: Extend source-contract tests for media behavior**

Append:

```js
test("uses poster-only cards for video and a mixed-media modal", () => {
  assert.match(html, /src="\{\{ m\.cardSrc \}\}"/);
  assert.match(html, /value="\{\{ m\.ehVideo \}\}"/);
  assert.match(html, /data-video-play="true"/);
  assert.match(html, /\{\{ modalMidia \}\}/);
  assert.match(html, /renderModalMedia\(\)/);
});

test("configures modal video for silent looping inline playback", () => {
  assert.match(html, /React\.createElement\("video"/);
  assert.match(html, /autoPlay:\s*true/);
  assert.match(html, /loop:\s*true/);
  assert.match(html, /muted:\s*true/);
  assert.match(html, /playsInline:\s*true/);
  assert.match(html, /preload:\s*"metadata"/);
  assert.match(html, /currentTime = 0/);
  assert.match(html, /Vídeo indisponível/);
});

test("closes media through Escape using the same cleanup path", () => {
  assert.match(html, /if \(e\.key === "Escape"\) this\.fecharModal\(\)/);
  assert.match(html, /onClick="\{\{ fecharModal \}\}"/);
});
```

- [ ] **Step 2: Run tests and verify new failures**

Run:

```bash
node --test tests/timeline-source.test.mjs
```

Expected: 5 earlier tests PASS; 3 new media tests FAIL.

- [ ] **Step 3: Replace the image-only card with a media button**

Replace the current media container contents with:

```html
                <button
                  type="button"
                  data-marco-media="true"
                  data-media-card="true"
                  onClick="{{ m.abrir }}"
                  aria-label="{{ m.ariaAbrir }}"
                  style="position:relative;display:block;margin-top:28px;width:100%;max-width:480px;aspect-ratio:3/2;overflow:hidden;padding:0;border:1px solid #e4e8e2;border-radius:16px;background:repeating-linear-gradient(45deg,#f6f8f5 0 14px,#f0f3ee 14px 28px);box-shadow:0 18px 45px rgba(23,32,22,.10);animation:reveal .9s ease both;animation-timeline:view();animation-range:entry 0% entry 70%;cursor:pointer"
                >
                  <div data-media-fallback="true" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:4px;font-size:14px;font-weight:600;letter-spacing:.02em;color:#8a938a">
                    <span>Mídia</span><span>{{ m.numero }}</span><span>em preparação</span>
                  </div>
                  <img
                    src="{{ m.cardSrc }}"
                    alt="{{ m.titulo }}"
                    loading="lazy"
                    onError="{{ ocultarQuebrada }}"
                    style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .5s ease"
                    style-hover="transform:scale(1.03)"
                  >
                  <sc-if value="{{ m.ehVideo }}" hint-placeholder-val="{{ false }}">
                    <span data-video-play="true" aria-hidden="true" style="position:absolute;z-index:3;top:50%;left:50%;display:flex;align-items:center;justify-content:center;width:62px;height:62px;transform:translate(-50%,-50%);border:1px solid rgba(255,255,255,.72);border-radius:50%;background:rgba(23,32,22,.58);box-shadow:0 12px 28px rgba(23,32,22,.25);backdrop-filter:blur(4px)">
                      <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" focusable="false" style="display:block;fill:#ffffff;transform:translateX(2px)">
                        <path d="M8 5v14l11-7z"></path>
                      </svg>
                    </span>
                  </sc-if>
                  <div data-marco-borda="true" aria-hidden="true" style="position:absolute;inset:0;z-index:4;border-radius:16px;padding:2px;background:linear-gradient(135deg,#45813C,#EEB41E);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);mask-composite:exclude;pointer-events:none"></div>
                </button>
```

The card contains only an image or poster. Do not render a `<video>` inside this button.

- [ ] **Step 4: Generalize modal markup**

Replace the image-only modal block with:

```html
  <sc-if value="{{ modalVisivel }}" hint-placeholder-val="{{ false }}">
    <div onClick="{{ fecharModal }}" style="position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;padding:40px;background:rgba(23,32,22,.45);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);animation:fadeIn .25s ease both;cursor:zoom-out" role="dialog" aria-modal="true" aria-label="Mídia ampliada">
      <figure onClick="{{ pararClique }}" style="margin:0;max-width:min(1280px,92vw);background:#ffffff;border-radius:20px;padding:14px 14px 8px;box-shadow:0 40px 90px rgba(23,32,22,.4);animation:zoomIn .3s cubic-bezier(.2,.8,.2,1) both;cursor:default">
        {{ modalMidia }}
        <figcaption style="display:flex;align-items:baseline;gap:10px;padding:12px 8px 8px">
          <span style="font-size:15px;font-weight:800;color:#45813C">{{ midiaAberta.data }}</span>
          <span style="font-size:15px;font-weight:600;color:#172016">{{ midiaAberta.titulo }}</span>
        </figcaption>
      </figure>
    </div>
  </sc-if>
```

- [ ] **Step 5: Add shared media cleanup and rendering methods**

Replace class state with:

```js
  state = {
    aberto: null,
    isTraveling: false,
    videoErro: false
  };
```

Add before `componentDidMount()`:

```js
  abrirMidia(marco) {
    this.setState({ aberto: marco, videoErro: false });
  }

  pausarEReiniciarVideo() {
    const video = this._videoElement;
    if (!video) return;

    video.pause();
    try {
      video.currentTime = 0;
    } catch (error) {
      console.warn("[timeline] Não foi possível reiniciar vídeo.", error);
    }
    this._videoElement = null;
  }

  fecharModal() {
    this.pausarEReiniciarVideo();
    this.setState({ aberto: null, videoErro: false });
  }

  renderModalMedia() {
    const marco = this.state.aberto;
    if (!marco) return null;

    const baseStyle = {
      display: "block",
      maxWidth: "100%",
      maxHeight: "82vh",
      margin: "0 auto",
      borderRadius: "12px"
    };

    if (marco.media.type === "image") {
      return React.createElement("img", {
        src: marco.media.src,
        alt: marco.titulo,
        style: baseStyle
      });
    }

    if (this.state.videoErro) {
      return React.createElement(
        "div",
        {
          style: {
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: "min(960px,86vw)",
            minHeight: "min(540px,64vh)",
            overflow: "hidden",
            borderRadius: "12px",
            background: "#111"
          }
        },
        React.createElement("img", {
          src: marco.media.poster,
          alt: "",
          "aria-hidden": true,
          style: {
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.48
          }
        }),
        React.createElement(
          "span",
          {
            style: {
              position: "relative",
              zIndex: 1,
              padding: "10px 16px",
              borderRadius: "999px",
              background: "rgba(17,17,17,.72)",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 700
            }
          },
          "Vídeo indisponível"
        )
      );
    }

    return React.createElement("video", {
      src: marco.media.src,
      poster: marco.media.poster,
      autoPlay: true,
      loop: true,
      muted: true,
      playsInline: true,
      preload: "metadata",
      controls: false,
      ref: (element) => {
        this._videoElement = element;
      },
      onError: () => {
        this.pausarEReiniciarVideo();
        this.setState({ videoErro: true });
      },
      style: baseStyle
    });
  }
```

- [ ] **Step 6: Route Escape and unmount through media cleanup**

In `componentDidMount()`, replace the Escape listener assignment with:

```js
    this._onKey = (e) => {
      if (e.key === "Escape") this.fecharModal();
    };
```

In `componentWillUnmount()`, add:

```js
    this.pausarEReiniciarVideo();
```

- [ ] **Step 7: Replace image-only return values**

Remove `imagemAberta` and `modalImagem`. Add:

```js
      modalVisivel: !!this.state.aberto,
      midiaAberta: this.state.aberto || {
        titulo: "",
        data: "",
        media: { type: "image", src: "" }
      },
      modalMidia: this.renderModalMedia(),
      fecharModal: () => this.fecharModal(),
      pararClique: (e) => e.stopPropagation(),
```

Keep:

```js
      ocultarQuebrada: (e) => {
        e.target.style.display = "none";
      }
```

- [ ] **Step 8: Run source-contract tests**

Run:

```bash
node --test tests/timeline-source.test.mjs
```

Expected: 8 tests PASS.

- [ ] **Step 9: Commit Task 3**

```bash
git add index.html tests/timeline-source.test.mjs
git commit -m "feat: support image and mp4 timeline media"
```

---

### Task 4: Implement elegant orbital travel, arrival feedback, and lifecycle cleanup

**Files:**
- Modify: `tests/timeline-source.test.mjs`
- Modify: `index.html:CSS animations`
- Modify: `index.html:orbit scene and main overlay`
- Modify: `index.html:Component animation methods`
- Modify: `index.html:componentDidMount and componentWillUnmount`
- Modify: `index.html:renderVals() return object`

**Interfaces:**
- Consumes: `[data-orbit-scene]`, `[data-orbit-ring]`, `[data-marco-atual="true"]`, article focusability.
- Produces:
  - `esperar(ms): Promise<void>`
  - `animarScroll(destino, duracao): Promise<void>`
  - `viajarAteMarcador(): Promise<void>`
  - State value: `viagemAtiva`
  - Temporary classes: `orbit-traveling`, `marco-chegada`
  - Overlay: `[data-space-overlay]`.

- [ ] **Step 1: Extend source-contract tests for animation and cleanup**

Append:

```js
test("implements orbital travel with custom easing and lifecycle cleanup", () => {
  assert.match(html, /easeInOutCubic/);
  assert.match(html, /animarScroll\(destino, duracao\)/);
  assert.match(html, /async viajarAteMarcador\(\)/);
  assert.match(html, /requestAnimationFrame/);
  assert.match(html, /orbit-traveling/);
  assert.match(html, /marco-chegada/);
  assert.match(html, /data-space-overlay="true"/);
  assert.match(html, /cancelAnimationFrame\(this\._travelRaf\)/);
});

test("uses reduced-motion fallback without space overlay", () => {
  assert.match(html, /matchMedia\("\(prefers-reduced-motion: reduce\)"\)/);
  assert.match(html, /scrollIntoView\(\{ block: "center" \}\)/);
  assert.match(html, /focus\(\{ preventScroll: true \}\)/);
});

test("keeps generated runtime as the single external runtime script", () => {
  const runtimeReferences = html.match(/support\.js/g) ?? [];
  assert.equal(runtimeReferences.length, 1);
  assert.match(html, /<script src="support\.js"><\/script>/);
});
```

- [ ] **Step 2: Run tests and verify new failures**

Run:

```bash
node --test tests/timeline-source.test.mjs
```

Expected: 8 earlier tests PASS; 2 animation tests FAIL. The scope assertion should PASS.

- [ ] **Step 3: Add orbital and arrival CSS**

Insert before the reduced-motion rule:

```css
@keyframes spaceOverlay{
  0%{opacity:0}
  18%{opacity:.42}
  70%{opacity:.34}
  100%{opacity:0}
}
@keyframes starDrift{
  0%{opacity:0;transform:translate3d(0,-8%,0) scale(1)}
  24%{opacity:.48}
  100%{opacity:0;transform:translate3d(0,24%,0) scale(1.08)}
}
@keyframes arrivalGlow{
  0%{box-shadow:0 0 0 rgba(69,129,60,0)}
  35%{box-shadow:0 0 0 6px rgba(69,129,60,.12),0 22px 60px rgba(69,129,60,.2)}
  100%{box-shadow:0 0 0 rgba(69,129,60,0)}
}
@keyframes arrivalPulse{
  0%,100%{transform:scale(1)}
  35%{transform:scale(1.9)}
  55%{transform:scale(1.2)}
  78%{transform:scale(1.7)}
}
[data-space-overlay]{
  position:fixed;
  inset:0;
  z-index:50;
  pointer-events:none;
  overflow:hidden;
  opacity:0;
  background:
    radial-gradient(circle at 50% 48%,rgba(238,180,30,.10),transparent 30%),
    linear-gradient(180deg,rgba(18,30,18,.06),rgba(18,30,18,.18));
  animation:spaceOverlay 2.25s cubic-bezier(.2,.8,.2,1) both;
}
[data-space-overlay]::before,
[data-space-overlay]::after{
  content:"";
  position:absolute;
  inset:-20%;
  background-image:
    radial-gradient(circle,rgba(255,255,255,.84) 0 1px,transparent 1.8px),
    radial-gradient(circle,rgba(238,180,30,.66) 0 1px,transparent 1.8px),
    radial-gradient(circle,rgba(122,174,112,.64) 0 1px,transparent 1.8px);
  background-position:0 0,38px 62px,84px 18px;
  background-size:92px 92px,138px 138px,176px 176px;
  animation:starDrift 2.1s cubic-bezier(.2,.75,.25,1) both;
}
[data-space-overlay]::after{
  opacity:.48;
  filter:blur(.4px);
  transform:scale(1.12);
  animation-duration:1.75s;
  animation-delay:.12s;
}
[data-orbit-scene].orbit-traveling [data-orbit-trigger]{
  transform:scale(1.075);
  box-shadow:0 18px 54px rgba(69,129,60,.28),0 0 0 12px rgba(238,180,30,.10)!important;
}
[data-orbit-scene].orbit-traveling [data-orbit-ring="inner"]{animation-duration:4.2s!important}
[data-orbit-scene].orbit-traveling [data-orbit-ring="middle"]{animation-duration:5.8s!important}
[data-orbit-scene].orbit-traveling [data-orbit-ring="outer"]{animation-duration:7.2s!important}
[data-marco].marco-chegada [data-marco-media]{animation:arrivalGlow .5s cubic-bezier(.2,.8,.2,1) both}
[data-marco].marco-chegada [data-marco-ponto]{animation:arrivalPulse .5s cubic-bezier(.2,.8,.2,1) both}
@media (max-width:720px){
  [data-space-overlay]::after{display:none}
  [data-space-overlay]::before{background-size:128px 128px,174px 174px,220px 220px}
}
```

Inside the existing reduced-motion media query, add:

```css
  [data-space-overlay]{display:none!important}
  [data-orbit-scene].orbit-traveling [data-orbit-ring]{animation:none!important}
  [data-marco].marco-chegada [data-marco-media],
  [data-marco].marco-chegada [data-marco-ponto]{animation:none!important}
```

- [ ] **Step 4: Render the temporary space overlay**

Immediately inside `<main>`, before `<header>`, add:

```html
  <sc-if value="{{ viagemAtiva }}" hint-placeholder-val="{{ false }}">
    <div data-space-overlay="true" aria-hidden="true"></div>
  </sc-if>
```

- [ ] **Step 5: Add animation helpers**

Add before `componentDidMount()`:

```js
  esperar(ms) {
    return new Promise((resolve) => {
      const timer = window.setTimeout(() => {
        this._travelTimers.delete(timer);
        resolve();
      }, ms);
      this._travelTimers.add(timer);
    });
  }

  animarScroll(destino, duracao) {
    const inicio = window.scrollY;
    const distancia = destino - inicio;
    const inicioTempo = performance.now();
    const html = document.documentElement;
    const scrollBehaviorAnterior = html.style.scrollBehavior;
    this._scrollBehaviorAnterior = scrollBehaviorAnterior;
    const easeInOutCubic = (t) =>
      t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;

    html.style.scrollBehavior = "auto";

    return new Promise((resolve) => {
      const finalizar = () => {
        html.style.scrollBehavior = scrollBehaviorAnterior;
        this._scrollBehaviorAnterior = null;
        this._travelRaf = null;
        resolve();
      };

      const frame = (agora) => {
        const progresso = Math.min((agora - inicioTempo) / duracao, 1);
        window.scrollTo(0, inicio + distancia * easeInOutCubic(progresso));

        if (progresso < 1 && this._isMounted) {
          this._travelRaf = requestAnimationFrame(frame);
          return;
        }

        finalizar();
      };

      this._travelRaf = requestAnimationFrame(frame);
    });
  }

  async viajarAteMarcador() {
    if (this._isTraveling) return;

    const marcador = document.querySelector('[data-marco-atual="true"]');
    if (!marcador) {
      console.warn("[timeline] Marcador atual não está disponível no DOM.");
      return;
    }

    const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduzirMovimento) {
      marcador.scrollIntoView({ block: "center" });
      marcador.focus({ preventScroll: true });
      return;
    }

    const cena = document.querySelector("[data-orbit-scene]");
    const mobile = window.matchMedia("(max-width: 720px)").matches;

    this._isTraveling = true;
    this.setState({ isTraveling: true });

    try {
      cena?.classList.add("orbit-traveling");

      await new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      });

      await this.esperar(mobile ? 250 : 450);

      const rect = marcador.getBoundingClientRect();
      const destinoBruto =
        window.scrollY +
        rect.top -
        (window.innerHeight - marcador.offsetHeight) / 2;
      const maximo = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const destino = Math.max(0, Math.min(destinoBruto, maximo));

      await this.animarScroll(destino, mobile ? 850 : 1300);

      marcador.classList.add("marco-chegada");
      marcador.focus({ preventScroll: true });

      await this.esperar(500);
    } catch (error) {
      console.error("[timeline] Falha durante salto orbital.", error);
    } finally {
      cena?.classList.remove("orbit-traveling");
      marcador.classList.remove("marco-chegada");

      this._isTraveling = false;
      if (this._isMounted) {
        this.setState({ isTraveling: false });
      }
    }
  }
```

- [ ] **Step 6: Initialize and clean animation resources**

At the beginning of `componentDidMount()`, add:

```js
    this._isMounted = true;
    this._isTraveling = false;
    this._travelTimers = new Set();
```

At the beginning of `componentWillUnmount()`, add:

```js
    this._isMounted = false;

    if (this._travelRaf) {
      cancelAnimationFrame(this._travelRaf);
      this._travelRaf = null;
    }

    if (this._scrollBehaviorAnterior !== null && this._scrollBehaviorAnterior !== undefined) {
      document.documentElement.style.scrollBehavior = this._scrollBehaviorAnterior;
      this._scrollBehaviorAnterior = null;
    }

    this._isTraveling = false;

    if (this._travelTimers) {
      this._travelTimers.forEach((timer) => clearTimeout(timer));
      this._travelTimers.clear();
    }

    document.querySelector("[data-orbit-scene]")?.classList.remove("orbit-traveling");
    document.querySelector('[data-marco-atual="true"]')?.classList.remove("marco-chegada");
```

Keep existing listener removal, interval cleanup, and `pausarEReiniciarVideo()`.

- [ ] **Step 7: Expose overlay state**

Add to the returned object:

```js
      viagemAtiva: this.state.isTraveling,
```

The return object must contain only one `viajarAteMarcador` field:

```js
      viajarAteMarcador: () => this.viajarAteMarcador(),
```

- [ ] **Step 8: Run automated source-contract tests**

Run:

```bash
node --test tests/timeline-source.test.mjs
```

Expected: 11 tests PASS, 0 FAIL.

- [ ] **Step 9: Run static server and complete browser acceptance**

Run:

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080` and verify:

1. `02/06` through `10/07` appear gray and less saturated.
2. `14/07` remains colored.
3. `16/07`, `21/07`, and `23/07` remain colored.
4. Missing new assets show `Mídia XX em preparação` without broken-image UI.
5. Central CDM logo works with mouse, `Enter`, and `Space`.
6. Click starts subtle orbital acceleration and star overlay.
7. Marker lands near viewport center after about 2.2 seconds on desktop.
8. `14/07` receives short glow and two point pulses.
9. Repeated clicks during travel do not launch parallel animations.
10. Keyboard focus ends on the `14/07` article.
11. With reduced motion enabled, click performs direct centered navigation without overlay or orbit acceleration.
12. Existing image cards still open and close.
13. After supplying test copies of `timeline-21.mp4` and `timeline-21.webp`, closed card shows poster only.
14. Opening `23/07` starts muted looping video.
15. Backdrop click pauses video, resets it, and closes modal.
16. `Escape` pauses video, resets it, and closes modal.
17. Reopening video starts from `0`.
18. A missing or invalid MP4 shows poster plus `Vídeo indisponível`.
19. Desktop and mobile layouts do not overflow horizontally.
20. Browser console contains no uncaught exception.

Stop server with `Ctrl+C`.

- [ ] **Step 10: Verify generated runtime and changed-file scope**

Run:

```bash
git status --short
git diff --name-only HEAD~4..HEAD
git diff HEAD~4..HEAD -- support.js
```

Expected:

```text
index.html
tests/timeline-source.test.mjs
```

`git diff HEAD~4..HEAD -- support.js` must return no output.

- [ ] **Step 11: Commit Task 4**

```bash
git add index.html tests/timeline-source.test.mjs
git commit -m "feat: add orbital navigation to current timeline marker"
```

- [ ] **Step 12: Run final verification after commit**

Run:

```bash
node --test tests/timeline-source.test.mjs
git status --short
```

Expected:

```text
# node --test
11 tests PASS
0 tests FAIL

# git status --short
# no output
```

## Codex Completion Report

Codex must return:

```text
Implementation complete.

Branch: <branch>
Commits:
- refactor: add explicit timeline media model
- feat: add timeline reading states and marker trigger
- feat: support image and mp4 timeline media
- feat: add orbital navigation to current timeline marker

Validation:
- node --test tests/timeline-source.test.mjs: 11 passed, 0 failed
- support.js unchanged
- GitHub Pages relative paths preserved
- Manual browser matrix: passed / list any item not executed

Assets still required from user:
- assets/timeline-19.webp
- assets/timeline-20.webp
- assets/timeline-21.mp4
- assets/timeline-21.webp
```
