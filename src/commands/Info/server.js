const {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ChannelType,
} = require("discord.js");
const { getAverageColor } = require("fast-average-color-node");
module.exports = {
  CMD: new SlashCommandBuilder()
    .setDescription("🏡 Información principal del servidor")
    .addSubcommand((sub) =>
      sub.setName("banner").setDescription("🏡 Obtén el banner del servidor")
    )
    .addSubcommand((sub) =>
      sub.setName("icon").setDescription("🏡 Obtén el icono del servidor")
    )
    .addSubcommand((sub) =>
      sub
        .setName("info")
        .setDescription("🏡 Muestra la información principal del servidor")
    ),

  async execute(client, interaction) {
    const { guild, options } = interaction;

    try {
      switch (options.getSubcommand()) {
        case "banner":
          {
            let guildFetch = await guild.fetch({ force: true });

            /* Comprobaciones */
            if (!guild.bannerURL()) {
              return interaction.reply({
                content: `> <:error:1198447011448508466> **Este servidor no tiene un banner.**`,
                ephemeral: true,
              });
            }
            /* Comprobaciones */

            const color = await getAverageColor(guild.bannerURL());

            await interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setAuthor({
                    name: `Banner de ${guild.name}`,
                    iconURL: guild.iconURL({
                      extension: "png",
                      size: 1024,
                    }),
                  })
                  .setImage(guild.bannerURL({ extension: "png", size: 512 }))
                  .setColor(color.hex)
                  .setFooter({ text: `Color HEX: ${color.hex}` }),
              ],
              components: [
                new ActionRowBuilder().addComponents([
                  new ButtonBuilder()
                    .setLabel("WEBP")
                    .setStyle("Link")
                    .setURL(guild.bannerURL({ extension: "webp", size: 512 })),
                  new ButtonBuilder()
                    .setLabel("JPG")
                    .setStyle("Link")
                    .setURL(guild.bannerURL({ extension: "jpg", size: 512 })),
                  new ButtonBuilder()
                    .setLabel("PNG")
                    .setStyle("Link")
                    .setURL(guild.bannerURL({ extension: "png", size: 512 })),
                ]),
              ],
            });
          }
          break;

        case "icon":
          {
            /* Comprobaciones */
            if (!guild.iconURL()) {
              return interaction.reply({
                content: `> <:error:1198447011448508466> **Este servidor no tiene un icono.**`,
                ephemeral: true,
              });
            }
            /* Comprobaciones */

            const color = await getAverageColor(guild.iconURL());

            await interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setAuthor({
                    name: `Icon de ${guild.name}`,
                    iconURL: guild.iconURL({
                      extension: "png",
                      size: 1024,
                    }),
                  })
                  .setImage(guild.iconURL({ extension: "png", size: 1024 }))
                  .setColor(color.hex)
                  .setFooter({ text: `Color HEX: ${color.hex}` }),
              ],
              components: [
                new ActionRowBuilder().addComponents([
                  new ButtonBuilder()
                    .setLabel("WEBP")
                    .setStyle("Link")
                    .setURL(guild.iconURL({ extension: "webp", size: 1024 })),
                  new ButtonBuilder()
                    .setLabel("JPG")
                    .setStyle("Link")
                    .setURL(guild.iconURL({ extension: "jpg", size: 1024 })),
                  new ButtonBuilder()
                    .setLabel("PNG")
                    .setStyle("Link")
                    .setURL(guild.iconURL({ extension: "png", size: 1024 })),
                ]),
              ],
            });
          }
          break;

        case "info":
          {
            let guildFetch = await guild.fetch({ force: true });
            const botCount = await guild.members.cache.filter(
              (miembro) => miembro.user.bot
            ).size;
            const channelTypesSize = (type) =>
              guild.channels.cache.filter((channel) =>
                type.includes(channel.type)
              ).size;

            console.log(process.env.COLOR);
            
            await interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setAuthor({
                    name: `Información de ${guild.name}`,
                    iconURL: guild.iconURL({
                      extension: "png",
                      size: 1024,
                    }),
                  })
                  .setThumbnail(guild.iconURL({ extension: "png", size: 1024 }))
                  .setImage(
                    guild.bannerURL({
                      format: "png",
                      size: 512,
                    })
                  )
                  .addFields(
                    {
                      name: `Información General`,
                      value: [
                        `📋 • **ID:** \`${guild.id}\``,
                        `<:owner:1198448330641002548> • **Dueño:** ${await guild.fetchOwner()}`,
                        `🌍 • **Nombre:** ${guild.name}`,
                        `📅 • **Creación:** <t:${parseInt(
                          guild.createdTimestamp / 1000
                        )}:R>`,
                      ].join("\n"),
                    },
                    {
                      name: `Usuarios`,
                      value: [
                        `<:members:1198448160847188050> • **Miembros:** ${
                          guild.members.cache.filter(
                            (miembro) => !miembro.user.bot
                          ).size
                        }`,
                        `🤖 • **Bots:** ${botCount}`,
                        `🎲 • **Total:** ${guild.memberCount}`,
                      ].join("\n"),
                    },
                    {
                      name: `Canales`,
                      value: [
                        `💬 • **Texto:** ${channelTypesSize([
                          ChannelType.GuildText,
                          ChannelType.GuildAnnouncement,
                          ChannelType.PublicThread,
                          ChannelType.PrivateThread,,
                        ])}`,
                        `🔊 • **Voz:** ${channelTypesSize([
                          ChannelType.GuildVoice,
                        ])}`,
                        `📃 • **Foros:** ${channelTypesSize([
                          ChannelType.GuildForum,
                        ])}`,
                        `📙 • **Categorías:** ${channelTypesSize([
                          ChannelType.GuildCategory,
                        ])}`,
                        `🎪 • **Escenarios:** ${channelTypesSize([
                          ChannelType.GuildStageVoice,
                        ])}`,
                      ].join("\n"),
                    },
                    {
                      name: `Otros`,
                      value: [
                        `🎨 • **Roles:** ${guild.roles.cache.size}`,
                        `😃 • **Emojis:** ${guild.emojis.cache.size}`,
                        `<:boost:1198448219957502093> • **Nivel de Mejoras:** ${guild.premiumTier}`,
                        `🎁 • **Boosts:** ${guild.premiumSubscriptionCount.toString()}`,
                      ].join("\n"),
                    },
                    {
                      name: `Banner del Servidor`,
                      value: guild.bannerURL({ extension: "png", size: 512 })
                        ? "** **"
                        : `El servidor no tiene un banner.`,
                    }
                  )
                  .setColor(process.env.COLOR),
              ],
            });
          }
          break;
      }
    } catch (e) {
      console.log(e);
      interaction.reply({
        content: `> <:warning:1198447554497618010> **¡Ocurrió un error al intentar ejecutar el comando!**`,
        ephemeral: true,
      });
    }
  },
};
