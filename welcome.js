import fs from 'fs';

export const name = 'welcome';

export async function execute(sock, msg, args) {
  const remoteJid = msg.key.remoteJid;
  if (!remoteJid.endsWith('@g.us')) {
    return sock.sendMessage(remoteJid, { text: "❌ Cette commande s'utilise uniquement dans un groupe !" }, { quoted: msg });
  }

  const action = args[0]?.toLowerCase();
  if (action !== 'on' && action !== 'off') {
    return sock.sendMessage(remoteJid, { text: "⚠️ Utilisation : `.welcome on` ou `.welcome off`" }, { quoted: msg });
  }

  const settings = JSON.parse(fs.readFileSync('./settings.json', 'utf-8'));
  settings.welcome[remoteJid] = (action === 'on');
  fs.writeFileSync('./settings.json', JSON.stringify(settings, null, 2));

  await sock.sendMessage(remoteJid, { text: `✅ Système de bienvenue : **${action.toUpperCase()}** [by devakashi]` }, { quoted: msg });
}