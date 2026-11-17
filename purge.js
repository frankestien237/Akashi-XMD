export const name = "purge";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;
  if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "> Akashi XMD : ⚠️ Groupe uniquement." });

  const metadata = await sock.groupMetadata(from);
  const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
  const sender = msg.key.participant || msg.key.remoteJid;

  // Récupère tout le monde sauf le bot et celui qui lance la purge
  const targets = metadata.participants
    .map(p => p.id)
    .filter(id => id !== botId && id !== sender);

  if (targets.length === 0) return sock.sendMessage(from, { text: "> Akashi XMD : Personne à purger." });

  await sock.sendMessage(from, { text: `> ☢️ *PURGE TOTALE ACTIVÉE* ☢️\n> Expulsion de ${targets.length} membres en cours...` });

  for (let target of targets) {
    try {
      await sock.groupParticipantsUpdate(from, [target], "remove");
      await new Promise(r => setTimeout(r, 800)); // Pause pour éviter le blocage WhatsApp
    } catch (e) {
      console.error(`Impossible d'expulser ${target}`);
    }
  }

  await sock.sendMessage(from, { text: "> Akashi XMD : ☠️ Purge terminée.\n> By Dev Akashi" });
}