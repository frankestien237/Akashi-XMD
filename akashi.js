import axios from 'axios';

export const name = "akashi"; // Command .akashi <question>

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;
  const query = args.join(" ");

  if (!query) {
    await sock.sendMessage(from, { text: "> Akashi XMD : ⚠️ Posez une question !\nExemple : `.akashi Comment dominer le monde ?`" }, { quoted: msg });
    return;
  }

  try {
    const waitMsg = await sock.sendMessage(from, { text: "> Akashi XMD : 🤖 Réflexion en cours..." }, { quoted: msg });

    const apiUrl = `https://apis.davidcyriltech.my.id/ai/chatbot?query=${encodeURIComponent(query)}`;
    const { data } = await axios.get(apiUrl);

    if (!data.status || !data.result) {
      throw new Error("Aucune réponse obtenue de l'IA.");
    }

    const replyText = `👑 *AKASHI XMD - IA*\n\n${data.result}\n\n> By Dev Akashi`;
    
    await sock.sendMessage(from, { text: replyText }, { quoted: waitMsg });
  } catch (err) {
    console.error("Erreur akashi AI :", err);
    await sock.sendMessage(from, { text: `> Akashi XMD : ❌ Erreur -> ${err.message}` }, { quoted: msg });
  }
}