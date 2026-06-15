// Sync a release version into manifest.json and versions.json.
// Invoked by semantic-release (@semantic-release/exec prepareCmd) with the
// next version as the sole argument, e.g. `node version-bump.mjs 1.1.0`.
import { readFileSync, writeFileSync } from "fs";

const targetVersion = process.argv[2];
if (!targetVersion) {
  console.error("Usage: node version-bump.mjs <version>");
  process.exit(1);
}

// manifest.json holds the canonical version; minAppVersion is edited by hand.
const manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
manifest.version = targetVersion;
writeFileSync("manifest.json", JSON.stringify(manifest, null, 2) + "\n");

// versions.json maps each plugin version to the minAppVersion it shipped with,
// so older Obsidian installs resolve a compatible release.
const versions = JSON.parse(readFileSync("versions.json", "utf8"));
versions[targetVersion] = manifest.minAppVersion;
writeFileSync("versions.json", JSON.stringify(versions, null, 2) + "\n");

console.log(`Bumped to ${targetVersion} (minAppVersion ${manifest.minAppVersion})`);
