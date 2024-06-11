const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const ecoSchema = require("../../models/economy");
const { asegurarTodo } = require("../../structures/Functions");
const crypto = require("crypto");
module.exports = {
  CMD: new SlashCommandBuilder().setDescription(
    "🔫 Realiza crímenes y obtén dinero"
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
      const tiempoMs = 1 * 30 * 60 * 1000; // Tiempo en horas
      const recompensa = Math.floor(Math.random() * 500) + 200; // Recompensa del trabajo
      const probabilidad = crypto.randomInt(2); // Probabilidad de ganancia del 50%

      const trabajos = [
        "En un mundo de secretos, estás a punto de sumergirte en una misión arriesgada. ¿Lograrás completarla y evitar ser detectado?",
      ];
      let trabajo = trabajos[Math.floor(Math.random() * trabajos.length)];

      if (tiempoMs - (Date.now() - data.crime) > 0) {
        const tiempoRes = Math.round(
          (Date.now() + (tiempoMs - (Date.now() - data.crime))) / 1000
        );

        return await interaction.reply({
          content: `> <:time:1198844708655485048> **Podrás volver a intentar realizar un crimen <t:${tiempoRes}:R>.**`,
          ephemeral: true,
        });
      }
      /* Variables */

      if (probabilidad === 0) {
        await ecoSchema.findOneAndUpdate(
          { guildID: guild.id, userID: user.id },
          {
            $inc: {
              cash: recompensa,
            },
            crime: Date.now(),
          }
        );

        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: `Crimen de ${member.displayName}`,
                iconURL: user.avatarURL({ extension: "png", size: 1024 }),
              })
              .setDescription(
                `💸 ¡El crimen ha sido un éxito, obtuviste una recompensa de <:coinIcon:1240873651956482139> **${recompensa.toLocaleString()} monedas**!\n`
              )
              .addFields({
                name: `Crimen Realizado`,
                value: `${trabajo}`,
              })
              .setCOLOR(process.env.COLOR)
              .setFooter({
                text: `Powered by manucatun`,
                iconURL: `https://static.independent.co.uk/2023/04/10/12/GettyImages-1399738189.jpg?width=1200&height=1200&fit=crop`,
              }),
          ],
        });
      } else {
        await ecoSchema.findOneAndUpdate(
          { guildID: guild.id, userID: user.id },
          {
            $inc: {
              cash: -recompensa,
            },
            crime: Date.now(),
          }
        );

        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: `Crimen de ${member.displayName}`,
                iconURL: user.avatarURL({ extension: "png", size: 1024 }),
              })
              .setDescription(
                `🚔 ¡El crimen ha fracasado completamente, perdiste <:coinIcon:1240873651956482139> **${recompensa.toLocaleString()} monedas**!\n`
              )
              .addFields({
                name: `Crimen Realizado`,
                value: `${trabajo}`,
              })
              .setCOLOR("Red")
              .setFooter({
                text: `Powered by manucatun`,
                iconURL: `https://static.independent.co.uk/2023/04/10/12/GettyImages-1399738189.jpg?width=1200&height=1200&fit=crop`,
              }),
          ],
        });
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
