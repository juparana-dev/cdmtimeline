import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const read = (path) => readFileSync(resolve(root, path), "utf8");
const exists = (path) => existsSync(resolve(root, path));

test("timeline preserves the original runtime behind a wrapper and exposes Presentation", () => {
  assert.equal(exists("support-runtime.js"), true);
  const wrapper = read("support.js");
  assert.match(wrapper, /support-runtime\.js/);
  assert.match(wrapper, /querySelector\(['"]header['"]\)/);
  assert.match(wrapper, /data-cdm-presentation-link/);
  assert.match(wrapper, /href\s*=\s*['"]apresentacao\//);
  assert.match(wrapper, /textContent\s*=\s*['"]Apresentação['"]/);
});

test("presentation contains exactly seven approved scenes", () => {
  assert.equal(exists("apresentacao/index.html"), true);
  const html = read("apresentacao/index.html");
  const scenes = html.match(/data-scene="\d"/g) ?? [];
  assert.equal(scenes.length, 7);
  assert.match(html, /O CDM conecta a/);
  assert.match(html, /necessidade do negócio/);
  assert.match(html, /O CDM prepara o que o SAP precisa/);
  assert.match(html, /Você conhece a necessidade/);
  assert.match(html, /Solicitar/);
  assert.match(html, /Validar/);
  assert.match(html, /Aprovar/);
  assert.match(html, /Cadastrar/);
  assert.match(html, /Agora vamos acompanhar/);
  assert.match(html, /essa jornada no CDM/);
});

test("presentation stays business-facing instead of exposing technical implementation", () => {
  const html = read("apresentacao/index.html");
  for (const term of ["Supabase", "Lovable", "OData", "Edge Function", "MTART", "MEINS", "EKGRP"]) {
    assert.equal(html.includes(term), false, `technical term leaked: ${term}`);
  }
});

test("presentation is static and GitHub Pages friendly", () => {
  const html = read("apresentacao/index.html");
  assert.match(html, /scroll-snap-type:y mandatory/);
  assert.match(html, /#45813c/i);
  assert.match(html, /#eeb41e/i);
  assert.match(html, /Archivo/);
  assert.match(html, /prefers-reduced-motion:reduce/);
  assert.match(html, /IntersectionObserver/);
  assert.match(html, /scrollIntoView/);
  assert.match(html, /ArrowDown/);
  assert.match(html, /ArrowUp/);
  assert.equal(/(?:src|href)="\/(?!\/)/.test(html), false, "root-absolute asset reference found");
});

test("presentation uses the supplied CDM motion asset and current V3 horizontal identity", () => {
  assert.equal(exists("apresentacao/assets/cdm-loader-symmetric.svg"), true);
  const html = read("apresentacao/index.html");
  const loader = read("apresentacao/assets/cdm-loader-symmetric.svg");
  assert.match(loader, /data-asset-role="functional-loader"/);
  assert.match(loader, /#45813c/i);
  assert.match(loader, /#eeb41e/i);
  assert.match(html, /assets\/cdm-loader-symmetric\.svg/);
  assert.match(html, /cdm-horizontal-title\.svg/);
});
