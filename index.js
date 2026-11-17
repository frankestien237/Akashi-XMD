// ==========================================
// Bot : AKASHI XDM (by devakashi)
// ==========================================
import { makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers, downloadMediaMessage, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import fs from 'fs';
import pino from 'pino';
import readline from 'readline';
import express from 'express';
import cors from 'cors';

process.env.LOG_LEVEL = 'silent';

const akashiImageCache = fs.existsSync('./akashi.jpeg') ? fs.readFileSync('./akashi.jpeg') : null;
const groupCache = new Map();
const spamTracker = new Map();

const OWNER_NUMBER = "237698278163"; // Ton numéro de propriétaire principal

// Initialisation d'Express pour recevoir les requêtes de Vercel (/pair)
const app = express();
app.use(cors());
app.use(express.json());

let activeSock = null; // Stocke la session active du bot pour le pairing via web

// Fonction pour demander le numéro en local (sur ton PC)
const question = (text) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(text, (ans) => { rl.close(); resolve(ans); }));
};

function isAuthorized(senderJid, msg) {
  if (msg?.key?.fromMe) return true;
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
  'mute', 'unmute', 'block', 'sudo', 'delsudo', 
  'promote', 'demote', 'kick', 'remove', 'kickall', 
  'ripadmin', 'purge', 'warn', 'setppbot'
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
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    browser: Browsers.ubuntu('Chrome'),
    syncFullHistory: false,
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: false,
    cachedGroupMetadata: async (jid) => groupCache.get(jid)
  });

  activeSock = sock; // Sauvegarde l'instance pour la route /pair
  sock.ev.on('creds.update', saveCreds);

  // --- SYSTÈME DE CODE D'APPAIRAGE EN LOCAL (CLI) ---
  if (!sock.authState.creds.registered) {
    let targetPhone = process.env.PHONE_NUMBER;

    if (!targetPhone && process.stdin.isTTY) {
      targetPhone = await question('📱 Entre le numéro WhatsApp pour connecter le bot (ex: 2376xxxxxxxx) : ');
    }

    if (targetPhone) {
      setTimeout(async () => {
        try {
          const cleanNumber = targetPhone.trim().replace(/[^0-9]/g, '');
          console.log(`⏳ Génération du code d'appairage pour : ${cleanNumber}...`);
          let code = await sock.requestPairingCode(cleanNumber);
          code = code?.match(/.{1,4}/g)?.join('-') || code;
          console.log(`\n========================================`);
          console.log(`🔑 CODE D'APPAIRAGE AKASHI XDM : ${code}`);
          console.log(`========================================\n`);
        } catch (err) {
          console.error("Erreur génération code d'appairage :", err);
        }
      }, 4000);
    }
  }

  sock.ev.on('groups.update', async ([event]) => {
    try {
      const metadata = await sock.groupMetadata(event.id);
      groupCache.set(event.id, metadata);
    } catch {}
  });

  sock.ev.on('group-participants.update', async (anu) => {
    try {
      const remoteJid = anu.id;
      const participants = anu.participants;
      
      const settings = fs.existsSync('./settings.json') ? JSON.parse(fs.readFileSync('./settings.json', 'utf-8')) : { welcome: {} };
      if (!settings.welcome?.[remoteJid]) return;

      if (anu.action === 'add') {
        const metadata = await sock.groupMetadata(remoteJid).catch(() => null);
        const groupName = metadata ? metadata.subject : "le groupe";

        for (const num of participants) {
          const userTag = `@${num.split('@')[0]}`;
          const welcomeText = `👋 Bienvenue ${userTag} dans **${groupName}** !\n\n📜 Lis bien les règles et amuse-toi bien.\n⚙️ *Propulsé par AKASHI XDM (by devakashi)*`;
          
          await sock.sendMessage(remoteJid, { 
            text: welcomeText, 
            mentions: [num] 
          });
        }
      }
    } catch (e) {
      console.error("Erreur dans l'événement group-participants.update :", e);
    }
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    
    if (connection === 'open') {
      console.log('⚡ AKASHI XDM connecté et sécurisé avec succès ! (by devakashi)');
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

      if (isGroup && !isAuthorized(sender, msg)) {
        const settings = fs.existsSync('./settings.json') ? JSON.parse(fs.readFileSync('./settings.json', 'utf-8')) : { antispam: {} };
        if (settings.antispam?.[remoteJid]) {
          const key = `${remoteJid}_${sender}`;
          const now = Date.now();
          const userData = spamTracker.get(key) || { count: 0, lastTime: now };

          if (now - userData.lastTime < 5000) {
            userData.count += 1;
            if (userData.count >= 5) {
              await sock.sendMessage(remoteJid, { delete: msg.key });
              await sock.sendMessage(remoteJid, { text: `⚠️ @${sender.split('@')[0]}, doucement sur le spam !`, mentions: [sender] });
              userData.count = 0;
            }
          } else {
            userData.count = 1;
            userData.lastTime = now;
          }
          spamTracker.set(key, userData);
        }
      }

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
        ';';

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

// --- ROUTE WEB POUR LE PAIRING DEPUIS VERCEL ---
app.get('/pair', async (req, res) => {
    const phoneNumber = req.query.phone;
    if (!phoneNumber) {
        return res.status(400).json({ error: "Numéro manquant" });
    }

    try {
        if (!activeSock) {
            return res.status(500).json({ error: "Le bot n'est pas encore initialisé sur le serveur." });
        }

        const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
        let code = await activeSock.requestPairingCode(cleanNumber);
        code = code?.match(/.{1,4}/g)?.join('-') || code;
        
        return res.json({ code: code });
    } catch (err) {
        console.error("Erreur route /pair:", err);
        res.status(500).json({ error: "Erreur interne lors de la génération du code." });
    }
});

// Lancement du serveur Express sur le port assigné par Render (ou 3000 par défaut)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🌐 Serveur Web / API démarré sur le port ${PORT}`);
});

startBot();