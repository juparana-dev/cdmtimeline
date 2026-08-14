# CDM Presentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar uma apresentação visual do CDM ao GitHub Pages existente sem reescrever a timeline atual.

**Architecture:** Preservar `index.html` e o runtime gerado da timeline. Mover o blob atual de `support.js` para `support-runtime.js` e manter `support.js` como wrapper mínimo que carrega o runtime original e injeta o link `Apresentação`. Criar `apresentacao/index.html` como página estática autônoma, com sete cenas, identidade CDM e navegação por scroll e teclado.

**Tech Stack:** HTML, CSS, JavaScript nativo, Node.js test runner, GitHub Pages.

## Global Constraints

- Não alterar os marcos, mídias ou conteúdo histórico da timeline.
- Não adicionar backend, build step ou dependência de Cloud.
- Preservar GitHub Pages em `main` na raiz.
- Usar verde `#45813C`, amarelo `#EEB41E` e tipografia Archivo.
- Usar linguagem de negócio e não expor campos ou componentes técnicos do SAP/CDM.
- Respeitar `prefers-reduced-motion`.

---

### Task 1: Integração mínima com a timeline

**Files:**
- Create: `support-runtime.js`
- Modify: `support.js`
- Test: `tests/presentation-source.test.mjs`

- [x] Preservar byte a byte o blob anterior de `support.js` como `support-runtime.js`.
- [x] Criar teste que exige o runtime preservado e o link `Apresentação`.
- [x] Criar wrapper síncrono que carrega `support-runtime.js` antes da inicialização da timeline.
- [x] Injetar um único link minimalista no `header`, apontando para `apresentacao/`.

### Task 2: Apresentação visual

**Files:**
- Create: `apresentacao/index.html`
- Create: `apresentacao/assets/cdm-loader-symmetric.svg`
- Test: `tests/presentation-source.test.mjs`

- [x] Criar sete cenas de viewport seguindo o storyboard aprovado.
- [x] Implementar scroll snap, progressão visual, navegação lateral e teclado.
- [x] Implementar animações de órbita, fluxo, pulso e revelação com fallback reduced motion.
- [x] Incorporar o asset motion CDM fornecido e a identidade horizontal V3 atual.
- [x] Manter os textos curtos, executivos no início e progressivamente mais concretos.

### Task 3: Verificação e publicação

**Files:**
- Test: `tests/timeline-source.test.mjs`
- Test: `tests/presentation-source.test.mjs`

- [ ] Executar a suíte de testes sobre a árvore exata da feature branch.
- [ ] Confirmar que `main` não avançou desde a criação da branch.
- [ ] Fazer fast-forward sem force para `main` somente após testes verdes.
- [ ] Confirmar GitHub Pages com status `built`.
- [ ] Validar a URL pública da timeline e da apresentação.

## Stop conditions

Parar sem publicar se o `main` tiver avançado, se qualquer teste falhar, se a timeline deixar de carregar o runtime original ou se o GitHub Pages não aceitar a árvore estática.
