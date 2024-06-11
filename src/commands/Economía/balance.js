const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const ecoSchema = require("../../models/economy");
module.exports = {
  CMD: new SlashCommandBuilder()
    .setDescription("💰 Información de la cuenta de un usuario")
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setDescription("¿De qué usuario quieres ver la información?")
    ),

  async execute(client, interaction, prefix) {
    const { user, member, options, guild } = interaction;

    try {
      const usuario = options.getUser("usuario") || user;
      const miembro = options.getMember("usuario") || member;
      if (usuario.bot || miembro.bot) {
        return interaction.reply({
          content: `> <:no:1198446838819328050> **Este usuario no puede tener una cuenta de economía.**`,
          ephemeral: true,
        });
      }

      const data = await ecoSchema.findOne({
        guildID: guild.id,
        userID: usuario.id,
      });
      if (!data) {
        return interaction.reply({
          content: `> <:no:1198446838819328050> **Este usuario actualmente no tiene una cuenta de economía.**`,
          ephemeral: true,
        });
      }

      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: `Balance de ${miembro.displayName}`,
              iconURL: usuario.avatarURL({ extension: "png", size: 1024 }),
            })
            .addFields(
              {
                name: `💵 Efectivo`,
                value: `<:coinIcon:1240873651956482139> ${data.cash.toLocaleString()} monedas`,
              },
              {
                name: `💰 Cuenta Bancaria`,
                value: `<:coinIcon:1240873651956482139> ${data.bank.toLocaleString()} monedas`,
              }
            )
            .setCOLOR(process.env.COLOR)
            .setFooter({
              text: `Powered by manucatun`,
              iconURL: `https://static.independent.co.uk/2023/04/10/12/GettyImages-1399738189.jpg?width=1200&height=1200&fit=crop`,
            }),
        ],
      });
    } catch (e) {
      console.log(e);
      interaction.reply({
        content: `> <:error:1198447011448508466> **¡Ocurrió un error al intentar ejecutar el comando!**`,
        ephemeral: true,
      });
    }
  },
};
