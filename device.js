import { getDevice } from '@whiskeysockets/baileys';

export const name = "device";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;

  try {
    // Récupérer le message cité ou celui de l'expéditeur
    const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const targetMsgKey = msg.message?.extendedTextMessage?.contextInfo?.stanzaId;
    
    // Déterminer l'ID du message à analyser
    let targetId = msg.key.id;
    if (targetMsgKey) {
      targetId = targetMsgKey;
    }

    // Baileys fournit une fonction native pour identifier l'appareil via l'ID du message
    const device = getDevice(targetId); // 'ios', 'android', 'desktop', etc.

    let deviceFormatted = "Inconnu";
    if (device === 'ios') deviceFormatted = "🍎 iPhone (iOS)";
    else if (device === 'android') deviceFormatted = "🤖 Android";
    else if (device === 'desktop') deviceFormatted = "💻 WhatsApp Web / Desktop";

    await sock.sendMessage(from, { 
      text: `📱 **Appareil détecté :** ${deviceFormatted}` 
    }, { quoted: msg });

  } catch (err) {
    console.error("Erreur device:", err);
    await sock.sendMessage(from, { text: "❌ Impossible de détecter l'appareil pour ce message." }, { quoted: msg });
  }
}