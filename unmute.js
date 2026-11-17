export const name = "unmute";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;
  const isGroup = from.endsWith('@g.us');

  if (!isGroup) {
    return await sock.sendMessage(from, { text: "❌ Cette commande doit être exécutée dans un groupe !" }, { quoted: msg });
  }

  try {
    // 'not_announcement' autorise tout le monde à envoyer des messages
    await sock.groupSettingUpdate(from, 'not_announcement');
    await sock.sendMessage(from, { text: "🔊 Le groupe a été ouvert (unmute) : tout le monde peut à nouveau envoyer des messages." }, { quoted: msg });
  } catch (err) {
    console.error("Erreur unmute :", err);
    await sock.sendMessage(from, { text: "❌ Erreur : Assurez-vous que le bot est administrateur du groupe." }, { quoted: msg });
  }
}