export const name = "mute";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;
  const isGroup = from.endsWith('@g.us');

  if (!isGroup) {
    return await sock.sendMessage(from, { text: "❌ Cette commande doit être exécutée dans un groupe !" }, { quoted: msg });
  }

  try {
    // 'announcement' restreint l'envoi de messages aux seuls administrateurs
    await sock.groupSettingUpdate(from, 'announcement');
    await sock.sendMessage(from, { text: "🔇 Le groupe a été fermé (mute) : seuls les administrateurs peuvent envoyer des messages." }, { quoted: msg });
  } catch (err) {
    console.error("Erreur mute :", err);
    await sock.sendMessage(from, { text: "❌ Erreur : Assurez-vous que le bot est administrateur du groupe." }, { quoted: msg });
  }
}