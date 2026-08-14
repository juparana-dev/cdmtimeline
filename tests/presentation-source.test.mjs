import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const read = p => readFileSync(resolve(root,p),"utf8");

test("timeline wrapper makes the brand area open Presentation and replaces all legacy logo images",()=>{
  const wrapper=read("support.js");
  assert.match(wrapper,/data-cdm-brand-link/);
  assert.match(wrapper,/brandLink\.href = 'apresentacao\/'/);
  assert.match(wrapper,/img\[src="assets\/logo\.png"\]/);
  assert.match(wrapper,/cdm-symbol\.svg/);
  assert.match(wrapper,/data-cdm-presentation-link/);
});

test("presentation contains seven approved scenes and no technical leakage",()=>{
  const html=read("apresentacao/index.html");
  assert.equal((html.match(/data-scene="\d"/g)||[]).length,7);
  for(const term of ["Supabase","Lovable","OData","Edge Function","MTART","MEINS","EKGRP"]) assert.equal(html.includes(term),false);
});

test("presentation is TV-first and has no visible navbar or side dots",()=>{
  const html=read("apresentacao/index.html");
  assert.doesNotMatch(html,/<header/);
  assert.doesNotMatch(html,/class="nav"/);
  assert.doesNotMatch(html,/side-nav/);
  assert.match(html,/width:min\(1500px,100%\)/);
  assert.doesNotMatch(html,/scroll-snap-type:y mandatory/);
  assert.match(html,/scroll-snap-type:y proximity/);
  assert.match(html,/IntersectionObserver/);
});

test("presentation uses the approved motion vocabulary and timings",()=>{
  const html=read("apresentacao/index.html");
  assert.match(html,/Assinatura orquestrada/);
  assert.match(html,/\.9s cubic-bezier/);
  assert.match(html,/1\.14s cubic-bezier/);
  assert.match(html,/\.68s cubic-bezier/);
  const loader=read("apresentacao/assets/cdm-loader-symmetric.svg");
  assert.match(loader,/governedCircuit/);
  assert.match(loader,/2200ms linear infinite/);
  assert.match(loader,/data-loader-layer="structure"/);
  assert.match(loader,/data-loader-layer="database"/);
  assert.match(loader,/transform="translate\(0 -60\)"/);
});
