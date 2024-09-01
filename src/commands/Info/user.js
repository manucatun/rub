const {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
  ActionRowBuilder,
  ButtonBuilder,
} = require("discord.js");
const { getAverageColor } = require("fast-average-color-node");
const { profileImage } = require("discord-arts");
const warningsSchema = require("../../models/warning");
module.exports = {
  CMD: new SlashCommandBuilder()
    .setDescription("👤 Información principal de un usuario")
    .addSubcommand((sub) =>
      sub
        .setName("avatar")
        .setDescription("👤 Obtén el avatar de un usuario")
        .addUserOption((option) =>
          option
            .setName("usuario")
            .setDescription("¿De qué usuario quieres ver la información?")
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("banner")
        .setDescription("👤 Obtén el banner de un usuario")
        .addUserOption((option) =>
          option
            .setName("usuario")
            .setDescription("¿De qué usuario quieres ver la información?")
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("info")
        .setDescription("👤 Muestra la información principal del usuario")
        .addUserOption((option) =>
          option
            .setName("usuario")
            .setDescription("¿De qué usuario quieres ver la información?")
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("profile")
        .setDescription(
          "👤 Obtén una imagen personalizada con la información de perfil del usuario"
        )
        .addUserOption((option) =>
          option
            .setName("usuario")
            .setDescription("¿De qué usuario quieres ver la información?")
        )
    ),

  async execute(client, interaction) {
    try {
      const { guild, user, member, options } = interaction;

      switch (options.getSubcommand()) {
        case "avatar":
          {
            const usuario = options.getUser("usuario") || user;
            const miembro = options.getMember("usuario") || member;

            /* Comprobaciones */
            if (!usuario.avatarURL()) {
              return interaction.reply({
                content: `> <:warning:1279144320062066748> **Este usuario no tiene un banner.**`,
                ephemeral: true,
              });
            }
            /* Comprobaciones */

            const color = await getAverageColor(usuario.avatarURL());

            await interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setAuthor({
                    name: `Avatar de ${miembro.displayName}`,
                    iconURL: usuario.avatarURL({
                      extension: "png",
                      size: 1024,
                    }),
                  })
                  .setImage(usuario.avatarURL({ extension: "png", size: 1024 }))
                  .setColor(color.hex)
                  .setFooter({ text: `Color HEX: ${color.hex}` }),
              ],
              components: [
                new ActionRowBuilder().addComponents([
                  new ButtonBuilder()
                    .setLabel("WEBP")
                    .setStyle("Link")
                    .setURL(
                      usuario.avatarURL({ extension: "webp", size: 1024 })
                    ),
                  new ButtonBuilder()
                    .setLabel("JPG")
                    .setStyle("Link")
                    .setURL(
                      usuario.avatarURL({ extension: "jpg", size: 1024 })
                    ),
                  new ButtonBuilder()
                    .setLabel("PNG")
                    .setStyle("Link")
                    .setURL(
                      usuario.avatarURL({ extension: "png", size: 1024 })
                    ),
                ]),
              ],
            });
          }
          break;

        case "banner":
          {
            const usuario = options.getUser("usuario") || user;
            const miembro = options.getMember("usuario") || member;
            let memberFetch = await usuario.fetch({ force: true });

            /* Comprobaciones */
            if (!usuario.bannerURL()) {
              return interaction.reply({
                content: `> <:warning:1279144320062066748> **Este usuario no tiene un banner.**`,
                ephemeral: true,
              });
            }
            /* Comprobaciones */

            const color = await getAverageColor(usuario.bannerURL());

            await interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setAuthor({
                    name: `Banner de ${miembro.displayName}`,
                    iconURL: usuario.avatarURL({
                      extension: "png",
                      size: 1024,
                    }),
                  })
                  .setImage(usuario.bannerURL({ extension: "png", size: 512 }))
                  .setColor(color.hex)
                  .setFooter({ text: `Color HEX: ${color.hex}` }),
              ],
              components: [
                new ActionRowBuilder().addComponents([
                  new ButtonBuilder()
                    .setLabel("WEBP")
                    .setStyle("Link")
                    .setURL(
                      usuario.bannerURL({ extension: "webp", size: 512 })
                    ),
                  new ButtonBuilder()
                    .setLabel("JPG")
                    .setStyle("Link")
                    .setURL(usuario.bannerURL({ extension: "jpg", size: 512 })),
                  new ButtonBuilder()
                    .setLabel("PNG")
                    .setStyle("Link")
                    .setURL(usuario.bannerURL({ extension: "png", size: 512 })),
                ]),
              ],
            });
          }
          break;

        case "info":
          {
            const usuario = options.getUser("usuario") || user;
            const miembro = options.getMember("usuario") || member;
            let memberFetch = await usuario.fetch({ force: true });

            const data = await warningsSchema.findOne({
              guildID: guild.id,
              userID: miembro.id,
            });

            await interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setAuthor({
                    name: `Información de ${miembro.displayName}`,
                    iconURL: usuario.avatarURL({
                      extension: "png",
                      size: 1024,
                    }),
                  })
                  .setThumbnail(
                    usuario.avatarURL({ extension: "png", size: 1024 })
                  )
                  .setImage(
                    usuario.bannerURL({
                      format: "png",
                      size: 512,
                    })
                  )
                  .addFields(
                    {
                      name: `Información General`,
                      value: [
                        `📋 • **ID:** \`${usuario.id}\``,
                        `<:member:1279140359938768989> • **Usuario:** ${usuario.username}`,
                        `🌍 • **Nombre:** ${
                          usuario.globalName
                            ? usuario.globalName
                            : usuario.username
                        }`,
                        `✍🏼 • **Apodo:** ${miembro}`,
                        `📅 • **Creación:** <t:${parseInt(
                          usuario.createdTimestamp / 1000
                        )}:R>`,
                        `<:booster:1279140811480760410> • **Boost:** ${
                          miembro.premiumSince ? "Si" : "No"
                        }`,
                      ].join("\n"),
                    },
                    {
                      name: `Advertencias en el Servidor`,
                      value: `\`${data.warnings.length} advertencias\``,
                    },
                    {
                      name: `Unión al Servidor`,
                      value: `<t:${parseInt(
                        miembro.joinedAt / 1000
                      )}> • <t:${parseInt(miembro.joinedAt / 1000)}:R>`,
                    },
                    {
                      name: `Roles (Primeros 10)`,
                      value: `${miembro.roles.cache
                        .map((rol) => rol.toString())
                        .slice(0, 10)
                        .join(", ")}`,
                    },
                    {
                      name: `Banner del Usuario`,
                      value: usuario.bannerURL({ extension: "png", size: 512 })
                        ? "** **"
                        : `El usuario no tiene un banner.`,
                    }
                  )
                  .setColor(miembro.roles.highest.color || process.env.COLOR),
              ],
            });
          }
          break;

        case "profile":
          {
            const usuario = options.getUser("usuario") || user;

            const buffer = await profileImage(usuario.id, {
              squareAvatar: true,
              removeAvatarFrame: true,
              overwriteBadges: true,
              badgesFrame: true,
              ...options,
            });

            await interaction.reply({
              files: [new AttachmentBuilder(buffer)],
            });
          }
          break;
      }
    } catch (e) {
      console.log(e);
      interaction.reply({
        content: `> <:error:1279142677308248238> **¡Ocurrió un error al intentar ejecutar el comando!**`,
        ephemeral: true,
      });
    }
  },
};
