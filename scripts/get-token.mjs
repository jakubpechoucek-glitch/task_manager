import { createServer } from "http";
import { google } from "googleapis";
import { readFileSync } from "fs";

// Načti .env ručně
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

console.log("\n👉 Otevři tento odkaz v prohlížeči:\n");
console.log(url);
console.log("\nČekám na callback...\n");

const server = createServer(async (req, res) => {
  const code = new URL(req.url, "http://localhost:3000").searchParams.get("code");
  if (!code) { res.end("Chyba"); return; }

  const { tokens } = await oauth2Client.getToken(code);
  res.end("<h2>Hotovo! Zkopíruj refresh_token z terminálu a zavři toto okno.</h2>");

  console.log("\n✅ Refresh token:\n");
  console.log(tokens.refresh_token);
  console.log("\nPřidej ho do .env jako GOOGLE_REFRESH_TOKEN\n");

  server.close();
});

server.listen(3000);
