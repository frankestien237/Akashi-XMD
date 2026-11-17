// ==========================================
// Commande / Module : Bienvenue (by devakashi)
// ==========================================
export const name = 'welcome';

export async function execute(sock, msg, args) {
  const remoteJid = msg.key.remoteJid;
  if (!remoteJid.endsWith('@g.us')) {
    await sock.sendMessage(remoteJid, { text: "❌ Cette commande s'utilise uniquement dans un groupe !" }, { quoted: msg });
    return;
  }

  const action = args[0]?.toLowerCase();
  if (action === 'on' || action === 'off') {
    await sock.sendMessage(remoteJid, { text: `✅ Système de bienvenue mis à jour : ${action.toUpperCase()} [by devakashi]` }, { quoted: msg });
  } else {
    await sock.sendMessage(remoteJid, { text: "⚠️ Utilisation : `.welcome on` ou `.welcome off`" }, { quoted: msg });
  }
}