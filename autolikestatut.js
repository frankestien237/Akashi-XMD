let autoLikeEnabled = true; // Activé par défaut

export const name = "autolikestatut";

export async function handleAutoLikeStatus(sock, msg) {
  if (!autoLikeEnabled) return;
  try {
    const participant = msg.key.participant;
    if (!participant) return;

    await sock.readMessages([msg.key]); // Marque le statut comme vu
    await sock.sendMessage(
      'status@broadcast',
      { react: { text: '❤️', key: msg.key } },
      { statusJidList: [participant] }
    );
  } catch (e) {
    console.error("Erreur autolike statut :", e);
  }
}

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;
  const state = args[0]?.toLowerCase();

  if (state === 'on') {
    autoLikeEnabled = true;
    await sock.sendMessage(from, { text: "> Akashi XMD : ✅ Auto-Like des statuts *ACTIVÉ* ❤️" }, { quoted: msg });
  } else if (state === 'off') {
    autoLikeEnabled = false;
    await sock.sendMessage(from, { text: "> Akashi XMD : ❌ Auto-Like des statuts *DÉSACTIVÉ*" }, { quoted: msg });
  } else {
    await sock.sendMessage(from, { text: `> Akashi XMD : Statut actuel : *${autoLikeEnabled ? 'ACTIVÉ' : 'DÉSACTIVÉ'}*\nUtilise \`.autolikestatut on\` ou \`.autolikestatut off\`` }, { quoted: msg });
  }
}