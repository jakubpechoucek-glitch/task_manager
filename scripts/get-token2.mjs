import { createServer } from "http";
import { google } from "googleapis";
import { readFileSync, writeFileSync } from "fs";

const env = readFileSync(".env", "utf-8");
const get = (key) => env.match(new RegExp(`${key}="([^"]+)"`))?.[1] ?? "";

const CLIENT_ID = get("GOOGLE_CLIENT_ID");
const CLIENT_SECRET = get("GOOGLE_CLIENT_SECRET");
const REDIRECT_URI = "http://localhost:3000/api/auth/callback";

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const url = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/calendar.readonly",
  ],
});

console.log("\n👉 Otevři tento odkaz:\n");
console.log(url);
console.log("\nČekám...\n");

const server = createServer(async (req, res) => {
  const code = new URL(req.url, "http://localhost:3000").searchParams.get("code");
  if (!code) { res.end("Chyba - chybi code"); return; }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    const rt = tokens.refresh_token;

    // Ulož přímo do .env
    let envContent = readFileSync(".env", "utf-8");
    envContent = envContent.replace(/GOOGLE_REFRESH_TOKEN="[^"]*"/, `GOOGLE_REFRESH_TOKEN="${rt}"`);
    writeFileSync(".env", envContent);

    res.end("<h2>Hotovo! Refresh token byl ulozen do .env</h2>");
    console.log("\n✅ Refresh token uložen do .env!\n");
    console.log("Token: " + rt + "\n");
  } catch(e) {
    res.end("Chyba: " + e.message);
    console.error("Chyba:", e.message);
  }

  server.close();
  process.exit(0);
});

server.listen(3000, () => {
  console.log("Server běží na portu 3000\n");
});
