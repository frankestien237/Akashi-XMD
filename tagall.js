export const name = "tagall";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;
  if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "> Akashi XMD : ⚠️ Groupe uniquement." });

  const metadata = await sock.groupMetadata(from);
  const participants = metadata.participants;
  const customMsg = args.join(" ") || "Appel général !";

  let text = `> 📢 *TAG ALL - AKASHI XMD*\n> 📝 Message : ${customMsg}\n\n`;
  for (let p of participants) {
    text += `> ➤ @${p.id.split('@')[0]}\n`;
  }
  text += `\n> By Dev Akashi`;

  await sock.sendMessage(from, { text, mentions: participants.map(p => p.id) }, { quoted: msg });
}