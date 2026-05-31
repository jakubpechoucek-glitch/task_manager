import cron from "node-cron";
import { spustSync } from "./sync";

let inicializovan = false;

export function inicializujScheduler() {
  if (inicializovan) return;
  inicializovan = true;

  // Každou hodinu v 0. minutě
  cron.schedule("0 * * * *", async () => {
    console.log("[Scheduler] Spouštím hodinový sync...");
    const vysledek = await spustSync();
    console.log(`[Scheduler] Hotovo. Nové návrhy: ${vysledek.noveNavrhy}`);
  });

  console.log("[Scheduler] Inicializován — sync každou hodinu");
}
