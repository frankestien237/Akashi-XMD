export const name = "Bonjour ";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;

  try {
    // 1. Récupérer des informations utiles si besoin
    const sender = msg.key.participant || from;
    const isGroup = from.endsWith('@g.us');

    console.log(`⚡ Exécution de la commande '${name}' par ${sender}`);

    // 2. Ton code personnalisé ici...
    const texteReponse = `✅ La commande a fonctionné avec succès ! Arguments reçus : ${args.join(', ')}`;

    // 3. Envoyer la réponse sur WhatsApp
    await sock.sendMessage(from, { text: texteReponse }, { quoted: msg });

  } catch (err) {
    console.error(`❌ Erreur lors de l'exécution de la commande ${name}:`, err);
    await sock.sendMessage(from, { text: "❌ Une erreur est survenue lors de l'exécution de cette commande." }, { quoted: msg });
  }
}