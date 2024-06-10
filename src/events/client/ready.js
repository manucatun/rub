const mongoose = require("mongoose");
const {
  WebhookClient,
  EmbedBuilder,
  version: djsversion,
} = require("discord.js");
const webhook = new WebhookClient({ url: process.env.WEBHOOK });

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
