export const name = "promote";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;
  const isGroup = from.endsWith('@g.us');

  if (!isGroup) {
    return await sock.sendMessage(from, { text: "❌ Cette commande doit être exécutée dans un groupe !" }, { quoted: msg });
  }

  try {
    const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
    let target = contextInfo?.mentionedJid?.[0] || contextInfo?.participant;

    if (!target && args[0]) {
      target = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    }

    if (!target) {
      return await sock.sendMessage(from, { text: "⚠️ Veuillez taguer, répondre ou écrire le numéro de la personne à promouvoir." }, { quoted: msg });
    }

    await sock.groupParticipantsUpdate(from, [target], "promote");
    await sock.sendMessage(from, { text: "✅ Membre promu administrateur avec succès !" }, { quoted: msg });
  } catch (err) {
    console.error("Erreur promote :", err);
    await sock.sendMessage(from, { text: "❌ Erreur : Assurez-vous que le bot est administrateur du groupe." }, { quoted: msg });
  }
}