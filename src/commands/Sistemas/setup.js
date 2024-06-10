const {
  SlashCommandBuilder,
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
} = require("discord.js");
const setupSchema = require("../../models/setup");
module.exports = {
  CMD: new SlashCommandBuilder()
    .setDescription("👔 Define varios sistemas del bot")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((sub) =>
      sub
        .setName("tickets")
        .setDescription("👔 Define el canal para crear tickets")
        .addChannelOption((option) =>
          option
            .setName("canal")
            .setDescription("¿En qué canal se podrán crear los tickets?")
            .addChannelTypes(ChannelType.GuildText)
        )
        .addStringOption((option) =>
          option
            .setName("mensaje")
            .setDescription("¿Qué mensaje contendrá el embed?")
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("suggestions")
        .setDescription("👔 Define el canal para el sistema de sugerencias")
        .addChannelOption((option) =>
          option
            .setName("canal")
            .setDescription("¿En qué canal se enviarán las sugerencias?")
            .addChannelTypes(ChannelType.GuildText)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("confessions")
        .setDescription("👔 Define el canal para el sistema de confesiones")
        .addChannelOption((option) =>
          option
            .setName("canal")
            .setDescription("¿En qué canal se enviarán las confesiones?")
            .addChannelTypes(ChannelType.GuildText)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("levels")
        .setDescription("👔 Define variables del sistema de niveles")
        .addChannelOption((option) =>
          option
            .setName("canal")
            .setDescription(
              "¿En qué canal se enviarán los anuncios de aumento de nivel?"
            )
            .addChannelTypes(ChannelType.GuildText)
        )
        .addStringOption((option) =>
          option
            .setName("mensaje")
            .setDescription(
              "¿Qué dirá el mensaje? Utiliza las variables {usuario}, {nivel} y {recompensa}."
            )
        )
        .addNumberOption((option) =>
          option
            .setName("ganancia")
            .setDescription(
              "¿Qué multiplicador de recompensa de economía tendrá al subir de nivel? Ej: Lvl x 10"
            )
            .setMaxValue(10)
            .setMinValue(1)
        )
    ),

  async execute(client, interaction) {
    try {
      const { options, guild, channel, user, member } = interaction;

      switch (options.getSubcommand()) {
        case "tickets":
          {
            const canal = options.getChannel("canal") || channel;
            const mensaje =
              options.getString("mensaje") ||
              "Utiliza el botón para crear un ticket.";

            try {
              const msg = await canal.send({
                embeds: [
                  new EmbedBuilder()
                    .setTitle(`<:ticket:1201715618374488094> Ticket de Soporte`)
                    .setDescription(
                      `\`\`\`yml\n${mensaje.substring(0, 2048)}\`\`\``
                    )
                    .setFooter({
                      text: `Powered by manucatun`,
                      iconURL: `https://static.independent.co.uk/2023/04/10/12/GettyImages-1399738189.jpg?width=1200&height=1200&fit=crop`,
                    })
                    .setColor(process.env.COLOR)
                    .setTimestamp(),
                ],
                components: [
                  new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                      .setEmoji("1201715618374488094")
                      .setCustomId("crearTicket")
                      .setStyle("Success")
                  ),
                ],
              });

              await setupSchema
                .findOneAndUpdate(
                  { guildID: guild.id },
                  {
                    tickets: {
                      channel: canal.id,
                      message: msg.id,
                    },
                  }
                )
                .then(() => {
                  console.log(
                    `〔📂〕Actualizando: Configuración del Servidor. (TICKETS) (${guild.id})`
                      .brightMagenta.bold
                  );
                });

              await interaction.reply({
                embeds: [
                  new EmbedBuilder()
                    .setAuthor({
                      name: member.displayName,
                      iconURL: user.avatarURL({ extension: "png", size: 1024 }),
                    })
                    .setTitle(
                      `<:management:1198448111547318282> Sistema de Tickets`
                    )
                    .setDescription(`> ¡Sistema de Tickets activado!`)
                    .addFields(
                      { name: `Canal`, value: `${canal}` },
                      { name: `Mensaje`, value: `${mensaje}` }
                    )
                    .setFooter({
                      text: `Powered by manucatun`,
                      iconURL: `https://static.independent.co.uk/2023/04/10/12/GettyImages-1399738189.jpg?width=1200&height=1200&fit=crop`,
                    })
                    .setColor(process.env.COLOR),
                ],
              });
            } catch (e) {
              console.log(e);
              return interaction.reply({
                content: `> <:warning:1198447554497618010> **No he podido establecer la configuración del servidor.**`,
                ephemeral: true,
              });
            }
          }
          break;

        case "suggestions":
          {
            const canal = options.getChannel("canal") || channel;

            try {
              await canal.send({
                embeds: [
                  new EmbedBuilder()
                    .setTitle(
                      `<:noti:1198447092155297802> Canal de Sugerencias`
                    )
                    .setDescription(
                      `Envía tus sugerencias a este canal con el comando </suggest:1220941023597953064>`
                    )
                    .setFooter({
                      text: `Powered by manucatun`,
                      iconURL: `https://static.independent.co.uk/2023/04/10/12/GettyImages-1399738189.jpg?width=1200&height=1200&fit=crop`,
                    })
                    .setColor(process.env.COLOR)
                    .setTimestamp(),
                ],
              });

              await setupSchema
                .findOneAndUpdate(
                  { guildID: guild.id },
                  {
                    suggestions: canal.id,
                  }
                )
                .then(() => {
                  console.log(
                    `〔📂〕Actualizando: Configuración del Servidor. (SUGERENCIAS) (${guild.id})`
                      .brightMagenta.bold
                  );
                });

              await interaction.reply({
                embeds: [
                  new EmbedBuilder()
                    .setAuthor({
                      name: member.displayName,
                      iconURL: user.avatarURL({ extension: "png", size: 1024 }),
                    })
                    .setTitle(
                      `<:management:1198448111547318282> Sistema de Sugerencias`
                    )
                    .setDescription(`> ¡Sistema de Sugerencias activado!`)
                    .addFields({ name: `Canal`, value: `${canal}` })
                    .setFooter({
                      text: `Powered by manucatun`,
                      iconURL: `https://static.independent.co.uk/2023/04/10/12/GettyImages-1399738189.jpg?width=1200&height=1200&fit=crop`,
                    })
                    .setColor(process.env.COLOR),
                ],
              });
            } catch (e) {
              console.log(e);
              return interaction.reply({
                content: `> <:warning:1198447554497618010> **No he podido establecer la configuración del servidor.**`,
                ephemeral: true,
              });
            }
          }
          break;

        case "confessions":
          {
            const canal = options.getChannel("canal") || channel;

            try {
              await canal.send({
                embeds: [
                  new EmbedBuilder()
                    .setTitle(
                      `<:noti:1198447092155297802> Canal de Confesiones`
                    )
                    .setDescription(
                      `Envía tus confesiones a este canal con el comando </confess:>`
                    )
                    .setFooter({
                      text: `Powered by manucatun`,
                      iconURL: `https://static.independent.co.uk/2023/04/10/12/GettyImages-1399738189.jpg?width=1200&height=1200&fit=crop`,
                    })
                    .setColor(process.env.COLOR)
                    .setTimestamp(),
                ],
              });

              await setupSchema
                .findOneAndUpdate(
                  { guildID: guild.id },
                  {
                    confessions: canal.id,
                  }
                )
                .then(() => {
                  console.log(
                    `〔📂〕Actualizando: Configuración del Servidor. (CONFESIONES) (${guild.id})`
                      .brightMagenta.bold
                  );
                });

              await interaction.reply({
                embeds: [
                  new EmbedBuilder()
                    .setAuthor({
                      name: member.displayName,
                      iconURL: user.avatarURL({ extension: "png", size: 1024 }),
                    })
                    .setTitle(
                      `<:management:1198448111547318282> Sistema de Confesiones`
                    )
                    .setDescription(`> ¡Sistema de Confesiones activado!`)
                    .addFields({ name: `Canal`, value: `${canal}` })
                    .setFooter({
                      text: `Powered by manucatun`,
                      iconURL: `https://static.independent.co.uk/2023/04/10/12/GettyImages-1399738189.jpg?width=1200&height=1200&fit=crop`,
                    })
                    .setColor(process.env.COLOR),
                ],
              });
            } catch (e) {
              console.log(e);
              return interaction.reply({
                content: `> <:warning:1198447554497618010> **No he podido establecer la configuración del servidor.**`,
                ephemeral: true,
              });
            }
          }
          break;

        case "levels":
          {
            const canal = options.getChannel("canal") || channel;
            const mensaje =
              options.getString("mensaje") ||
              "🏆 ¡{usuario} has subido al **nivel {nivel}**! Conseguiste una recompensa de **<:coinIcon:1240873651956482139> {recompensa} monedas**";
            const recompensa = options.getNumber("ganancia") || 10;

            try {
              await setupSchema
                .findOneAndUpdate(
                  { guildID: guild.id },
                  {
                    levels: {
                      channel: canal.id,
                      message: mensaje,
                      coins: recompensa,
                    },
                  }
                )
                .then(() => {
                  console.log(
                    `〔📂〕Actualizando: Configuración del Servidor. (NIVELES) (${guild.id}) (x${recompensa})`
                      .brightMagenta.bold
                  );
                });

              await interaction.reply({
                embeds: [
                  new EmbedBuilder()
                    .setAuthor({
                      name: member.displayName,
                      iconURL: user.avatarURL({ extension: "png", size: 1024 }),
                    })
                    .setTitle(
                      `<:management:1198448111547318282> Sistema de Niveles`
                    )
                    .setDescription(`> ¡Sistema de Niveles activado!`)
                    .addFields(
                      { name: `Canal`, value: `${canal}` },
                      { name: `Mensaje`, value: `${mensaje}` },
                      {
                        name: `Recompensa`,
                        value: `Multiplicador x${recompensa} • Ej: Nivel 10 x Recompensa = ${Math.floor(
                          recompensa * 10
                        )} monedas`,
                      }
                    )
                    .setFooter({
                      text: `Powered by manucatun`,
                      iconURL: `https://static.independent.co.uk/2023/04/10/12/GettyImages-1399738189.jpg?width=1200&height=1200&fit=crop`,
                    })
                    .setColor(process.env.COLOR),
                ],
              });
            } catch (e) {
              console.log(e);
              return interaction.reply({
                content: `> <:warning:1198447554497618010> **No he podido establecer la configuración del servidor.**`,
                ephemeral: true,
              });
            }
          }
          break;
      }
    } catch (e) {
      await interaction.reply({
        content: `> <:warning:1198447554497618010>** ¡Ocurrió un error al intentar ejecutar el comando!**`,
        ephemeral: true,
      });
      console.log(e);
    }
  },
};
