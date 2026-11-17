import os from 'os';

export const name = "infos";
export const description = "Affiche les informations du bot et du système.";

export async function execute(sock, msg, args, options = {}) {
  const { botNumber = '237698278163' } = options;
  const from = msg.key.remoteJid || msg.message?.extendedTextMessage?.contextInfo?.remoteJid;

  const startTime = Date.now();
  const uptimeSeconds = process.uptime();
  
  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = Math.floor(uptimeSeconds % 60);
  const uptimeString = `${hours}h ${minutes}m ${seconds}s`;

  const memoryUsage = (process.memoryUsage().rss / (1024 * 1024)).toFixed(2);
  
  let platformInfo = os.platform();
  let osRelease = os.release() + ' ' + os.arch();

  const pingStart = Date.now();
  const sentMsg = await sock.sendMessage(from, { text: "> Akashi XMD : ⏳ Vérification ping..." }, { quoted: msg }).catch(() => {});
  const latency = Date.now() - pingStart;

  const botNumDisplay = botNumber;

  const infoText = `> ⚡ *INFORMATIONS DU BOT AKASHI XMD* ⚡
  
> 📱 Numéro : +${botNumDisplay}
> 👑 Propriétaire : Dev Akashi
> ⏱️ Uptime : ${uptimeString}
> 🫩 Latence : ${latency} ms
> 💾 Mémoire : ${memoryUsage} MB
> 💻 Plateforme : ${platformInfo} (${osRelease})

> By Dev Akashi`;

  await sock.sendMessage(from, { text: infoText }, { quoted: msg });
}