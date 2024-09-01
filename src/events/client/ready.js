const mongoose = require("mongoose");
const {
  WebhookClient,
  EmbedBuilder,
  version: djsversion,
} = require("discord.js");
const webhook = new WebhookClient({ url: process.env.WEBHOOK });
const SpotifyWebAPI = require("spotify-web-api-node");
const spotifyApi = new SpotifyWebAPI({
  clientId: "c7cab45bd5e144a9b343a39fe93983fd",
  clientSecret: "a7d5fcbafeda4f6fbd3a2f6e790527dc",
  redirectUri: "https://dsc.gg/rub-",
});

module.exports = (client) => {
  mongoose
    .connect(process.env.MONGODB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log(
        `〔🔗〕Conectado a la base de datos de Mongo DB`.brightBlue.bold
      );
    })
    .catch((err) => {
      console.log(err);
      console.log(
        `〔🔗〕Error al conectar a la base de datos de Mongo DB!`.bgRed
      );
    });

  console.log(`〔🔗〕Conectando a la base de datos de Mongo DB`.yellow);

  if (client?.application?.commands) {
    client.application.commands.set(client.slashArray);
    console.log(
      `〔🤖〕${client.slashCommands.size} Slash Commands Publicados!`
        .brightGreen.bold
    );
  }

  /* Conectar API de Spotify */
  spotifyApi.clientCredentialsGrant().then(
    function (data) {
      console.log(
        `〔🎶〕Conectado a la API de Spotify: ${data.body["access_token"]}`
          .brightMagenta.bold
      );
      spotifyApi.setAccessToken(data.body["access_token"]);
    },
    function (err) {
      console.log(`〔🔗〕Error al conectar a la API de Spotify!`.bgRed);
    }
  );
  /* Conectar API de Spotify */

  webhook.send({
    embeds: [
      new EmbedBuilder()
        .setAuthor({
          name: `${client.user.username} iniciado correctamente`,
          iconURL: client.user.avatarURL({ extension: "png", size: 1024 }),
        })
        .setDescription(
          `
                > <:Online:992251088252178472> • **Inicio del Bot:** <t:${Math.round(
                  Date.now() / 1000
                )}>
                > <:slowmode:991921425080393728> • **Tiempo de Actividad:** <t:${Math.round(
                  Date.now() / 1000
                )}:R>
                > <:mention:991923004743352320> • **Estado de Actividad:** ${
                  process.env.STATUS_TYPE
                } ${process.env.STATUS}
                > <:discordjs:992234427247755274> • **Versión de Discord.JS:** v${djsversion}
                > <:nodejs:992250978852143236> • **Versión de Node.JS:** ${
                  process.version
                }
                `
        )
        .addFields({
          name: `Slash Commands`,
          value: `\`\`\`yml\n${client.slashCommands.size} cargados\`\`\``,
          inline: true,
        })
        .setTimestamp(),
    ],
  });
};

module.exports.spotifyApi = spotifyApi;
