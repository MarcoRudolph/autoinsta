const fs = require("node:fs");
const path = require("node:path");

function fail(message) {
  console.error("");
  console.error(`[cf:guard-config] ${message}`);
  console.error("");
  process.exit(1);
}

function samePath(a, b) {
  return path.resolve(a).toLowerCase() === path.resolve(b).toLowerCase();
}

const projectRoot = process.cwd();
const wranglerTomlPath = path.join(projectRoot, "wrangler.toml");

if (!fs.existsSync(wranglerTomlPath)) {
  fail("Missing wrangler.toml at project root.");
}

const wranglerToml = fs.readFileSync(wranglerTomlPath, "utf8");
const keepVarsLine = wranglerToml.match(/^\s*keep_vars\s*=\s*(true|false)\b/m);

if (!keepVarsLine) {
  fail("wrangler.toml must define `keep_vars = true`.");
}

if (keepVarsLine[1] !== "true") {
  fail("wrangler.toml has `keep_vars = false`. Set `keep_vars = true`.");
}

const redirectConfigPath = path.join(projectRoot, ".wrangler", "deploy", "config.json");
if (fs.existsSync(redirectConfigPath)) {
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(redirectConfigPath, "utf8"));
  } catch {
    fail("Found .wrangler/deploy/config.json, but it is not valid JSON.");
  }

  if (!parsed || typeof parsed.configPath !== "string" || parsed.configPath.trim().length === 0) {
    fail("Found .wrangler/deploy/config.json without a valid `configPath`.");
  }

  const redirectedConfig = path.resolve(path.dirname(redirectConfigPath), parsed.configPath);
  if (!samePath(redirectedConfig, wranglerTomlPath)) {
    fail(
      `Wrangler config is redirected to ${redirectedConfig}. ` +
        "Deploy must use the project wrangler.toml to preserve expected variable behavior."
    );
  }
}

console.log("[cf:guard-config] OK: keep_vars is true and no unsafe config redirect detected.");
