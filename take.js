import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import pino from 'pino';

export const name = "take";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;

  try {
    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    
    if (!quotedMsg || !quotedMsg.stickerMessage) {
      return await sock.sendMessage(from, { text: "⚠️ Veuillez répondre à un sticker avec la commande : `.take [Nom Pack] | [Auteur]`" }, { quoted: msg });
    }

    // Récupérer le nom du pack et l'auteur séparés par un "|"
    const textArgs = args.join(" ").split("|");
    const packname = textArgs[0] ? textArgs[0].trim() : "Akashi XMD";
    const author = textArgs[1] ? textArgs[1].trim() : "Arnold";

    // Télécharger le sticker source
    const buffer = await downloadMediaMessage(
      { message: quotedMsg },
      'buffer',
      {},
      { logger: pino({ level: 'silent' }) }
    );

    // Créer le nouveau sticker personnalisé
    const sticker = new Sticker(buffer, {
      pack: packname,
      author: author,
      type: StickerTypes.FULL,
      categories: ['🤩', '🎉'],
      id: '12345',
      quality: 50,
      background: '#00000000'
    });

    const stickerBuffer = await sticker.toBuffer();

    // Renvoyer le sticker modifié
    await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg });
    console.log(`✅ Sticker renommé avec succès sous le pack : ${packname} | Auteur : ${author}`);

  } catch (err) {
    console.error("Erreur sur la commande take :", err);
    await sock.sendMessage(from, { text: "❌ Une erreur est survenue lors du renommage du sticker." }, { quoted: msg });
  }
}