const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const ecoSchema = require("../../models/economy");
module.exports = {
  CMD: new SlashCommandBuilder()
    .setDescription(
      "⌚ Obtén la lista de tiempo restante para ejecutar ciertos comandos"
    )
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setDescription("¿De qué usuario quieres ver la lista?")
    ),

  async execute(client, interaction, prefix) {
    const { user, member, guild, options } = interaction;

    try {
      const usuario = options.getUser("usuario") || user;
      const miembro = options.getMember("usuario") || member;

      const data = await ecoSchema.findOne({
        guildID: guild.id,
        userID: usuario.id,
      });
      if (!data) {
        return await interaction.reply({
          content: `> <:no:1198446838819328050> **No tienes una cuenta de economía existente.**`,
          ephemeral: true,
        });
      }

      /* Contadores */
      const timeWork = data.work
        ? Math.round(
            (Date.now() + (1 * 45 * 60 * 1000 - (Date.now() - data.work))) /
              1000
          )
        : Math.round(Date.now() / 1000);

      const timeDaily = data.daily
        ? Math.round(
            (Date.now() + (24 * 60 * 60 * 1000 - (Date.now() - data.daily))) /
              1000
          )
        : Math.round(Date.now() / 1000);

      const timeCrime = data.crime
        ? Math.round(
            (Date.now() + (1 * 30 * 60 * 1000 - (Date.now() - data.crime))) /
              1000
          )
        : Math.round(Date.now() / 1000);

      const timeRob = data.rob
        ? Math.round(
            (Date.now() + (1 * 30 * 60 * 1000 - (Date.now() - data.rob))) / 1000
          )
        : Math.round(Date.now() / 1000);
      /* Contadores */

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: `Cooldown de ${miembro.displayName}`,
              iconURL: usuario.avatarURL({ extension: "png", size: 1024 }),
            })
            .addFields(
              {
                name: `🚜 Work`,
                value: `<:time:1198844708655485048> <t:${timeWork}:R> • <t:${timeWork}>\n`,
              },
              {
                name: `📅 Daily`,
                value: `<:time:1198844708655485048> <t:${timeDaily}:R> • <t:${timeDaily}>\n`,
              },
              {
                name: `🔫 Crime`,
                value: `<:time:1198844708655485048> <t:${timeCrime}:R> • <t:${timeCrime}>\n`,
              },
              {
                name: `😈 Rob`,
                value: `<:time:1198844708655485048> <t:${timeRob}:R> • <t:${timeRob}>\n`,
              }
            )
            /* .setColor(process.env.COLOR) */
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
