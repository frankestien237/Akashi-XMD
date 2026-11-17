export const name = "infosgroups";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;
  const isGroup = from.endsWith('@g.us');

  if (!isGroup) {
    return await sock.sendMessage(from, { text: "❌ Cette commande donne les infos d'un groupe, utilisez-la au sein d'un groupe." }, { quoted: msg });
  }

  try {
    const metadata = await sock.groupMetadata(from);
    const admins = metadata.participants.filter(p => p.admin).map(p => `@${p.id.split('@')[0]}`);
    
    let text = `📊 *INFORMATIONS DU GROUPE* 📊\n\n`;
    text += `📌 *Nom :* ${metadata.subject}\n`;
    text += `👥 *Membres :* ${metadata.participants.length}\n`;
    text += `👑 *Propriétaire :* ${metadata.owner ? '@' + metadata.owner.split('@')[0] : 'Inconnu'}\n`;
    text += `🛡️ *Administrateurs :* ${admins.length}\n`;

    await sock.sendMessage(from, { text, mentions: metadata.participants.map(p => p.id) }, { quoted: msg });
  } catch (err) {
    console.error("Erreur infosgroups :", err);
  }
}