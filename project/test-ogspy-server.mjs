/**
 * OGSpy server integration test
 * Simulates the exact HTTP request the extension makes via background-service.js / Xajax.
 *
 * Usage:
 *   node project/test-ogspy-server.mjs [serverUrl] [password]
 *
 * Defaults:
 *   serverUrl = http://localhost:8080
 *   password  = (empty)
 *
 * Examples:
 *   node project/test-ogspy-server.mjs
 *   node project/test-ogspy-server.mjs http://localhost:8080 mypassword
 */

const serverUrl = process.argv[2] ?? "http://localhost:8080";
const password  = process.argv[3] ?? "";

// Real payload mirroring what XtenseRequest.send() builds in send_data.js
const gamedata = {
  planet: { id: "33717002", name: "planète mère", coords: "4:246:12", type: "0" },
  fields: 188,
  temperature_min: "-40",
  temperature_max: "0",
  ressources: { metal: 11685, cristal: 10734, deut: 300, antimater: 10500, energy: 17 },
  playerdetails: {
    player_name: "Marshal Galileo",
    player_id: "107058",
    playerclass_explorer: 0,
    playerclass_miner: 1,
    playerclass_warrior: 0,
    player_officer_commander: 0,
    player_officer_amiral: 0,
    player_officer_engineer: 0,
    player_officer_geologist: 0,
    player_officer_technocrate: 0
  },
  unidetails: {
    uni_version: "12.7.0-r1",
    uni_url: "s277-fr.ogame.gameforge.com",
    uni_lang: "fr",
    uni_name: "Veritate",
    uni_time: "1773783743",
    uni_speed: "8",
    uni_speed_fleet_peaceful: "4",
    uni_speed_fleet_war: "6",
    uni_speed_fleet_holding: "6",
    uni_donut_g: "1",
    uni_donut_s: "1"
  },
  boosters: []
};

const payload = {
  toolbar_version: "3.1.2",
  toolbar_type:    "GM-FF",
  mod_min_version: "2.9.0",
  univers:         "https://s277-fr.ogame.gameforge.com",
  type:            "overview",
  password:        password,
  data:            JSON.stringify(gamedata)
};

const url         = `${serverUrl}/mod/xtense/xtense.php`;
const body        = JSON.stringify(payload);
const contentType = "text/plain; charset=UTF-8"; // same as Xajax in utilities.js

console.log("=== OGSpy Server Test ===");
console.log(`Target URL : ${url}`);
console.log(`Content-Type: ${contentType}`);
console.log(`Payload    : ${body}\n`);

// ── Request ────────────────────────────────────────────────────────────────────
let response;
try {
  response = await fetch(url, {
    method:  "POST",
    headers: { "Content-Type": contentType },
    body:    body,
    // Note: `mode: 'cors'` is browser-only, not needed in Node
  });
} catch (err) {
  console.error("FETCH ERROR (network / DNS / TLS):", err.message);
  process.exit(1);
}

// ── Response headers ───────────────────────────────────────────────────────────
console.log(`HTTP Status : ${response.status} ${response.statusText}`);
console.log("\n--- Response Headers ---");
for (const [key, value] of response.headers.entries()) {
  console.log(`  ${key}: ${value}`);
}

// ── CORS header check ──────────────────────────────────────────────────────────
console.log("\n--- CORS Header Check ---");
const acao = response.headers.get("access-control-allow-origin");
if (acao) {
  console.log(`  ✅  Access-Control-Allow-Origin: ${acao}`);
} else {
  console.log("  ❌  Access-Control-Allow-Origin header is MISSING");
  console.log("      The extension (moz-extension:// / chrome-extension://) will be blocked.");
  console.log("      Fix: add  header('Access-Control-Allow-Origin: *');  in xtense.php");
}

// ── Response body ──────────────────────────────────────────────────────────────
const buffer = await response.arrayBuffer();
const text = new TextDecoder("utf-8").decode(buffer);
console.log(`\n--- Response Body (${buffer.byteLength} bytes raw) ---`);

// OGSpy sends content-type:text/html even for JSON — use actual content
const isHtml = text.trimStart().startsWith("<");
if (isHtml) {
  const stripTags = (s) => s
    .replace(/<style[\s\S]*?<\/style>/gi, "")  // remove <style> blocks first
    .replace(/<script[\s\S]*?<\/script>/gi, "") // remove <script> blocks
    .replace(/<[^>]+>/g, " ")
    .replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"').replace(/&hellip;/g, "…").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n))
    .replace(/\s{2,}/g, " ").trim();

  // 1. Exception class + message from Whoops header section
  const exClassMatch = text.match(/class="exception-name[^"]*"[^>]*>([\s\S]*?)<\/[^>]+>/i);
  const exMsgMatch   = text.match(/class="exception-message[^"]*"[^>]*>([\s\S]*?)<\/[^>]+>/i)
    || text.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (exClassMatch) console.log("Exception  : " + stripTags(exClassMatch[1]));
  if (exMsgMatch)   console.log("Message    : " + stripTags(exMsgMatch[1]));

  // 2. MySQL-level message often appears in a <p> or description block
  const mysqlMsg = text.match(/Data truncated[^<"]+|Table '[^']+'[^<"]+|You have an error in your SQL[^<"]+|Unknown column[^<"]+|Duplicate entry[^<"]+/i);
  if (mysqlMsg) console.log("MySQL error: " + mysqlMsg[0].trim());

  // 3. Stack frames — only PHP files, skip CSS/JS noise
  const frameBlocks = [...text.matchAll(/<div class="frame[^"]*"[^>]*id="frame-line-(\d+)">([\s\S]*?)<\/div>\s*<\/div>/gi)];
  if (frameBlocks.length) {
    console.log("\nStack frames (PHP only):");
    for (const fb of frameBlocks) {
      const chunk = fb[2];
      // extract file path segments
      const parts = [...chunk.matchAll(/<span class="delimiter">([\s\S]*?)<\/span>/gi)].map(m => stripTags(m[1]));
      const lineNo = (chunk.match(/class="frame-line"[^>]*>([^<]+)/) || [])[1] || "?";
      const filePath = parts.join("/").replace(/\/+/g, "/");
      if (/\.php/.test(filePath)) {
        console.log(`  ${filePath}  :${lineNo.trim()}`);
      }
    }
  }
} else {
  console.log(text || "(empty body)");
}

// ── Summary ────────────────────────────────────────────────────────────────────
console.log("\n=== Summary ===");
if (response.ok && acao && !isHtml) {
  console.log("✅  Server is reachable and responds with proper CORS headers.");
} else if (isHtml) {
  console.log("⚠️   Server returned an HTML page (PHP error). See stack frames above.");
} else if (response.ok && !acao) {
  console.log("⚠️   Server is reachable but CORS headers are missing — extension requests will fail.");
} else {
  console.log(`❌  Server returned HTTP ${response.status}. Check server logs.`);
}
