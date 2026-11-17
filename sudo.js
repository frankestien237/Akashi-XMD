import fs from 'fs';

export const name = "sudo";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || from;
  const cleanSender = String(sender).replace(/[^0-9]/g, '');
  const OWNER_NUMBER = "237698278163";

  // Autorise uniquement le propriétaire principal (ou si le message vient de toi avec fromMe)
  if (cleanSender !== OWNER_NUMBER && !msg.key.fromMe) {
    return await sock.sendMessage(from, { text: "❌ Cette commande est strictement réservée au propriétaire du bot !" }, { quoted: msg });
  }

  // Récupération de la cible (tag, réponse ou numéro)
  const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
  let target = contextInfo?.mentionedJid?.[0] || contextInfo?.participant;

  if (!target && args[0]) {
    target = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
  }

  if (!target) {
    return await sock.sendMessage(from, { text: "⚠️ Veuillez taguer ou donner le numéro de la personne à ajouter en Sudo." }, { quoted: msg });
  }

  const cleanTarget = target.replace(/[^0-9]/g, '');

  try {
    let sudos = [];
    if (fs.existsSync('./sudo.json')) {
      sudos = JSON.parse(fs.readFileSync('./sudo.json', 'utf-8'));
    }

    if (sudos.includes(cleanTarget)) {
      return await sock.sendMessage(from, { text: "⚠️ Ce numéro est déjà dans la liste Sudo !" }, { quoted: msg });
    }

    sudos.push(cleanTarget);
    fs.writeFileSync('./sudo.json', JSON.stringify(sudos, null, 2));

    await sock.sendMessage(from, { text: `✅ Succès ! Le numéro +${cleanTarget} a été ajouté aux administrateurs Sudo.` }, { quoted: msg });
  } catch (err) {
    console.error("Erreur sudo.js :", err);
    await sock.sendMessage(from, { text: "❌ Une erreur est survenue lors de l'enregistrement." }, { quoted: msg });
  }
}