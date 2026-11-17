export const name = "menu";

export async function execute(sock, msg, args, akashiImageCache) {
  const from = msg.key.remoteJid;

  const menuText = `
┌── 「 🌟 **AKASHI XMD** 🌟 」 ──
│
│ 👑 *Propriétaire:* Dev Akashi
│ ⚡ *Statut:* En ligne & Rapide
│
├── 「 🛠️ **COMMANDES ADMIN & GROUPE** 」 ──
│ ▫️ .promote [tag/numéro]
│ ▫️ .demote [tag/numéro]
│ ▫️ .kick [tag/numéro]
│ ▫️ .kickall
│ ▫️ .ripadmin
│ ▫️ .purge (répondre au message)
│ ▫️ .mute / .unmute
│ ▫️ .warn
│
├── 「 ⚙️ **UTILITAIRES & SUDO** 」 ──
│ ▫️ .sudo [tag/numéro]
│ ▫️ .delsudo [tag/numéro]
│ ▫️ .ping
│ ▫️ .menu
│ ▫️ .setppbot
│
└───────────────────────────
`.trim();

  try {
    if (akashiImageCache) {
      await sock.sendMessage(from, { 
        image: akashiImageCache, 
        caption: menuText 
      }, { quoted: msg });
    } else {
      await sock.sendMessage(from, { text: menuText }, { quoted: msg });
    }
  } catch (err) {
    console.error("Erreur sur le menu :", err);
    await sock.sendMessage(from, { text: menuText }, { quoted: msg });
  }
}