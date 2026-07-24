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
