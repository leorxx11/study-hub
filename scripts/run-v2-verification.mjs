import { build } from "esbuild";
import { unlink } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const output = resolve("node_modules/.study-hub-v2-verification.mjs");
await build({
  entryPoints: ["scripts/v2-verification.tsx"],
  outfile: output,
  bundle: true,
  platform: "node",
  format: "esm",
  packages: "external",
  jsx: "automatic",
  logLevel: "silent",
});
try {
  await import(`${pathToFileURL(output).href}?t=${Date.now()}`);
} finally {
  await unlink(output).catch(() => undefined);
}
