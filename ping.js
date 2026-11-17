import fs from 'fs';

export const name = "ping";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;
  const start = Date.now();

  // Calcul de la durée d'activité du bot (uptime)
  const uptimeSeconds = Math.floor(process.uptime());
  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = uptimeSeconds % 60;

  const latency = Date.now() - start + 15; // Vitesse en ms

  const captionText = `┌───「 👑 *AKASHI XMD* 👑 」───
│
│ 🚀 *Pong :* ${latency} ms
│ ⏱️ *Uptime :* ${hours}h ${minutes}m ${seconds}s
│ ⚡ *Statut :* En ligne & Rapide
│
└──────────────────────────
> By Dev Akashi`;

  if (fs.existsSync('./akashi.jpeg')) {
    await sock.sendMessage(from, {
      image: fs.readFileSync('./akashi.jpeg'),
      caption: captionText
    }, { quoted: msg });
  } else {
    await sock.sendMessage(from, { text: captionText }, { quoted: msg });
  }
}