import fs from 'fs';
import path from 'path';

export const name = "delsudo";

const sudoFile = path.resolve('./sudoers.json');

// Fonction pour récupérer les sudoers
function getSudoers() {
  if (!fs.existsSync(sudoFile)) return [];
  try {
    return JSON.parse(fs.readFileSync(sudoFile, 'utf8'));
  } catch {
    return [];
  }
}

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || from;
  const senderNumber = sender.replace(/[^0-9]/g, '');

  // Ton numéro de propriétaire principal
  const ownerNumber = "237698278163";
  let sudoers = getSudoers();

  const isOwner = senderNumber === ownerNumber;
  const isSudo = sudoers.includes(senderNumber);

  // Seul le propriétaire ou un sudo peut retirer un autre sudo
  if (!isOwner && !isSudo) {
    await sock.sendMessage(from, { text: "❌ Réservé aux administrateurs Sudo ou au propriétaire !" }, { quoted: msg });
    return;
  }

  let target = args[0] ? args[0].replace(/[^0-9]/g, '') : null;

  // Si l'utilisateur a tagué quelqu'un
  if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
    target = msg.message.extendedTextMessage.contextInfo.mentionedJid[0].replace(/[^0-9]/g, '');
  }

  if (!target) {
    await sock.sendMessage(from, { text: "⚠️ Utilisation : `.delsudo [numéro]` ou en taguant la personne." }, { quoted: msg });
    return;
  }

  const index = sudoers.indexOf(target);
  if (index > -1) {
    sudoers.splice(index, 1);
    fs.writeFileSync(sudoFile, JSON.stringify(sudoers, null, 2));
    await sock.sendMessage(from, { text: `✅ Le numéro @${target} a été retiré des administrateurs Sudo.`, mentions: [`${target}@s.whatsapp.net`] }, { quoted: msg });
  } else {
    await sock.sendMessage(from, { text: `❌ Ce numéro ne fait pas partie de la liste sudo.` }, { quoted: msg });
  }
}