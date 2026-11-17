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
  return false;
}