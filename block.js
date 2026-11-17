export const name = "block";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;

  try {
    const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
    let target = contextInfo?.mentionedJid?.[0] 
              || contextInfo?.participant 
              || (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);

    // Si on est en IB et qu'aucun argument n'est donné, bloque la personne en face
    if (!target && !from.endsWith('@g.us')) {
      target = from;
    }

    if (!target) {
      await sock.sendMessage(from, { text: "⚠️ Veuillez taguer la personne à bloquer ou répondre à son message avec `.block`" }, { quoted: msg });
      return;
    }

    await sock.updateBlockStatus(target, 'block');
    await sock.sendMessage(from, { text: `✅ L'utilisateur @${target.split('@')[0]} a été bloqué avec succès.`, mentions: [target] }, { quoted: msg });
  } catch (err) {
    console.error("Erreur block:", err);
    await sock.sendMessage(from, { text: "❌ Impossible de bloquer cet utilisateur." }, { quoted: msg });
  }
}