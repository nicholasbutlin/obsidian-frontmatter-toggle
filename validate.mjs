// Pre-release build gate. There is no compilation step — main.js is authored
// directly — so "building" means validating the shipped artifacts.
import { readFileSync } from "fs";
import { execSync } from "child_process";

// Syntax-check the plugin entry point.
execSync("node --check main.js", { stdio: "inherit" });

// manifest.json and versions.json must be valid JSON and mutually consistent.
const manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
const versions = JSON.parse(readFileSync("versions.json", "utf8"));

if (!versions[manifest.version]) {
  throw new Error(
    `versions.json has no entry for manifest version ${manifest.version}`,
  );
}

console.log(
  `OK: ${manifest.id} ${manifest.version} (minAppVersion ${manifest.minAppVersion})`,
);
