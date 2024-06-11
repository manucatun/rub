const { asegurarTodo } = require("../structures/Functions");
const setupSchema = require("../models/setup");
const ticketSchema = require("../models/ticket");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ChannelType,
  PermissionFlagsBits,
} = require("discord.js");
const html = require("discord-html-transcripts");

module.exports = (client) => {
  client.on("interactionCreate", async (interaction) => {
    const { guild, message, user, member, channel, customId } = interaction;
    try {
      /* Comprobaciones */
      if (
        !guild ||
        !channel ||
        !interaction.isButton() ||
        message.author.id !== client.user.id ||
        customId !== "crearTicket"
      )
        return;

      await asegurarTodo(guild.id);
      const data = await setupSchema.findOne({ guildID: guild.id });

      if (
        !data ||
        !data.tickets ||
        !data.tickets.channel ||
        channel.id !== data.tickets.channel ||
        message.id !== data.tickets.message
      )
        return;

      /* - Ticket Creado - */
      const ticketData = await ticketSchema.find({
        guildID: guild.id,
        author: user.id,
        closed: false,
      });
      for (const ticket of ticketData) {
        if (guild.channels.cache.get(ticket.channel))
          return interaction.reply({
            content: `> <:ticket:1201715618374488094> **Ya tienes un ticket creado en <#${ticket.channel}>.**`,
            ephemeral: true,
          });
      }
      /* - Ticket Creado - */
      /* Comprobaciones */

      /* Crear Tickets */
      await interaction.reply({
        content: `> <:time:1198844708655485048> **Espera un momento mientras tu ticket es configurado...**`,
        ephemeral: true,
      });
      const canal = await guild.channels.create({
        name: `ticket-${member.user.username}`.substring(0, 50),
        type: ChannelType.GuildText,
        parent: channel.parent ?? null,
      });

      await canal.permissionOverwrites.create(guild.id, { ViewChannel: false });
      await canal.permissionOverwrites.create(user.id, { ViewChannel: true });
      await canal.permissionOverwrites.create(guild.roles.everyone, {
        ViewChannel: false,
      });

      await canal.send({
        content: user.toString(),
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: `Ticket de ${member.displayName}`,
              iconURL: user.avatarURL({ format: "png" }),
            })
            .setTitle(
              `<:admin:1198448382717476934> El personal del servidor te ayudará muy pronto`
            )
            .setDescription(
              `Empieza explicando tu problema para facilitar el proceso.\nUtiliza **__<:locked:1199113550757646527>__** para cerrar el ticket.`
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
              .setStyle("Danger")
              .setEmoji("1199113550757646527")
              .setCustomId("cerrarTicket")
          ),
        ],
      });

      let newData = new ticketSchema({
        guildID: guild.id,
        author: user.id,
        channel: canal.id,
        closed: false,
      });
      await newData.save().then(() => {
        console.log(
          `〔💾〕Guardando: Nuevo Ticket. (En ${guild.id} de ${user.id})`
            .brightCyan.bold
        );
      });

      await interaction.editReply({
        content: `> <:ticket:1201715618374488094> **Tu ticket se ha creado correctamente en <#${canal.id}>**.`,
        ephemeral: true,
      });
      /* Crear Tickets */
    } catch (e) {
      await interaction.reply({
        content: `> <:warning:1198447554497618010>** ¡Ocurrió un error al intentar ejecutar el comando!**`,
        ephemeral: true,
      });
      console.log(e);
    }
  });

  client.on("interactionCreate", async (interaction) => {
    const { guild, message, user, member, channel, customId } = interaction;
    try {
      /* Comprobaciones */
      if (
        !guild ||
        !channel ||
        !interaction.isButton() ||
        message.author.id !== client.user.id
      )
        return;

      await asegurarTodo(guild.id);
      let ticketData = await ticketSchema.findOne({
        guildID: guild.id,
        channel: channel.id,
      });
      /* Comprobaciones */

      switch (customId) {
        /* Cerrar Ticket */
        case "cerrarTicket":
          {
            if (ticketData && ticketData.closed)
              return interaction.reply({
                content: `> <:locked:1199113550757646527> **El ticket ya está cerrado.**`,
                ephemeral: true,
              });
            await interaction.deferUpdate();

            const verificar = await channel.send({
              content: `> <:wrench:1198447792507592814> **¿Quieres cerrar el ticket?**`,
              components: [
                new ActionRowBuilder().addComponents(
                  new ButtonBuilder()
                    .setEmoji("1199113550757646527")
                    .setStyle("Danger")
                    .setCustomId("verificar")
                ),
              ],
            });

            const collector = verificar.createMessageComponentCollector({
              filter: (i) =>
                i.isButton() && i.message.author.id == client.user.id && i.user,
              time: 180e3,
            });

            collector.on("collect", async (button) => {
              collector.stop();
              button.deferUpdate();

              ticketData.closed = true;
              ticketData.save();

              await channel.send({
                embeds: [
                  new EmbedBuilder()
                    .setAuthor({
                      name: button.member.displayName,
                      iconURL: button.user.avatarURL({ extension: "png", size: 1024 }),
                    })
                    .setTitle(`<:locked:1199113550757646527> Ticket Cerrado`)
                    .setDescription(
                      `Cerrado el <t:${Math.round(
                        Date.now() / 1000
                      )}> (<t:${Math.round(Date.now() / 1000)}:R>).`
                    )
                    .setFooter({
                      text: `Powered by manucatun`,
                      iconURL: `https://static.independent.co.uk/2023/04/10/12/GettyImages-1399738189.jpg?width=1200&height=1200&fit=crop`,
                    })
                    .setColor("Red")
                    .setTimestamp(),
                ],
                components: [
                  new ActionRowBuilder().addComponents([
                    new ButtonBuilder()
                      .setEmoji("1199113566255595733")
                      .setStyle("Success")
                      .setCustomId("abrirTicket"),
                    new ButtonBuilder()
                      .setEmoji("1198448669842739381")
                      .setStyle("Danger")
                      .setCustomId("borrarTicket"),
                    new ButtonBuilder()
                      .setEmoji("1198447843317403728")
                      .setStyle("Primary")
                      .setCustomId("guardarTicket"),
                  ]),
                ],
              });
              await channel.permissionOverwrites.edit(ticketData.author, {
                ViewChannel: false,
              });

              await verificar.delete();
            });

            collector.on("end", async (collected) => {
              if (!collected) return;
              if (
                !(collected && collected.first() && collected.first().customId)
              ) {
                verificar.edit({
                  components: [
                    new ActionRowBuilder().addComponents(
                      new ButtonBuilder()
                        .setEmoji("1198446963406946314")
                        .setStyle("Danger")
                        .setCustomId("verificar")
                        .setDisabled(true)
                    ),
                  ],
                });
              }
            });
          }
          break;
        /* Cerrar Ticket */

        /* Abrir Ticket */
        case "abrirTicket":
          {
            if (
              !interaction.member.permissions.has(
                PermissionFlagsBits.ManageChannels
              )
            )
              return interaction.reply({
                content: `> <:no:1198446838819328050> **No tienes permisos para utilizar este botón.**`,
                ephemeral: true,
              });

            if (ticketData && !ticketData.closed)
              return interaction.reply({
                content: `> <:unlocked:1199113566255595733> **El ticket ya está abierto.**`,
                ephemeral: true,
              });
            await interaction.deferUpdate();

            const verificar = await channel.send({
              content: `> <:wrench:1198447792507592814> **¿Quieres abrir el ticket?**`,
              components: [
                new ActionRowBuilder().addComponents(
                  new ButtonBuilder()
                    .setEmoji("1199113566255595733")
                    .setStyle("Success")
                    .setCustomId("verificar")
                ),
              ],
            });

            const collector = verificar.createMessageComponentCollector({
              filter: (i) =>
                i.isButton() && i.message.author.id == client.user.id && i.user,
              time: 180e3,
            });

            collector.on("collect", async (button) => {
              collector.stop();
              button.deferUpdate();

              ticketData.closed = false;
              ticketData.save();

              await channel.permissionOverwrites.edit(ticketData.author, {
                ViewChannel: true,
              });

              await channel.send({
                embeds: [
                  new EmbedBuilder()
                    .setAuthor({
                      name: button.member.displayName,
                      iconURL: button.user.avatarURL({ extension: "png", size: 1024 }),
                    })
                    .setTitle(`<:unlocked:1199113566255595733> Ticket Abierto`)
                    .setDescription(
                      `Abierto el <t:${Math.round(
                        Date.now() / 1000
                      )}> (<t:${Math.round(Date.now() / 1000)}:R>).`
                    )
                    .setFooter({
                      text: `Powered by manucatun`,
                      iconURL: `https://static.independent.co.uk/2023/04/10/12/GettyImages-1399738189.jpg?width=1200&height=1200&fit=crop`,
                    })
                    .setColor("Green")
                    .setTimestamp(),
                ],
                components: [
                  new ActionRowBuilder().addComponents([
                    new ButtonBuilder()
                      .setEmoji("1199113550757646527")
                      .setStyle("Danger")
                      .setCustomId("cerrarTicket"),
                  ]),
                ],
              });

              await verificar.delete();
            });

            collector.on("end", async (collected) => {
              if (!collected) return;
              if (
                !(collected && collected.first() && collected.first().customId)
              ) {
                verificar.edit({
                  components: [
                    new ActionRowBuilder().addComponents(
                      new ButtonBuilder()
                        .setEmoji("1199113566255595733")
                        .setStyle("Success")
                        .setCustomId("verificar")
                        .setDisabled(true)
                    ),
                  ],
                });
              }
            });
          }
          break;
        /* Abrir Ticket */

        /* Borrar Ticket */
        case "borrarTicket":
          {
            if (
              !interaction.member.permissions.has(
                PermissionFlagsBits.ManageChannels
              )
            )
              return interaction.reply({
                content: `> <:no:1198446838819328050> **No tienes permisos para utilizar este botón.**`,
                ephemeral: true,
              });

            if (ticketData && !ticketData.closed)
              return interaction.reply({
                content: `> <:error:1198447011448508466> **El ticket debe estar cerrado para poder eliminarlo.**`,
                ephemeral: true,
              });
            await interaction.deferUpdate();

            const verificar = await channel.send({
              content: `> <:wrench:1198447792507592814> **¿Quieres eliminar el ticket?**`,
              components: [
                new ActionRowBuilder().addComponents(
                  new ButtonBuilder()
                    .setEmoji("1198448669842739381")
                    .setStyle("Danger")
                    .setCustomId("verificar")
                ),
              ],
            });

            const collector = verificar.createMessageComponentCollector({
              filter: (i) =>
                i.isButton() && i.message.author.id == client.user.id && i.user,
              time: 180e3,
            });

            collector.on("collect", async (button) => {
              collector.stop();
              button.deferUpdate();

              ticketData.deleteOne().then(() => {
                console.log(
                  `〔📂〕Actualizando: Ticket Eliminado. (En ${guild.id})`
                    .brightMagenta.bold
                );
              });

              await channel.send({
                embeds: [
                  new EmbedBuilder()
                    .setAuthor({
                      name: button.member.displayName,
                      iconURL: button.user.avatarURL({ extension: "png", size: 1024 }),
                    })
                    .setTitle(`<:delete:1198448669842739381> Ticket Eliminado`)
                    .setDescription(
                      `Se eliminará en \`3 segundos\`...\nEliminado el <t:${Math.round(
                        Date.now() / 1000
                      )}> (<t:${Math.round(Date.now() / 1000)}:R>).`
                    )
                    .setFooter({
                      text: `Powered by manucatun`,
                      iconURL: `https://static.independent.co.uk/2023/04/10/12/GettyImages-1399738189.jpg?width=1200&height=1200&fit=crop`,
                    })
                    .setColor("Red")
                    .setTimestamp(),
                ],
              });

              setTimeout(() => {
                channel.delete();
              }, 3_000);
            });

            collector.on("end", async (collected) => {
              if (
                !(collected && collected.first() && collected.first().customId)
              ) {
                verificar.edit({
                  components: [
                    new ActionRowBuilder().addComponents(
                      new ButtonBuilder()
                        .setEmoji("1199113566255595733")
                        .setStyle("Danger")
                        .setCustomId("verificar")
                        .setDisabled(true)
                    ),
                  ],
                });
              }
            });
          }
          break;
        /* Borrar Ticket */

        /* Guardar Ticket */
        case "guardarTicket":
          {
            if (
              !interaction.member.permissions.has(
                PermissionFlagsBits.ManageChannels
              )
            )
              return interaction.reply({
                content: `> <:no:1198446838819328050> **No tienes permisos para utilizar este botón.**`,
                ephemeral: true,
              });

            await interaction.reply({
              content: `> <:time:1198844708655485048> **Guardando el ticket...**`,
              ephemeral: true,
            });

            const doc = await html.createTranscript(channel, {
              limit: -1,
              returnBuffer: false,
              fileName: `${channel.name}.html`,
            });

            await channel.send({
              embeds: [
                new EmbedBuilder()
                  .setAuthor({
                    name: member.displayName,
                    iconURL: user.avatarURL({ extension: "png", size: 1024 }),
                  })
                  .setTitle(`<:guidelines:1198447843317403728> Ticket Guardado`)
                  .setDescription(
                    `Guardado el <t:${Math.round(
                      Date.now() / 1000
                    )}> (<t:${Math.round(Date.now() / 1000)}:R>).`
                  )
                  .setFooter({
                    text: `Powered by manucatun`,
                    iconURL: `https://static.independent.co.uk/2023/04/10/12/GettyImages-1399738189.jpg?width=1200&height=1200&fit=crop`,
                  })
                  .setColor("Purple")
                  .setTimestamp(),
              ],
              files: [doc],
            });
          }
          break;
        /* Guardar Ticket */
      }
    } catch (e) {
      console.log(e);
      await interaction.reply({
        content: `> <:warning:1198447554497618010>** ¡Ocurrió un error al intentar ejecutar el comando!**`,
        ephemeral: true,
      });
    }
  });
};
