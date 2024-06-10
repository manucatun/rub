const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const ecoSchema = require("../../models/economy");
const { asegurarTodo } = require("../../structures/Functions");
module.exports = {
  CMD: new SlashCommandBuilder().setDescription(
    "🚜 Obtén monedas realizando trabajos"
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
      const tiempoMs = 1 * 45 * 60 * 1000; // Tiempo en horas
      const recompensa = Math.floor(Math.random() * 800) + 200; // Recompensa del trabajo

      const trabajos = [
        "¡Jornada como conductor de tren completada con éxito! Tu habilidad para mantener la puntualidad y la seguridad en las vías ha sido reconocida con un generoso aumento salarial.",
      ];
      let trabajo = trabajos[Math.floor(Math.random() * trabajos.length)];

      if (tiempoMs - (Date.now() - data.work) > 0) {
        const tiempoRes = Math.round(
          (Date.now() + (tiempoMs - (Date.now() - data.work))) / 1000
        );

        return await interaction.reply({
          content: `> <:time:1198844708655485048> **Podrás volver a trabajar <t:${tiempoRes}:R>.**`,
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
          work: Date.now(),
        }
      );

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: `Trabajo de ${member.displayName}`,
              iconURL: user.avatarURL({ extension: "png", size: 1024 }),
            })
            .setDescription(
              `💸 ¡Obtuviste una recompensa de <:coinIcon:1240873651956482139> **${recompensa.toLocaleString()} monedas**!\n`
            )
            .addFields({
              name: `Trabajo Realizado`,
              value: `${trabajo}`,
            })
            .setColor(process.env.COLOR)
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
