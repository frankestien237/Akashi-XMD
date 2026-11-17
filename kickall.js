export const name = "kickall";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;

  if (!from.endsWith("@g.us")) {
    return await sock.sendMessage(from, { text: "> Akashi XMD : ⚠️ Cette commande ne fonctionne qu'en groupe." });
  }

  try {
    await sock.sendMessage(from, { text: "> Akashi XMD : ⚠️ Démarrage de l'expulsion des membres non-admins..." });

    const metadata = await sock.groupMetadata(from);
    const participants = metadata.participants;
    const nonAdmins = participants.filter(v => !v.admin).map(v => v.id);

    if (nonAdmins.length === 0) {
      return await sock.sendMessage(from, { text: "> Akashi XMD : Aucun membre non-admin à expulser." });
    }

    for (let target of nonAdmins) {
      try {
        await sock.groupParticipantsUpdate(from, [target], "remove");
        await new Promise(resolve => setTimeout(resolve, 1000)); // Pause de 1s pour éviter le ban de WhatsApp
      } catch (e) {
        console.error(`Échec expulsion ${target}:`, e);
      }
    }

    await sock.sendMessage(from, { text: "> Akashi XMD : ✅ Tous les membres non-admins ont été expulsés avec succès !\n\n> By Dev Akashi" });
  } catch (err) {
    console.error("Erreur kickall :", err);
    await sock.sendMessage(from, { text: "> Akashi XMD : ❌ Une erreur est survenue lors de l'exécution." });
  }
}