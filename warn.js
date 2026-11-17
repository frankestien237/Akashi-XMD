const warnings = {}; // { groupId: { userId: count } }

export const name = "warn";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;
  if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "> Akashi XMD : ⚠️ Groupe uniquement." });

  const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || msg.message?.extendedTextMessage?.contextInfo?.participant;
  if (!target) return sock.sendMessage(from, { text: "> Akashi XMD : ⚠️ Mentionne ou réponds au membre à avertir." });

  if (!warnings[from]) warnings[from] = {};
  if (!warnings[from][target]) warnings[from][target] = 0;

  warnings[from][target]++;
  const count = warnings[from][target];

  if (count >= 3) {
    await sock.sendMessage(from, { 
      text: `> 🚨 *3/3 AVERTISSEMENTS ATTEINTS*\n> ☠️ RIP @${target.split('@')[0]} ! Expulsion immédiate...`, 
      mentions: [target] 
    });
    try {
      await sock.groupParticipantsUpdate(from, [target], "remove");
      warnings[from][target] = 0; // Réinitialise après expulsion
    } catch (e) {
      await sock.sendMessage(from, { text: "> Akashi XMD : ❌ Impossible d'expulser (le bot doit être admin)." });
    }
  } else {
    await sock.sendMessage(from, { 
      text: `> ⚠️ *AVERTISSEMENT (${count}/3)*\n> 👤 Membre : @${target.split('@')[0]}\n> Encore ${3 - count} avertissement(s) avant le RIP !`, 
      mentions: [target] 
    });
  }
}