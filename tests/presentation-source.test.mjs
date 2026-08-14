import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const read = (path) => readFileSync(resolve(root, path), "utf8");
const exists = (path) => existsSync(resolve(root, path));

test("timeline keeps runtime isolated and makes the full CDM brand open the presentation", () => {
  assert.equal(exists("support-runtime.js"), true);
  const wrapper = read("support.js");
  assert.match(wrapper, /support-runtime\.js/);
  assert.match(wrapper, /data-cdm-brand-link/);
  assert.match(wrapper, /href = 'apresentacao\/'/);
  assert.match(wrapper, /cdm-symbol\.svg/);
  assert.match(wrapper, /cdm-horizontal-sigla\.svg/);
});

test("presentation contains exactly seven approved business scenes", () => {
  const html = read("apresentacao/index.html");
  const scenes = html.match(/data-scene="\d"/g) ?? [];
  assert.equal(scenes.length, 7);
  for (const term of ["O CDM conecta a", "necessidade", "Solicitar", "Validar", "Aprovar", "Cadastrar", "Agora vamos acompanhar"]) {
    assert.match(html, new RegExp(term));
  }
  for (const term of ["Supabase", "Lovable", "OData", "Edge Function", "MTART", "MEINS", "EKGRP"]) {
    assert.equal(html.includes(term), false, `technical term leaked: ${term}`);
  }
});

test("presentation is 1080p-first without visible navbar or locked scrolling", () => {
  const html = read("apresentacao/index.html");
  assert.equal(/<header\b/i.test(html), false);
  assert.equal(/class=["'][^"']*(?:topbar|side-nav|\bnav\b)/i.test(html), false);
  assert.match(html, /height:100vh/);
  assert.match(html, /scroll-snap-type:y proximity/);
  assert.equal(/scroll-snap-type:y mandatory/.test(html), false);
  assert.match(html, /min-width:1600px/);
  assert.match(html, /min-height:900px/);
  assert.match(html, /IntersectionObserver/);
  assert.match(html, /ArrowDown/);
  assert.match(html, /ArrowUp/);
});

test("presentation restores self-contained brand motion and the SAP visual", () => {
  const html = read("apresentacao/index.html");
  assert.equal(exists("apresentacao/assets/cdm-loader-symmetric.svg"), true);
  const loader = read("apresentacao/assets/cdm-loader-symmetric.svg");
  assert.match(loader, /governedCircuit/);
  assert.match(loader, /2200ms linear infinite/);
  assert.match(loader, /data-loader-layer="structure"/);
  assert.match(loader, /data-loader-layer="database"/);
  assert.match(html, /assets\/cdm-loader-symmetric\.svg/);
  assert.match(html, /orchestratedSymbol/);
  assert.match(html, /480ms cubic-bezier/);
  assert.match(html, /400ms 580ms cubic-bezier/);
  assert.match(html, /580ms 900ms cubic-bezier/);
  assert.match(html, /SAP_2011_logo\.svg/);
  assert.equal(/brand-variants\.js|stage-renderer\.js|motion-controller\.js|motion-variants\.js/.test(html), false);
});

test("presentation remains static and GitHub Pages friendly", () => {
  const html = read("apresentacao/index.html");
  assert.match(html, /#45813c/i);
  assert.match(html, /#eeb41e/i);
  assert.match(html, /Archivo/);
  assert.match(html, /prefers-reduced-motion:reduce/);
  assert.equal(html.includes("DecompressionStream"), false);
  assert.equal(html.includes("presentation.bin"), false);
});
