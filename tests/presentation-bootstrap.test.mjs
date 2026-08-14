import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(resolve(here, "..", "apresentacao", "index.html"), "utf8");

test("presentation is served directly without a browser decompression bootstrap", () => {
  assert.equal(html.includes("DecompressionStream"), false);
  assert.equal(html.includes("presentation.bin"), false);
  assert.match(html, /data-scene="1"/);
  assert.match(html, /data-scene="7"/);
});
