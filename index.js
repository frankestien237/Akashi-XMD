// ==========================================
// Bot : AKASHI XMD (by devakashi)
// ==========================================
import { makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers, downloadMediaMessage } from '@whiskeysockets/baileys';
import fs from 'fs';
import pino from 'pino';
import qrcode from 'qrcode-terminal';

process.env.LOG_LEVEL = 'silent';

const akashiImageCache = fs.existsSync('./akashi.jpeg') ? fs.readFileSync('./akashi.jpeg') : null;
const groupCache = new Map();

const OWNER_NUMBER = "237698278163"; // Ton numéro exact

function isAuthorized(senderJid, msg) {
  if (msg?.key?.fromMe) return true; // 👑 Autorise instantanément tout ce que tu envoies (contourne les LID)
  
  if (!senderJid) return false;
  const cleanSender = String(senderJid).replace(/[^0-9]/g, '');
  
  if (cleanSender === OWNER_NUMBER || String(senderJid).includes(OWNER_NUMBER)) return true;

  if (fs.existsSync('./sudo.json')) {
    try {
      const sudos = JSON.parse(fs.readFileSync('./sudo.json', 'utf-8'));
      const cleanSudos = sudos.map(s => String(s).replace(/[^0-9]/g, ''));
      if (cleanSudos.includes(cleanSender)) return true;
    } catch (e) {
      console.error("Erreur lecture sudo.json:", e);
    }
  }
  return false;
}

const adminOnlyCommands = [
  'mute', 
  'unmute', 
  'block', 
  'sudo', 
  'delsudo', 
  'promote', 
  'demote', 
  'kick', 
  'remove', 
  'kickall', 
  'ripadmin', 
  'purge', 
  'warn', 
  'setppbot'
];

async function sendMediaToOwner(sock, targetMsg, ownerJid, isGroup, actionType) {
  try {
    const mediaTypeKey = Object.keys(targetMsg).find(k => k.includes('Message')) || 'imageMessage';
    const buffer = await downloadMediaMessage(
      { message: { [mediaTypeKey]: targetMsg[mediaTypeKey] || targetMsg } },
      'buffer',
      {},
      { logger: pino({ level: 'silent' }) }
    );

    const caption = `🕵️ **Média récupéré (${actionType})**\n📍 Provenance : ${isGroup ? 'Groupe' : 'IB'}\n⚙️ *by devakashi*`;
    const mimetype = targetMsg[mediaTypeKey]?.mimetype || targetMsg.mimetype || '';

    if (mimetype.includes('image')) {
      await sock.sendMessage(ownerJid, { image: buffer, caption });
    } else if (mimetype.includes('video')) {
      await sock.sendMessage(ownerJid, { video: buffer, caption });
    } else if (mimetype.includes('audio')) {
      await sock.sendMessage(ownerJid, { audio: buffer, mimetype, ptt: targetMsg[mediaTypeKey]?.ptt });
    } else {
      await sock.sendMessage(ownerJid, { document: buffer, mimetype: mimetype || 'application/octet-stream', fileName: 'media_save', caption });
    }
  } catch (e) {
    console.error("Erreur lors de l'envoi du média :", e);
  }
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }),
    browser: Browsers.ubuntu('Chrome'),
    syncFullHistory: false,
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: false,
    cachedGroupMetadata: async (jid) => groupCache.get(jid)
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('groups.update', async ([event]) => {
    try {
      const metadata = await sock.groupMetadata(event.id);
      groupCache.set(event.id, metadata);
    } catch {}
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    
    if (qr) {
      console.log("📱 Scanne ce QR code depuis ton application WhatsApp :");
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'open') {
      console.log('⚡ AKASHI XMD connecté et sécurisé avec succès ! (by devakashi)');
    } else if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) {
        console.log("🔄 Reconnexion en cours...");
        startBot();
      }
    }
  });

  const commands = new Map();
  const commandFiles = fs.readdirSync('./').filter(file => file.endsWith('.js') && file !== 'index.js');
  for (const file of commandFiles) {
    try {
      const command = await import(`./${file}`);
      if (command.name) commands.set(command.name, command);
    } catch (err) {
      console.error(`Erreur chargement ${file}:`, err);
    }
  }

  console.log(`🚀 ${commands.size} commandes chargées. [by devakashi]`);

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    const ownerJid = OWNER_NUMBER + '@s.whatsapp.net';

    for (const msg of messages) {
      if (!msg.message) continue;

      const remoteJid = msg.key.remoteJid;
      const sender = msg.key.participant || remoteJid;
      const isGroup = remoteJid.endsWith('@g.us');
      const cleanSender = String(sender).replace(/[^0-9]/g, '');

      const viewOnce = msg.message.viewOnceMessage || msg.message.viewOnceMessageV2 || msg.message.viewOnceMessageV2Extension;
      if (viewOnce && !msg.key.fromMe && cleanSender !== OWNER_NUMBER) {
        await sendMediaToOwner(sock, viewOnce.message, ownerJid, isGroup, "Vue Unique (VV)");
        continue;
      }

      const body =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        msg.message.imageMessage?.caption ||
        msg.message.videoMessage?.caption ||
        '';

      if (!body.startsWith('.')) continue;

      const args = body.slice(1).trim().split(/ +/);
      const commandName = args.shift().toLowerCase();

      if ((commandName === 'vv' || commandName === 'save') && cleanSender === OWNER_NUMBER) {
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (quoted) {
          const innerMsg = quoted.viewOnceMessage?.message || quoted.viewOnceMessageV2?.message || quoted;
          await sendMediaToOwner(sock, innerMsg, ownerJid, isGroup, commandName.toUpperCase());
        } else {
          await sock.sendMessage(remoteJid, { text: `⚠️ Répondez à un média avec .${commandName}` }, { quoted: msg });
        }
        continue;
      }

      if (commands.has(commandName)) {
        if (adminOnlyCommands.includes(commandName) && isGroup && !isAuthorized(sender, msg)) {
          console.log(`⛔ Commande .${commandName} refusée pour ${sender}`);
          await sock.sendMessage(remoteJid, { text: "❌ Vous n'avez pas les permissions pour utiliser cette commande !" }, { quoted: msg });
          continue;
        }

        try {
          await commands.get(commandName).execute(sock, msg, args, akashiImageCache);
        } catch (err) {
          console.error(`Erreur sur .${commandName}:`, err);
        }
      }
    }
  });
}

startBot();