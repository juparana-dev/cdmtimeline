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
