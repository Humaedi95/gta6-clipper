// gta6-clipper — entry helper for make.fun bounty gta6-clipper-01.
//
// Reads the VIDEO.json pointer from the bot directory and copies it into
// the output directory so the harness can pick up the submitted clip.
import { cp, mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const botDir = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

const source = join(botDir, "VIDEO.json");
const target = join(outDir, "VIDEO.json");

try {
  const raw = await readFile(source, "utf8");
  let pointer;
  try {
    pointer = JSON.parse(raw);
  } catch {
    throw new Error(`VIDEO.json at ${source} is not valid JSON`);
  }
  const clipUrl = pointer?.url;
  if (typeof clipUrl !== "string" || clipUrl.length === 0) {
    throw new Error(`VIDEO.json at ${source} has no non-empty "url" field`);
  }
  if (!clipUrl.startsWith("https://")) {
    throw new Error(`VIDEO.json url must start with https://, got ${clipUrl}`);
  }
  await mkdir(outDir, { recursive: true });
  await cp(source, target);
  console.log(`VIDEO.json copied from ${source} to ${target}`);
  console.log(`Clip ready: ${clipUrl}`);
} catch (err) {
  const reason = err instanceof Error ? err.message : String(err);
  console.error(`gta6-clipper: failed to stage VIDEO.json (${reason})`);
  process.exit(1);
}
