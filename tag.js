export const name = "tag";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;
  if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "> Akashi XMD : ⚠️ Groupe uniquement." });

  const metadata = await sock.groupMetadata(from);
  const participants = metadata.participants.map(p => p.id);
  const message = args.join(" ") || msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation || "📢 Annonce importante !";

  await sock.sendMessage(from, { text: message, mentions: participants }, { quoted: msg });
}