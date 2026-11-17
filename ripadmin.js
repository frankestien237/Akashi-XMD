export const name = "ripadmin";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;
  const isGroup = from.endsWith('@g.us');

  if (!isGroup) {
    return await sock.sendMessage(from, { text: "❌ Cette commande est réservée aux groupes !" }, { quoted: msg });
  }

  try {
    const metadata = await sock.groupMetadata(from);
    const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const isBotAdmin = metadata.participants.find(p => p.id === botNumber)?.admin;

    if (!isBotAdmin) {
      return await sock.sendMessage(from, { text: "❌ Le bot doit être administrateur pour exécuter cette action !" }, { quoted: msg });
    }

    // Récupérer tous les admins sauf le bot et le propriétaire du groupe
    const admins = metadata.participants.filter(p => p.admin && p.id !== botNumber);

    if (admins.length === 0) {
      return await sock.sendMessage(from, { text: "⚠️ Il n'y a aucun autre administrateur à rétrograder." }, { quoted: msg });
    }

    const adminIds = admins.map(p => p.id);

    // Rétrograder tous les admins un par un ou en lot
    for (let target of adminIds) {
      await sock.groupParticipantsUpdate(from, [target], "demote");
      await new Promise(resolve => setTimeout(resolve, 800)); // Pause anti-spam/anti-ban de 0.8s
    }

    await sock.sendMessage(from, { text: `✅ Action réussie : ${adminIds.length} administrateur(s) ont été rétrogradés.` }, { quoted: msg });
  } catch (err) {
    console.error("Erreur sur ripadmin :", err);
    await sock.sendMessage(from, { text: "❌ Une erreur est survenue lors de l'exécution de la commande." }, { quoted: msg });
  }
}