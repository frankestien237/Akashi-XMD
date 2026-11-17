import axios from "axios";

export const name = "play";

export async function execute(sock, msg, args) {

  const from = msg.key.remoteJid;

  const title = args.join(" ");

  if (!title) {

    await sock.sendMessage(

      from,

      { text: "> Akashi XMD : Donne un titre ou un artiste pour lancer la recherche." },

      { quoted: msg }

    );

    return;

  }

  try {

    // Étape 1 : message de chargement initial

    const loadingMsg = await sock.sendMessage(

      from,

      { text: `> Akashi XMD : 🔎 Recherche de *${title}* en cours...` },

      { quoted: msg }

    );

    // Appel API

    const apiUrl = `https://apis.davidcyriltech.my.id/play?query=${encodeURIComponent(title)}`;

    const { data } = await axios.get(apiUrl);

    if (!data.status || !data.result || !data.result.download_url) {

      throw new Error("Aucun résultat trouvé ou lien indisponible.");

    }

    const video = data.result;

    // Infos + vignette

    const caption = 

`> 📌 Titre : ${video.title}
> ⏱️ Durée : ${video.duration}
> 🔗 Lien : ${video.video_url}

> 📥 Téléchargement de l’audio en cours...

> By Dev Akashi`;

    await sock.sendMessage(

      from,

      {

        image: { url: video.thumbnail },

        caption,

      },

      { quoted: msg }

    );

    // Envoi audio

    await sock.sendMessage(

      from,

      {

        audio: { url: video.download_url },

        mimetype: "audio/mp4",

        ptt: false,

      },

      { quoted: msg }

    );

  } catch (err) {

    console.error("Erreur play :", err);

    await sock.sendMessage(

      from,

      { text: `> Akashi XMD : Échec de la recherche.\n⚠️ ${err.message}` },

      { quoted: msg }

    );

  }

}