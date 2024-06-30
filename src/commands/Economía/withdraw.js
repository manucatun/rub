const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const ecoSchema = require("../../models/economy");
const { asegurarTodo } = require("../../structures/Functions");
module.exports = {
  CMD: new SlashCommandBuilder()
    .setDescription("💰 Retira dinero a efectivo de tu cuenta bancaria")
    .addStringOption((option) =>
      option
        .setName("cantidad")
        .setDescription("¿Qué cantidad de monedas quieres retirar?")
    ),

  async execute(client, interaction, prefix) {
    const { user, member, guild, options } = interaction;

    try {
      let cantidad = options.getString("cantidad") || "all";

      await asegurarTodo(guild.id, user.id);

      const data = await ecoSchema.findOne({
        guildID: guild.id,
        userID: user.id,
      });

      /* Comprobaciones */
      if (
        !cantidad ||
        ["todo", "all", "all-in"].includes(cantidad.toLowerCase())
      ) {
        cantidad = data.bank;
      }

      if (
        isNaN(cantidad) ||
        cantidad <= 0 ||
        cantidad % 1 !== 0 ||
        cantidad > data.bank
      ) {
        return await interaction.reply({
          content: `> <:no:1198446838819328050> **No es una cantidad válida para retirar.**`,
          ephemeral: true,
        });
      }
      /* Comprobaciones */

      await ecoSchema.findOneAndUpdate(
        { guildID: guild.id, userID: user.id },
        {
          $inc: {
            cash: cantidad,
            bank: -cantidad,
          },
        }
      );

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: `Retiro de ${member.displayName}`,
              iconURL: user.avatarURL({ extension: "png", size: 1024 }),
            })
            .setDescription(
              `💸 Has retirado <:coinIcon:1240873651956482139> **${cantidad.toLocaleString()} monedas** de tu cuenta bancaria.\n`
            )
            .addFields(
              {
                name: `Balance de Efectivo`,
                value: `<:coinIcon:1240873651956482139> ${Math.floor(
                  data.cash + parseInt(cantidad)
                ).toLocaleString()} monedas`,
                inline: true,
              },
              {
                name: `Balance de Cuenta Bancaria`,
                value: `<:coinIcon:1240873651956482139> ${Math.floor(
                  data.bank - parseInt(cantidad)
                ).toLocaleString()} monedas`,
                inline: true,
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
