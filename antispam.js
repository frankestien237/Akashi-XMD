// ==========================================
// Commande / Module : Anti-Spam (by devakashi)
// ==========================================
export const name = 'antispam';

export async function execute(sock, msg, args) {
  const remoteJid = msg.key.remoteJid;
  if (!remoteJid.endsWith('@g.us')) {
    await sock.sendMessage(remoteJid, { text: "❌ Cette commande s'utilise uniquement dans un groupe !" }, { quoted: msg });
    return;
  }

  const status = args[0]?.toLowerCase();
  if (status === 'on') {
    await sock.sendMessage(remoteJid, { text: "🛡️ **Anti-Spam activé !** Les messages répétitifs seront surveillés. [by devakashi]" }, { quoted: msg });
  } else if (status === 'off') {
    await sock.sendMessage(remoteJid, { text: "⚠️ **Anti-Spam désactivé.** [by devakashi]" }, { quoted: msg });
  } else {
    await sock.sendMessage(remoteJid, { text: "⚠️ Utilisation : `.antispam on` ou `.antispam off`" }, { quoted: msg });
  }
}