const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ChannelType,
} = require("discord.js");
const { asegurarTodo } = require("../../structures/Functions");
const warningsSchema = require("../../models/warning");
const ms = require("ms");
module.exports = {
  CMD: new SlashCommandBuilder()
    .setDescription("⛔ Sistema de Moderación")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addSubcommand((sub) =>
      sub
        .setName("ban")
        .setDescription("⛔ Prohíbe a un usuario del servidor")
        .addUserOption((option) =>
          option
            .setName("usuario")
            .setDescription("¿Qué usuario quieres prohibir?")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option.setName("motivo").setDescription("¿Cuál es el motivo?")
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("clear")
        .setDescription("⛔ Elimina una cantidad de mensajes en un canal")
        .addNumberOption((option) =>
          option
            .setName("cantidad")
            .setDescription("¿Cuántos mensajes quieres eliminar?")
            .setRequired(true)
        )
        .addUserOption((option) =>
          option
            .setName("usuario")
            .setDescription("¿De qué usuario se eliminarán?")
        )
        .addChannelOption((option) =>
          option.setName("canal").setDescription("¿Qué canal se limpiará?")
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("kick")
        .setDescription("⛔ Expulsa a un usuario del servidor")
        .addUserOption((option) =>
          option
            .setName("usuario")
            .setDescription("¿Qué usuario quieres expulsar?")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option.setName("motivo").setDescription("¿Cuál es el motivo?")
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("lock")
        .setDescription("⛔ Bloquea un canal de texto")
        .addChannelOption((option) =>
          option.setName("canal").setDescription("¿Qué canal quieres bloquear?")
        )
        .addStringOption((option) =>
          option.setName("motivo").setDescription("¿Cuál es el motivo?")
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("slowmode")
        .setDescription("⛔ Habilita el modo pausado en un canal de texto")
        .addNumberOption((option) =>
          option
            .setName("duración")
            .setDescription("¿Cada cuanto podrán enviar mensajes?")
        )
        .addChannelOption((option) =>
          option
            .setName("canal")
            .setDescription("¿En qué canal quieres activarlo?")
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("timeout")
        .setDescription("⛔ Aísla temporalmente a un usuario en el servidor")
        .addUserOption((option) =>
          option
            .setName("usuario")
            .setDescription("¿Qué usuario quieres aislar?")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("duración")
            .setDescription(
              "¿Cuánto tiempo quieres aislarlo? [Formato: 1m, 2h, 3d]"
            )
            .setRequired(true)
        )
        .addStringOption((option) =>
          option.setName("motivo").setDescription("¿Cuál es el motivo?")
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("unban")
        .setDescription("⛔ Remueve la prohibición del servidor a un usuario")
        .addStringOption((option) =>
          option
            .setName("usuario")
            .setDescription("¿Cuál es el nombre o Id del usuario?")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("unlock")
        .setDescription("⛔ Desbloquea un canal de texto")
        .addChannelOption((option) =>
          option
            .setName("canal")
            .setDescription("¿Qué canal quieres desbloquear?")
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("untimeout")
        .setDescription("⛔ Remueve el aislamiento del servidor a un usuario")
        .addUserOption((option) =>
          option
            .setName("usuario")
            .setDescription("¿A qué usuario quieres removerle el aislamiento?")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("warn")
        .setDescription("⛔ Sanciona a un usuario del servidor")
        .addUserOption((option) =>
          option
            .setName("usuario")
            .setDescription("¿Qué usuario quieres sancionar?")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option.setName("motivo").setDescription("¿Cuál es el motivo?")
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("unwarn")
        .setDescription("⛔ Remueve una advertencia del servidor a un usuario")
        .addUserOption((option) =>
          option
            .setName("usuario")
            .setDescription("¿A qué usuario quieres removerle la advertencia?")
            .setRequired(true)
        )
        .addNumberOption((option) =>
          option
            .setName("id")
            .setDescription("¿Qué Id tiene la advertencia que quieres remover?")
            .setRequired(true)
        )
    ),

  async execute(client, interaction) {
    try {
      const { options, guild, member, user, channel } = interaction;

      switch (options.getSubcommand()) {
        case "ban":
          {
            const usuario = options.getUser("usuario");
            const miembro = options.getMember("usuario");
            const motivo = options.getString("motivo") || "Sin especificar";

            try {
              /* Comprobaciones */
              if (!miembro.bannable)
                return interaction.reply({
                  content: `> <:warning:1279144320062066748> **No puedo prohibir a este usuario.**`,
                  ephemeral: true,
                });
              if (
                guild.members.me.roles.highest.position <=
                miembro.roles.highest.position
              )
                return interaction.reply({
                  content: `> <:warning:1279144320062066748> **No puedo prohibir a este usuario, mi rol está por debajo.**`,
                  ephemeral: true,
                });
              if (
                member?.roles.highest.position <= miembro.roles.highest.position
              )
                return interaction.reply({
                  content: `> <:warning:1279144320062066748> **No puedes prohibir a este usuario, tu rol está por debajo.**`,
                  ephemeral: true,
                });
              /* Comprobaciones */

              await miembro
                .send({
                  embeds: [
                    new EmbedBuilder()
                      .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL({
                          extension: "png",
                          size: 1024,
                        }),
                      })
                      .setTitle(
                        `<:leave:1279144038922063892> Has sido prohibido de __${guild.name}__`
                      )
                      .addFields(
                        {
                          name: `Motivo`,
                          value: `\`\`\`yml\n${motivo}\`\`\``,
                        },
                        {
                          name: `Moderador`,
                          value: `${member}`,
                        }
                      )
                      .setColor("Red")
                      .setFooter({
                        text: `Powered by manucatun`,
                        iconURL: `https://static.independent.co.uk/2023/04/10/12/GettyImages-1399738189.jpg?width=1200&height=1200&fit=crop`,
                      })
                      .setTimestamp(),
                  ],
                })
                .catch(() => {
                  interaction.channel.send({
                    content: `> <:warning:1279144320062066748> **¡No he podido enviarle el mensaje al usuario!**`,
                  });
                });

              await miembro.ban({ reason: motivo }).then(async () => {
                await interaction.reply({
                  embeds: [
                    new EmbedBuilder()
                      .setAuthor({
                        name: member.displayName,
                        iconURL: user.avatarURL({
                          extension: "png",
                          size: 1024,
                        }),
                      })
                      .setTitle(
                        `<:shield:1279141839605334168> Usuario prohibido`
                      )
                      .setThumbnail(
                        usuario.avatarURL({ extension: "png", size: 1024 })
                      )
                      .addFields(
                        {
                          name: `Usuario`,
                          value: `${miembro}`,
                        },
                        {
                          name: `Motivo`,
                          value: `\`\`\`yml\n${motivo}\`\`\``,
                        }
                      )
                      .setFooter({
                        text: `Powered by manucatun`,
                        iconURL: `https://static.independent.co.uk/2023/04/10/12/GettyImages-1399738189.jpg?width=1200&height=1200&fit=crop`,
                      })
                      .setColor("Red")
                      .setTimestamp(),
                  ],
                });
              });
            } catch (e) {
              console.log(e);
              return interaction.reply({
                content: `> <:warning:1279144320062066748> **¡No he podido prohibir al usuario!**`,
                ephemeral: true,
              });
            }
          }
          break;

        case "clear":
          {
            const cantidad = options.getNumber("cantidad");
            const usuario = options.getUser("usuario");
            const canal = options.getChannel("canal") || channel;

            try {
              await interaction.reply({
                content: `> <:time:1279138439417303161> **Eliminando los mensajes...**`,
                ephemeral: true,
              });

              const mensajes = await canal.messages.fetch();

              if (usuario) {
                let i = 0;
                let msgDelete = [];

                mensajes.filter((message) => {
                  if (message.author.id === usuario.id && cantidad > i) {
                    msgDelete.push(message);
                    i++;
                  }
                });

                if (i === 0)
                  return interaction.editReply({
                    content: `> <:warning:1279144320062066748> **__${usuario.displayName}__ no tiene mensajes en ${canal}.**`,
                    ephemeral: true,
                  });

                await canal
                  .bulkDelete(msgDelete, true)
                  .then(async (message) => {
                    await canal.send({
                      content: `> <:delete:1279138661216157778> **\`${message.size}\` mensajes del usuario __${usuario.displayName}__ fueron eliminados.**`,
                    });
                    await interaction.editReply({
                      content: `> <:delete:1279138661216157778> **¡Los mensajes fueron eliminados correctamente!**`,
                    });
                  });
              } else {
                await canal.bulkDelete(cantidad, true).then(async (message) => {
                  await canal.send({
                    content: `> <:delete:1279138661216157778> **\`${message.size}\` mensajes fueron eliminados.**`,
                  });
                  await interaction.editReply({
                    content: `> <:delete:1279138661216157778> **¡Los mensajes fueron eliminados correctamente!**`,
                  });
                });
              }
            } catch (e) {
              console.log(e);
              return interaction.reply({
                content: `> <:warning:1279144320062066748> **¡No he podido eliminar los mensajes, pasaron más de 14 días desde que fueron enviados!**`,
                ephemeral: true,
              });
            }
          }
          break;

        case "kick":
          {
            const usuario = options.getUser("usuario");
            const miembro = options.getMember("usuario");
            const motivo = options.getString("motivo") || "Sin especificar";

            try {
              /* Comprobaciones */
              if (!miembro.kickable)
                return interaction.reply({
                  content: `> <:warning:1279144320062066748> **No puedo expulsar a este usuario.**`,
                  ephemeral: true,
                });
              if (
                guild.members.me.roles.highest.position <=
                miembro.roles.highest.position
              )
                return interaction.reply({
                  content: `> <:warning:1279144320062066748> **No puedo expulsar a este usuario, mi rol está por debajo.**`,
                  ephemeral: true,
                });
              if (
                member?.roles.highest.position <= miembro.roles.highest.position
              )
                return interaction.reply({
                  content: `> <:warning:1279144320062066748> **No puedes expulsar a este usuario, tu rol está por debajo.**`,
                  ephemeral: true,
                });
              /* Comprobaciones */

              await miembro
                .send({
                  embeds: [
                    new EmbedBuilder()
                      .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL({
                          extension: "png",
                          size: 1024,
                        }),
                      })
                      .setTitle(
                        `<:leave:1279144038922063892> Has sido expulsado de __${guild.name}__`
                      )
                      .addFields(
                        {
                          name: `Motivo`,
                          value: `\`\`\`yml\n${motivo}\`\`\``,
                        },
                        {
                          name: `Moderador`,
                          value: `${member}`,
                        }
                      )
                      .setFooter({
                        text: `Powered by manucatun`,
                        iconURL: `https://static.independent.co.uk/2023/04/10/12/GettyImages-1399738189.jpg?width=1200&height=1200&fit=crop`,
                      })
                      .setColor("Orange")
                      .setTimestamp(),
                  ],
                })
                .catch(() => {
                  interaction.channel.send({
                    content: `> <:warning:1279144320062066748> **¡No he podido enviarle el mensaje al usuario!**`,
                  });
                });

              await miembro.kick({ reason: motivo }).then(async () => {
                await interaction.reply({
                  embeds: [
                    new EmbedBuilder()
                      .setAuthor({
                        name: member.displayName,
                        iconURL: user.avatarURL({
                          extension: "png",
                          size: 1024,
                        }),
                      })
                      .setTitle(
                        `<:shield:1279141839605334168> Usuario expulsado`
                      )
                      .setThumbnail(
                        usuario.avatarURL({ extension: "png", size: 1024 })
                      )
                      .addFields(
                        {
                          name: `Usuario`,
                          value: `${miembro}`,
                        },
                        {
                          name: `Motivo`,
                          value: `\`\`\`yml\n${motivo}\`\`\``,
                        }
                      )
                      .setFooter({
                        text: `Powered by manucatun`,
                        iconURL: `https://static.independent.co.uk/2023/04/10/12/GettyImages-1399738189.jpg?width=1200&height=1200&fit=crop`,
                      })
                      .setColor("Orange")
                      .setTimestamp(),
                  ],
                });
              });
            } catch (e) {
              console.log(e);
              return interaction.reply({
                content: `> <:warning:1279144320062066748> **¡No he podido expulsar al usuario!**`,
                ephemeral: true,
              });
            }
          }
          break;

        case "lock":
          {
            const canal = options.getChannel("canal") || channel;
            const motivo = options.getString("motivo") || "Sin especificar";

            try {
              /* Comprobaciones */
              if (
                canal.type !== ChannelType.GuildText &&
                canal.type !== ChannelType.GuildVoice &&
                canal.type !== ChannelType.GuildStageVoice &&
                canal.type !== ChannelType.GuildAnnouncement
              )
                return interaction.reply({
                  content: `> <:warning:1279144320062066748> **No es un canal válido.**`,
                  ephemeral: true,
                });

              const everyoneRole = await guild.roles.cache.find(
                (rol) => rol.name.toLowerCase() === "@everyone"
              );

              const permisosAntes = await canal.permissionsFor(everyoneRole.id);

              await canal.permissionOverwrites.edit(everyoneRole, {
                SendMessages: false,
              });

              const permisosDespués = await canal.permissionsFor(
                everyoneRole.id
              );

              if (
                !(
                  permisosAntes &&
                  permisosDespués &&
                  !permisosAntes.equals(permisosDespués)
                )
              ) {
                return interaction.reply({
                  content: `> <:locked:1279136440931844136> **${canal} ya se encuentra bloqueado.**`,
                  ephemeral: true,
                });
              }
              /* Comprobaciones */

              await canal.send({
                embeds: [
                  new EmbedBuilder()
                    .setAuthor({
                      name: member.displayName,
                      iconURL: user.avatarURL({
                        extension: "png",
                        size: 1024,
                      }),
                    })
                    .setTitle(`<:locked:1279136440931844136> Canal bloqueado`)
                    .addFields({
                      name: `Motivo`,
                      value: `\`\`\`yml\n${motivo}\`\`\``,
                    })
                    .setFooter({
                      text: `Powered by manucatun`,
                      iconURL: `https://static.independent.co.uk/2023/04/10/12/GettyImages-1399738189.jpg?width=1200&height=1200&fit=crop`,
                    })
                    .setColor("Red")
                    .setTimestamp(),
                ],
              });

              await interaction.reply({
                content: `> <:locked:1279136440931844136> **Se bloqueó el canal ${canal}.**\nLos usuarios no podrán enviar mensajes.`,
                ephemeral: true,
              });
            } catch (e) {
              console.log(e);
              return interaction.reply({
                content: `> <:warning:1279144320062066748> **¡No he podido bloquear el canal de texto!**`,
                ephemeral: true,
              });
            }
          }
          break;

        case "timeout":
          {
            const usuario = options.getUser("usuario");
            const miembro = options.getMember("usuario");
            const duración = options.getString("duración");
            const motivo = options.getString("motivo") || "Sin especificar";

            try {
              /* Duración */
              const tiempoMs = ms(duración);
              if (
                !tiempoMs ||
                isNaN(tiempoMs) ||
                tiempoMs <= 0 ||
                tiempoMs > 2.419e9 ||
                tiempoMs % 1 != 0
              )
                return interaction.reply({
                  content: `> <:warning:1279144320062066748> **No es una duración válida, menor a 28 días.**`,
                  ephemeral: true,
                });
              /* Duración */

              /* Comprobaciones */
              if (!miembro.moderatable)
                return interaction.reply({
                  content: `> <:warning:1279144320062066748> **No puedo aislar a este usuario.**`,
                  ephemeral: true,
                });
              if (
                guild.members.me.roles.highest.position <=
                miembro.roles.highest.position
              )
                return interaction.reply({
                  content: `> <:warning:1279144320062066748> **No puedo aislar a este usuario, mi rol está por debajo.**`,
                  ephemeral: true,
                });
              if (
                member?.roles.highest.position <= miembro.roles.highest.position
              )
                return interaction.reply({
                  content: `> <:warning:1279144320062066748> **No puedes aislar a este usuario, tu rol está por debajo.**`,
                  ephemeral: true,
                });
              /* Comprobaciones */

              await miembro
                .timeout(tiempoMs, { reason: motivo })
                .then(async () => {
                  await miembro
                    .send({
                      embeds: [
                        new EmbedBuilder()
                          .setAuthor({
                            name: guild.name,
                            iconURL: guild.iconURL({
                              extension: "png",
                              size: 1024,
                            }),
                          })
                          .setTitle(
                            `<:timeout:1279138560498471015> Has sido aislado temporalmente en __${guild.name}__`
                          )
                          .addFields(
                            {
                              name: `Motivo`,
                              value: `\`\`\`yml\n${motivo}\`\`\``,
                            },
                            {
                              name: `Duración`,
                              value: `<t:${
                                Math.floor(new Date().getTime() / 1000) +
                                Math.floor(tiempoMs / 1000)
                              }:R> • <t:${
                                Math.floor(new Date().getTime() / 1000) +
                                Math.floor(tiempoMs / 1000)
                              }>`,
                            },
                            {
                              name: `Moderador`,
                              value: `${member}`,
                            }
                          )
                          .setFooter({
                            text: `Powered by manucatun`,
                            iconURL: `https://static.independent.co.uk/2023/04/10/12/GettyImages-1399738189.jpg?width=1200&height=1200&fit=crop`,
                          })
                          .setColor("Purple")
                          .setTimestamp(),
                      ],
                    })
                    .catch(() => {
                      interaction.channel.send({
                        content: `> <:warning:1279144320062066748> **¡No he podido enviarle el mensaje al usuario!**`,
                      });
                    });

                  await interaction.reply({
                    embeds: [
                      new EmbedBuilder()
                        .setAuthor({
                          name: member.displayName,
                          iconURL: user.avatarURL({
                            extension: "png",
                            size: 1024,
                          }),
                        })
                        .setTitle(
                          `<:timeout:1279138560498471015> Usuario aislado`
                        )
                        .setThumbnail(
                          usuario.avatarURL({ extension: "png", size: 1024 })
                        )
                        .addFields(
                          {
                            name: `Usuario`,
                            value: `${miembro}`,
                          },
                          {
                            name: `Motivo`,
                            value: `\`\`\`yml\n${motivo}\`\`\``,
                          },
                          {
                            name: `Duración`,
                            value: `<t:${
                              Math.floor(new Date().getTime() / 1000) +
                              Math.floor(tiempoMs / 1000)
                            }:R> • <t:${
                              Math.floor(new Date().getTime() / 1000) +
                              Math.floor(tiempoMs / 1000)
                            }>`,
                          }
                        )
                        .setFooter({
                          text: `Powered by manucatun`,
                          iconURL: `https://static.independent.co.uk/2023/04/10/12/GettyImages-1399738189.jpg?width=1200&height=1200&fit=crop`,
                        })
                        .setColor("Purple")
                        .setTimestamp(),
                    ],
                  });
                });
            } catch (e) {
              console.log(e);
              return interaction.reply({
                content: `> <:warning:1279144320062066748> **¡No he podido aislar al usuario!**`,
                ephemeral: true,
              });
            }
          }
          break;

        case "slowmode":
          {
            const canal = options.getChannel("canal") || channel;
            let duración = options.getNumber("duración");

            try {
              /* Desactivar Slowmode */
              if (!duración || duración <= 0 || isNaN(duración)) {
                await canal.setRateLimitPerUser(0).then(async () => {
                  await canal.send({
                    content: `> <:time:1279138439417303161> **¡Modo pausado deshabilitado!**\nLos usuarios podrán enviar mensajes sin restricciones de velocidad.`,
                  });

                  await interaction.reply({
                    content: `> <:time:1279138439417303161> **Se deshabilitó el modo pausado en ${canal}.**`,
                    ephemeral: true,
                  });
                  return;
                });
              }
              /* Desactivar Slowmode */

              if (duración > 21600) duración = 21600;

              await canal.setRateLimitPerUser(duración).then(async () => {
                await canal.send({
                  content: `> <:time:1279138439417303161> **¡Modo pausado habilitado!**\nLos usuarios solo podrán enviar mensajes cada \`${duración} segundos\`.`,
                });

                await interaction.reply({
                  content: `> <:time:1279138439417303161> **Se habilitó el modo pausado en ${canal}.**\nLos usuarios solo podrán enviar mensajes cada \`${duración} segundos\`.`,
                  ephemeral: true,
                });
              });
            } catch (e) {
              console.log(e);
              return interaction.reply({
                content: `> <:warning:1279144320062066748> **¡No he podido cambiar la duración del modo pausado!**`,
                ephemeral: true,
              });
            }
          }
          break;

        case "unban":
          {
            const usuario = options.getString("usuario");

            try {
              /* Buscar Usuario */
              await guild.bans.fetch().then(async (bans) => {
                if (bans.size === 0)
                  return interaction.reply({
                    content: `> <:verifiedmember:1279139097000284241> **No hay usuarios prohibidos en el servidor.**`,
                    ephemeral: true,
                  });
                const miembro = bans.find(
                  (b) => b.user.id === usuario || b.user.username === usuario
                );
                if (!miembro)
                  return interaction.reply({
                    content: `> <:verifiedmember:1279139097000284241> **Este usuario no está prohibido en el servidor.**`,
                    ephemeral: true,
                  });
                /* Buscar Usuario */

                await guild.members.unban(miembro.user).then(async () => {
                  await interaction.reply({
                    embeds: [
                      new EmbedBuilder()
                        .setAuthor({
                          name: member.displayName,
                          iconURL: user.avatarURL({
                            extension: "png",
                            size: 1024,
                          }),
                        })
                        .setTitle(
                          `<:verifiedmember:1279139097000284241> Prohibición removida`
                        )
                        .addFields({
                          name: `Usuario`,
                          value: `${miembro.user}`,
                        })
                        .setFooter({
                          text: `Powered by manucatun`,
                          iconURL: `https://static.independent.co.uk/2023/04/10/12/GettyImages-1399738189.jpg?width=1200&height=1200&fit=crop`,
                        })
                        .setColor("Green")
                        .setTimestamp(),
                    ],
                  });
                });
              });
            } catch (e) {
              console.log(e);
              return interaction.reply({
                content: `> <:warning:1198447554497618010> **No he podido remover la prohibición del usuario.**`,
                ephemeral: true,
              });
            }
          }
          break;

        case "unlock":
          {
            const canal = options.getChannel("canal") || channel;

            try {
              /* Comprobaciones */
              if (
                canal.type !== ChannelType.GuildText &&
                canal.type !== ChannelType.GuildVoice &&
                canal.type !== ChannelType.GuildStageVoice &&
                canal.type !== ChannelType.GuildAnnouncement
              )
                return interaction.reply({
                  content: `> <:warning:1279144320062066748> **No es un canal válido.**`,
                  ephemeral: true,
                });

              const everyoneRole = await guild.roles.cache.find(
                (rol) => rol.name.toLowerCase() === "@everyone"
              );

              const permisosAntes = await canal.permissionsFor(everyoneRole.id);

              await canal.permissionOverwrites.edit(everyoneRole, {
                SendMessages: true,
              });

              const permisosDespués = await canal.permissionsFor(
                everyoneRole.id
              );

              if (
                !(
                  permisosAntes &&
                  permisosDespués &&
                  !permisosAntes.equals(permisosDespués)
                )
              ) {
                return interaction.reply({
                  content: `> <:unlocked:1279136329694707732> **${canal} ya se encuentra desbloqueado.**`,
                  ephemeral: true,
                });
              }
              /* Comprobaciones */

              await canal.send({
                embeds: [
                  new EmbedBuilder()
                    .setAuthor({
                      name: member.displayName,
                      iconURL: user.avatarURL({
                        extension: "png",
                        size: 1024,
                      }),
                    })
                    .setTitle(
                      `<:unlocked:1279136329694707732> Canal desbloqueado`
                    )
                    .setFooter({
                      text: `Powered by manucatun`,
                      iconURL: `https://static.independent.co.uk/2023/04/10/12/GettyImages-1399738189.jpg?width=1200&height=1200&fit=crop`,
                    })
                    .setColor("Green")
                    .setTimestamp(),
                ],
              });

              await interaction.reply({
                content: `> <:unlocked:1279136329694707732> **Se desbloqueo el canal ${canal}.**\nLos usuarios podrán volver a enviar mensajes.`,
                ephemeral: true,
              });
            } catch (e) {
              console.log(e);
              return interaction.reply({
                content: `> <:warning:1279144320062066748> **¡No he podido desbloquear el canal de texto!**`,
                ephemeral: true,
              });
            }
          }
          break;

        case "untimeout":
          {
            const usuario = options.getUser("usuario");
            const miembro = options.getMember("usuario");

            try {
              /* Comprobaciones */
              if (!miembro.isCommunicationDisabled())
                return interaction.reply({
                  content: `> <:warning:1279144320062066748> **El usuario no está aislado.**`,
                  ephemeral: true,
                });

              if (!miembro.moderatable)
                return interaction.reply({
                  content: `> <:warning:1279144320062066748> **No puedo remover el aislamiento de este usuario.**`,
                  ephemeral: true,
                });
              if (
                guild.members.me.roles.highest.position <=
                miembro.roles.highest.position
              )
                return interaction.reply({
                  content: `> <:warning:1279144320062066748> **No puedo remover el aislamiento de este usuario, mi rol está por debajo.**`,
                  ephemeral: true,
                });
              if (
                member?.roles.highest.position <= miembro.roles.highest.position
              )
                return interaction.reply({
                  content: `> <:warning:1279144320062066748> **No puedes remover el aislamiento de este usuario, tu rol está por debajo.**`,
                  ephemeral: true,
                });
              /* Comprobaciones */

              await miembro.timeout(null).then(async () => {
                await miembro
                  .send({
                    embeds: [
                      new EmbedBuilder()
                        .setAuthor({
                          name: guild.name,
                          iconURL: guild.iconURL({
                            extension: "png",
                            size: 1024,
                          }),
                        })
                        .setTitle(
                          `<:verifiedmember:1279139097000284241> Aislamiento removido en __${guild.name}__`
                        )
                        .addFields({ name: `Moderador`, value: `${member}` })
                        .setFooter({
                          text: `Powered by manucatun`,
                          iconURL: `https://static.independent.co.uk/2023/04/10/12/GettyImages-1399738189.jpg?width=1200&height=1200&fit=crop`,
                        })
                        .setColor("Green")
                        .setTimestamp(),
                    ],
                  })
                  .catch(() => {
                    interaction.channel.send({
                      content: `> <:warning:1279144320062066748> **¡No he podido enviarle el mensaje al usuario!**`,
                    });
                  });

                await interaction.reply({
                  embeds: [
                    new EmbedBuilder()
                      .setAuthor({
                        name: member.displayName,
                        iconURL: user.avatarURL({
                          extension: "png",
                          size: 1024,
                        }),
                      })
                      .setTitle(
                        `<:verifiedmember:1279139097000284241> Aislamiento removido`
                      )
                      .setThumbnail(
                        usuario.avatarURL({ extension: "png", size: 1024 })
                      )
                      .addFields({ name: `Usuario`, value: `${miembro}` })
                      .setFooter({
                        text: `Powered by manucatun`,
                        iconURL: `https://static.independent.co.uk/2023/04/10/12/GettyImages-1399738189.jpg?width=1200&height=1200&fit=crop`,
                      })
                      .setColor("Green")
                      .setTimestamp(),
                  ],
                });
              });
            } catch (e) {
              console.log(e);
              return interaction.reply({
                content: `> <:warning:1198447554497618010> **No he podido remover el aislamiento del usuario.**`,
                ephemeral: true,
              });
            }
          }
          break;

        case "unwarn":
          {
            const usuario = options.getUser("usuario");
            const miembro = options.getMember("usuario");
            const id = options.getNumber("id") || 0;

            try {
              await asegurarTodo(guild.id, user.id);

              /* Comprobaciones */
              if (!miembro.moderatable)
                return interaction.reply({
                  content: `> <:warning:1279144320062066748> **No puedo remover la advertencia de este usuario.**`,
                  ephemeral: true,
                });
              if (
                guild.members.me.roles.highest.position <=
                miembro.roles.highest.position
              )
                return interaction.reply({
                  content: `> <:warning:1279144320062066748> **No puedo remover la advertencia de este usuario, mi rol está por debajo.**`,
                  ephemeral: true,
                });
              if (
                member?.roles.highest.position <= miembro.roles.highest.position
              )
                return interaction.reply({
                  content: `> <:warning:1279144320062066748> **No puedes remover la advertencia de este usuario, tu rol está por debajo.**`,
                  ephemeral: true,
                });
              /* Comprobaciones */

              let data = await warningsSchema.findOne({
                guildID: guild.id,
                userID: usuario.id,
              });
              if (!data || data.warnings.length === 0) {
                return interaction.reply({
                  content: `> <:verifiedmember:1279139097000284241> **Este usuario no tiene ninguna advertencia en el servidor.**`,
                  ephemeral: true,
                });
              }

              if (isNaN(id) || id < 0 || data.warnings[id] === undefined) {
                return interaction.reply({
                  content: `> <:warning:1279144320062066748> **La Id no es válida.**`,
                  ephemeral: true,
                });
              }

              await data.warnings.splice(id, 1);
              await data.save().then(() => {
                console.log(
                  `〔📂〕Actualizando: Advertencia Eliminada. (En ${guild.id} de ${usuario.id})`
                    .brightMagenta.bold
                );
              });

              await miembro
                .send({
                  embeds: [
                    new EmbedBuilder()
                      .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL({
                          extension: "png",
                          size: 1024,
                        }),
                      })
                      .setTitle(
                        `<:verifiedmember:1279139097000284241> Advertencia removida en __${guild.name}__`
                      )
                      .addFields(
                        { name: `Moderador`, value: `${member}` },
                        { name: `Id`, value: `\`\`${id}\`\`` }
                      )
                      .setFooter({
                        text: `Powered by manucatun`,
                        iconURL: `https://static.independent.co.uk/2023/04/10/12/GettyImages-1399738189.jpg?width=1200&height=1200&fit=crop`,
                      })
                      .setColor("Green")
                      .setTimestamp(),
                  ],
                })
                .catch(() => {
                  interaction.channel.send({
                    content: `> <:warning:1279144320062066748> **¡No he podido enviarle el mensaje al usuario!**`,
                  });
                });

              await interaction.reply({
                embeds: [
                  new EmbedBuilder()
                    .setAuthor({
                      name: member.displayName,
                      iconURL: user.avatarURL({
                        extension: "png",
                        size: 1024,
                      }),
                    })
                    .setTitle(
                      `<:verifiedmember:1279139097000284241> Advertencia removida`
                    )
                    .setThumbnail(
                      usuario.avatarURL({ extension: "png", size: 1024 })
                    )
                    .addFields(
                      { name: `Usuario`, value: `${miembro}` },
                      { name: `Id`, value: `\`\`${id}\`\`` }
                    )
                    .setFooter({
                      text: `Powered by manucatun`,
                      iconURL: `https://static.independent.co.uk/2023/04/10/12/GettyImages-1399738189.jpg?width=1200&height=1200&fit=crop`,
                    })
                    .setColor("Green")
                    .setTimestamp(),
                ],
              });
            } catch (e) {
              console.log(e);
              return interaction.reply({
                content: `> <:warning:1198447554497618010> **No he podido remover la advertencia del usuario.**`,
                ephemeral: true,
              });
            }
          }
          break;

        case "warn":
          {
            const usuario = options.getUser("usuario");
            const miembro = options.getMember("usuario");
            const reason = options.getString("motivo") || "Sin especificar";

            try {
              await asegurarTodo(guild.id, usuario.id);

              /* Comprobaciones */
              if (!miembro.moderatable)
                return interaction.reply({
                  content: `> <:warning:1279144320062066748> **No puedo sancionar a este usuario.**`,
                  ephemeral: true,
                });
              if (
                guild.members.me.roles.highest.position <=
                miembro.roles.highest.position
              )
                return interaction.reply({
                  content: `> <:warning:1279144320062066748> **No puedo sancionar a este usuario, mi rol está por debajo.**`,
                  ephemeral: true,
                });
              if (
                member?.roles.highest.position <= miembro.roles.highest.position
              )
                return interaction.reply({
                  content: `> <:warning:1279144320062066748> **No puedes sancionar a este usuario, tu rol está por debajo.**`,
                  ephemeral: true,
                });
              /* Comprobaciones */

              /* Guardar en la base de datos */
              const warnObject = {
                date: Date.now(),
                author: user.id,
                reason,
              };

              await warningsSchema
                .findOneAndUpdate(
                  { guildID: guild.id, userID: usuario.id },
                  {
                    $push: {
                      warnings: warnObject,
                    },
                  }
                )
                .then(() => {
                  console.log(
                    `〔📂〕Actualizando: Advertencias del Usuario. (En ${guild.id} de ${usuario.id})`
                      .brightMagenta.bold
                  );
                });
              /* Guardar en la base de datos */

              await miembro
                .send({
                  embeds: [
                    new EmbedBuilder()
                      .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL({
                          extension: "png",
                          size: 1024,
                        }),
                      })
                      .setTitle(
                        `<:warning:1279144320062066748> Has sido advertido en __${guild.name}__`
                      )
                      .addFields(
                        {
                          name: `Motivo`,
                          value: `\`\`\`yml\n${reason}\`\`\``,
                        },
                        {
                          name: `Moderador`,
                          value: `${member}`,
                        }
                      )
                      .setFooter({
                        text: `Powered by manucatun`,
                        iconURL: `https://static.independent.co.uk/2023/04/10/12/GettyImages-1399738189.jpg?width=1200&height=1200&fit=crop`,
                      })
                      .setColor("Yellow")
                      .setTimestamp(),
                  ],
                })
                .catch(() => {
                  interaction.channel.send({
                    content: `> <:warning:1279144320062066748> **¡No he podido enviarle el mensaje al usuario!**`,
                  });
                });

              await interaction.reply({
                embeds: [
                  new EmbedBuilder()
                    .setAuthor({
                      name: member.displayName,
                      iconURL: user.avatarURL({
                        extension: "png",
                        size: 1024,
                      }),
                    })
                    .setTitle(`<:shield:1279141839605334168> Usuario advertido`)
                    .setThumbnail(
                      usuario.avatarURL({ extension: "png", size: 1024 })
                    )
                    .addFields(
                      {
                        name: `Usuario`,
                        value: `${miembro}`,
                      },
                      {
                        name: `Motivo`,
                        value: `\`\`\`yml\n${reason}\`\`\``,
                      }
                    )
                    .setFooter({
                      text: `Powered by manucatun`,
                      iconURL: `https://static.independent.co.uk/2023/04/10/12/GettyImages-1399738189.jpg?width=1200&height=1200&fit=crop`,
                    })
                    .setColor("Yellow")
                    .setTimestamp(),
                ],
              });
            } catch (e) {
              console.log(e);
              return interaction.reply({
                content: `> <:warning:1279144320062066748> **¡No he podido advertir al usuario!**`,
                ephemeral: true,
              });
            }
          }
          break;
      }
    } catch (e) {
      await interaction.reply({
        content: `> <:error:1279142677308248238> **¡Ocurrió un error al intentar ejecutar el comando!**`,
        ephemeral: true,
      });
      console.log(e);
    }
  },
};
