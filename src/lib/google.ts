import { google } from "googleapis";

function getOAuthClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });
  return oauth2Client;
}

export async function getNoveMailyCached(dnu = 0): Promise<{ id: string; subject: string; from: string; snippet: string; date: string }[]> {
  const auth = getOAuthClient();
  const gmail = google.gmail({ version: "v1", auth });

  const od = new Date();
  if (dnu > 0) {
    od.setDate(od.getDate() - dnu);
  } else {
    od.setHours(od.getHours() - 1);
  }
  const query = `after:${Math.floor(od.getTime() / 1000)} -from:me`;

  const list = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults: 20,
  });

  if (!list.data.messages?.length) return [];

  const maily = await Promise.all(
    list.data.messages.map(async (m) => {
      const msg = await gmail.users.messages.get({
        userId: "me",
        id: m.id!,
        format: "metadata",
        metadataHeaders: ["Subject", "From", "Date"],
      });
      const headers = msg.data.payload?.headers ?? [];
      const get = (name: string) => headers.find((h) => h.name === name)?.value ?? "";
      return {
        id: m.id!,
        subject: get("Subject"),
        from: get("From"),
        snippet: msg.data.snippet ?? "",
        date: get("Date"),
      };
    })
  );

  return maily;
}

export async function getNoveUdalostiKalendare(): Promise<{ id: string; nazev: string; popis: string; zacatek: string }[]> {
  const auth = getOAuthClient();
  const calendar = google.calendar({ version: "v3", auth });

  const od = new Date();
  const do_ = new Date();
  do_.setDate(do_.getDate() + 7);

  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin: od.toISOString(),
    timeMax: do_.toISOString(),
    maxResults: 20,
    singleEvents: true,
    orderBy: "startTime",
  });

  return (res.data.items ?? []).map((e) => ({
    id: e.id ?? "",
    nazev: e.summary ?? "",
    popis: e.description ?? "",
    zacatek: e.start?.dateTime ?? e.start?.date ?? "",
  }));
}
