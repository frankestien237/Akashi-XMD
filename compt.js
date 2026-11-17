const messageCounts = {}; // { groupId: { userId: count } }

export const name = "compt";

export function trackMessage(msg) {
  const groupId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  if (!messageCounts[groupId]) messageCounts[groupId] = {};
  if (!messageCounts[groupId][sender]) messageCounts[groupId][sender] = 0;
  messageCounts[groupId][sender]++;
}

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;
  if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "> Akashi XMD : ⚠️ Groupe uniquement." });

  const groupData = messageCounts[from];
  if (!groupData || Object.keys(groupData).length === 0) {
    return sock.sendMessage(from, { text: "> Akashi XMD : 📊 Aucun message enregistré pour le moment." });
  }

  const sorted = Object.entries(groupData).sort((a, b) => b[1] - a[1]);
  let text = `> 📊 *CLASSEMENT DES MESSAGES DU GROUPE*\n\n`;
  let mentions = [];

  sorted.forEach(([user, count], index) => {
    text += `> ${index + 1}. @${user.split('@')[0]} : *${count} messages*\n`;
    mentions.push(user);
  });

  text += `\n> 👥 Total participants actifs : ${sorted.length}\n> By Dev Akashi`;

  await sock.sendMessage(from, { text, mentions }, { quoted: msg });
}