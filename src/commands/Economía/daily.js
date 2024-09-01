const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { asegurarTodo } = require("../../structures/Functions");
const ecoSchema = require("../../models/economy");
module.exports = {
  CMD: new SlashCommandBuilder().setDescription(
    "📅 Obtén tu recompensa diaria"
  ),

  async execute(client, interaction, prefix) {
    const { user, member, guild } = interaction;

    try {
      await asegurarTodo(guild.id, user.id);

      const data = await ecoSchema.findOne({
        guildID: guild.id,
        userID: user.id,
      });

      /* Variables */
      const tiempoMs = 24 * 60 * 60 * 1000; // Tiempo en horas
      const recompensa = 750; // Recompensa del trabajo

      if (tiempoMs - (Date.now() - data.daily) > 0) {
        const tiempoRes = Math.round(
          (Date.now() + (tiempoMs - (Date.now() - data.daily))) / 1000
        );

        return await interaction.reply({
          content: `> <:time:1279138439417303161> **Podrás volver a reclamar tu recompensa diaria <t:${tiempoRes}:R>.**`,
          ephemeral: true,
        });
      }
      /* Variables */

      await ecoSchema.findOneAndUpdate(
        { guildID: guild.id, userID: user.id },
        {
          $inc: {
            cash: recompensa,
          },
          daily: Date.now(),
        }
      );

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: `Recompensa diaria de ${member.displayName}`,
              iconURL: user.avatarURL({ extension: "png", size: 1024 }),
            })
            .setDescription(
              `📅 ¡Obtuviste una recompensa de <:coin:1279135394918694922> **${recompensa.toLocaleString()} monedas**!\nRegresa mañana para conseguirla de nuevo.\n`
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
        content: `> <:error:1279142677308248238> **¡Ocurrió un error al intentar ejecutar el comando!**`,
        ephemeral: true,
      });
    }
  },
};
