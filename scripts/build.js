/**
 * BUILD COMPILER — Editorial Profile Blogger Theme v1.0.0
 * Compiles src/template.xml + src/components/*.xml + CSS/JS → dist/theme.xml
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const srcDir = path.join(root, "src");
const distDir = path.join(root, "dist");
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

const startTime = Date.now();

// 1. Combine CSS & JS Modules
const cssFiles = [
  "variables.css", "typography.css", "header-banner.css", "post-layout.css",
  "post-series.css", "affiliate-ui.css", "footer.css", "archive-page.css",
  "special-posts.css", "ai-transparency.css",
];
const combinedCss = cssFiles
  .map(f => fs.readFileSync(path.join(srcDir, "styles", f), "utf8"))
  .join("\n\n");

const jsFiles = [
  "bilingual.js", "mobile-nav.js", "search-modal.js", "archive-page.js",
  "auto-toc.js", "reading-time.js", "post-series.js", "footer.js",
  "special-posts.js", "ai-transparency.js", "homepage-interleaved.js",
];
const combinedJs = jsFiles
  .map(f => fs.readFileSync(path.join(srcDir, "scripts", f), "utf8"))
  .join("\n\n");

const darkModeJs = fs.readFileSync(path.join(srcDir, "scripts", "dark-mode.js"), "utf8");

// 2. Load Master Shell & Recursively Resolve Components
function resolveIncludes(content) {
  return content.replace(/<!--\s*\{\{INCLUDE:(.*?)\}\}\s*-->/g, (_, file) => {
    const filePath = path.join(srcDir, file.trim());
    if (!fs.existsSync(filePath)) throw new Error(`Missing component file: ${filePath}`);
    return resolveIncludes(fs.readFileSync(filePath, "utf8"));
  });
}

let template = fs.readFileSync(path.join(srcDir, "template.xml"), "utf8");
template = resolveIncludes(template);

// 3. Inject CSS, JS & Build Timestamp
const nowIso = new Date().toISOString();
const output = template
  .replace(/\$\{nowIso\}|\{\{BUILD_TIME\}\}/g, nowIso)
  .replace("// {{INJECT_DARK_MODE_JS}}", darkModeJs)
  .replace("/* {{INJECT_COMBINED_CSS}} */", combinedCss)
  .replace("// {{INJECT_COMBINED_JS}}", combinedJs);

// 4. Safe Write to dist/theme.xml
const themeXmlPath = path.join(distDir, "theme.xml");
if (fs.existsSync(themeXmlPath)) {
  try { fs.unlinkSync(themeXmlPath); } catch (_) {}
}
fs.writeFileSync(themeXmlPath, output, { encoding: "utf8", flag: "w" });

const duration = Date.now() - startTime;
const sizeKB = (Buffer.byteLength(output, "utf8") / 1024).toFixed(1);
const lineCount = output.split("\n").length;
console.log(`✅ dist/theme.xml compiled in ${duration}ms! (${sizeKB} KB, ${lineCount} lines)`);
