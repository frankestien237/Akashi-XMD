// ==========================================
// Commande / Module : Mini-Jeux (by devakashi)
// ==========================================
export const name = 'jeu';

export async function execute(sock, msg, args) {
  const remoteJid = msg.key.remoteJid;
  const choix = args[0]?.toLowerCase();

  if (!choix || (choix !== 'pile' && choix !== 'face')) {
    await sock.sendMessage(remoteJid, { text: "🎮 **Mini-Jeu (Pile ou Face)**\n\nUtilise : `.jeu pile` ou `.jeu face` pour tenter ta chance ! [by devakashi]" }, { quoted: msg });
    return;
  }

  const resultat = Math.random() < 0.5 ? 'pile' : 'face';
  const gagne = choix === resultat;

  const texte = gagne 
    ? `🎉 **Victoire !** C'était bien tombé sur **${resultat.toUpperCase()}**. Bien joué ! 🚀` 
    : `❌ **Perdu !** C'est tombé sur **${resultat.toUpperCase()}**. Retente ta chance !`;

  await sock.sendMessage(remoteJid, { text: texte }, { quoted: msg });
}