const {
  SlashCommandBuilder,
  EmbedBuilder,
  ChannelType,
  version,
} = require("discord.js");
const mongoose = require("mongoose");
const os = require("os");
module.exports = {
  CMD: new SlashCommandBuilder()
    .setDescription("🤖 Información principal del bot")
    .addSubcommand((sub) =>
      sub.setName("ping").setDescription("🔌 Revisa la latencia del bot")
    )
    .addSubcommand((sub) =>
      sub.setName("info").setDescription("🤖 Información principal del bot")
    )
    .addSubcommand((sub) =>
      sub.setName("support").setDescription("🤖 Información de soporte del bot")
    ),

  async execute(client, interaction, prefix) {
    try {
      const { options, guild } = interaction;

      switch (options.getSubcommand()) {
        case "ping":
          {
            const startTime = Date.now();
            await mongoose.connection.db.stats();
            const endTime = Date.now();

            interaction.reply({
              content: `> <:connection:1229255988591202304> **Latencia de ${
                client.user.username
              }:** \`${client.ws.ping}ms\` • **Base de Datos:** \`${
                endTime - startTime
              }ms\``,
            });
          }
          break;

        case "info":
          {
            const estado = [
              "Desconectada",
              "Conectada",
              "Conectada",
              "Desconectada",
            ];

            const tipoCanal = (type) =>
              client.channels.cache.filter((channel) =>
                type.includes(channel.type)
              ).size;

            await client.user.fetch();
            await client.application.fetch();

            interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setAuthor({
                    name: `Información de ${client.user.displayName}`,
                    iconURL: client.user.avatarURL({
                      extension: "png",
                      size: 1024,
                    }),
                  })
                  .setThumbnail(
                    client.user.avatarURL({ extension: "png", size: 1024 })
                  )
                  .setImage(
                    client.user.bannerURL({ extension: "png", size: 512 })
                  )
                  .addFields(
                    {
                      name: `Información General`,
                      value: [
                        `📋 • **ID:** \`${client.user.id}\``,
                        `<:owner:1198448330641002548> • **Dueño:** ${
                          client.application.owner || "`No disponible`"
                        }`,
                        `🌍 • **Nombre:** ${client.user.username}`,
                        `📅 • **Creación:** <t:${parseInt(
                          client.user.createdTimestamp / 1000
                        )}:R>`,
                      ].join("\n"),
                    },
                    {
                      name: `Sistema`,
                      value: [
                        `<:connection:1229255988591202304> • **Base de Datos:** ${
                          estado[mongoose.connection.readyState]
                        }`,
                        `💻 • **Modelo:** ${os
                          .type()
                          .replace("Windows_NT", "Windows")
                          .replace("Darwin", "macOS")}`,
                        `🔩 • **CPU:** ${os.cpus()[0].model}`,
                        `💾 • **Uso de Memoria:** ${(
                          process.memoryUsage().heapUsed /
                          1024 /
                          1024
                        ).toFixed(2)}%`,
                      ].join("\n"),
                    },
                    {
                      name: `Versiones`,
                      value: [
                        `<:developer:1198448425105109063> • **Cliente:** <:beta:1229539225050026044> v8.0`,
                        `<:node_js:1229536843528273988> • **Node.js:** ${process.version}`,
                        `<:DiscordJS:1229536959836192941> • **Discord.js:** v${version}`,
                      ].join("\n"),
                    },
                    {
                      name: `Estadísticas`,
                      value: [
                        `<:bot:1198447609187143792> • **Comandos:** ${client.slashCommands.size}`,
                        `<:connection:1229255988591202304> • **Ping:** ${client.ws.ping}`,
                        `<:time:1198844708655485048> • **Tiempo de Actividad:** <t:${parseInt(
                          client.readyTimestamp / 1000
                        )}:R>`,
                        `🏡 • **Servidores:** ${client.guilds.cache.size}`,
                        `<:members:1198448160847188050> • **Usuarios:** ${client.users.cache.size}`,
                        `💬 • **Canales de Texto:** ${tipoCanal([
                          ChannelType.GuildText,
                          ChannelType.GuildAnnouncement,
                          ChannelType.GuildForum,
                          ChannelType.PublicThread,
                          ChannelType.PrivateThread,
                        ])}`,
                        `🔊 • **Canales de Voz:** ${tipoCanal([
                          ChannelType.GuildVoice,
                          ChannelType.GuildStageVoice,
                        ])}`,
                      ].join("\n"),
                    }
                  )
                  .setColor(process.env.COLOR),
              ],
            });
          }
          break;

        case "support":
          {
            interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setAuthor({
                    name: `¿Necesitas ayuda para utilizar a ${client.user.username}?`,
                    iconURL: client.user.avatarURL({
                      extension: "png",
                      size: 1024,
                    }),
                  })
                  .setDescription(
                    `¡Puedes solicitar apoyo o reportar errores en nuestro servidor de Discord!\n\nO si deseas una atención más directa puedes enviar un mensaje al perfil de nuestro desarrollador \`manucatun\`.`
                  )
                  .addFields({
                    name: `Contacto`,
                    value: [
                      `<:developer:1198448425105109063> • **Desarrollador:** manucatun`,
                      `<:guidelines:1198447843317403728> • **Servidor:** [Rub Development](https://discord.com/invite/S7VbXG8eK8)`,
                    ].join("\n"),
                  })
                  .setColor(process.env.COLOR),
              ],
              content: `> <:info:1198447934568669274> Servidor de Soporte: https://discord.com/invite/S7VbXG8eK8`,
            });
          }
          break;
      }
    } catch (e) {
      console.log(e);
      interaction.reply({
        content: `> <:error:1198447011448508466> **¡Ocurrió un error al intentar ejecutar el comando!**`,
        ephemeral: true,
      });
    }
  },
};
