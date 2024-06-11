const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const ecoSchema = require("../../models/economy");
const { asegurarTodo } = require("../../structures/Functions");
const crypto = require("crypto");
module.exports = {
  CMD: new SlashCommandBuilder()
    .setDescription("😈 Roba dinero de otros usuarios del servidor")
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setDescription("¿A qué usuario deseas robarle?")
        .setRequired(true)
    ),

  async execute(client, interaction, prefix) {
    const { user, member, guild, options } = interaction;

    try {
      const usuario = options.getUser("usuario");
      const miembro = options.getMember("usuario");
      if (usuario.id === user.id || usuario.bot) {
        return interaction.reply({
          content: `> <:no:1198446838819328050> **No es posible intentar robar a este usuario.**`,
          ephemeral: true,
        });
      }

      await asegurarTodo(guild.id, user.id);

      const data = await ecoSchema.findOne({
        guildID: guild.id,
        userID: user.id,
      });
      const dataUsuario = await ecoSchema.findOne({
        guildID: guild.id,
        userID: usuario.id,
      });

      /* Variables */
      const tiempoMs = 1 * 30 * 60 * 1000; // Tiempo en horas
      const recompensa = Math.floor(Math.random() * 500) + 100; // Recompensa del trabajo
      const probabilidad = crypto.randomInt(2); // Probabilidad del 50%

      if (tiempoMs - (Date.now() - data.rob) > 0) {
        const tiempoRes = Math.round(
          (Date.now() + (tiempoMs - (Date.now() - data.rob))) / 1000
        );

        return await interaction.reply({
          content: `> <:time:1198844708655485048> **Podrás volver a intentar robar a otro usuario <t:${tiempoRes}:R>.**`,
          ephemeral: true,
        });
      }
      /* Variables */

      /* Comprobaciones */
      if (
        !dataUsuario ||
        dataUsuario.cash <= 500 ||
        recompensa > dataUsuario.cash
      ) {
        return await interaction.reply({
          content: `> <:no:1198446838819328050> **No es posible intentar robar a este usuario.**`,
          ephemeral: true,
        });
      }
      /* Comprobaciones */

      if (probabilidad === 0) {
        await ecoSchema.findOneAndUpdate(
          { guildID: guild.id, userID: user.id },
          {
            $inc: {
              cash: recompensa,
            },
            rob: Date.now(),
          }
        );

        await ecoSchema.findOneAndUpdate(
          { guildID: guild.id, userID: usuario.id },
          {
            $inc: {
              cash: -recompensa,
            },
          }
        );

        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: `Robo de ${member.displayName} a ${miembro.displayName}`,
                iconURL: user.avatarURL({ extension: "png", size: 1024 }),
              })
              .setDescription(
                `💸 ¡El robo fue un éxito, obtuviste una recompensa de <:coinIcon:1240873651956482139> **${recompensa.toLocaleString()} monedas**!\n`
              )
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
            rob: Date.now(),
          }
        );

        await ecoSchema.findOneAndUpdate(
          { guildID: guild.id, userID: usuario.id },
          {
            $inc: {
              cash: recompensa,
            },
          }
        );

        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: `Robo de ${member.displayName} a ${miembro.displayName}`,
                iconURL: user.avatarURL({ extension: "png", size: 1024 }),
              })
              .setDescription(
                `🚨 ¡El robo ha fallado, no obtuviste ninguna recompensa y fuiste capturado! Perdiste <:coinIcon:1240873651956482139> **${recompensa.toLocaleString()} monedas**.\n`
              )
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
