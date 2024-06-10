const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const ecoSchema = require("../../models/economy");
module.exports = {
  CMD: new SlashCommandBuilder()
    .setDescription("💰 Transfiere dinero a otro usuario del servidor")
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setDescription("¿A qué usuario quieres transferirle dinero?")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("cantidad")
        .setDescription("¿Qué cantidad de monedas quieres transferir?")
        .setRequired(true)
    ),

  async execute(client, interaction, prefix) {
    const { user, member, guild, options } = interaction;

    try {
      const usuario = options.getUser("usuario");
      const miembro = options.getMember("usuario");
      let cantidad = options.getString("cantidad") || "all";

      const data = await ecoSchema.findOne({
        guildID: guild.id,
        userID: user.id,
      });

      const dataUsuario = await ecoSchema.findOne({
        guildID: guild.id,
        userID: usuario.id,
      });

      /* Comprobaciones */
      if (!data) {
        return await interaction.reply({
          content: `> <:no:1198446838819328050> **No tienes una cuenta de economía existente.**`,
          ephemeral: true,
        });
      }

      if (!dataUsuario) {
        return await interaction.reply({
          content: `> <:no:1198446838819328050> **No es posible transferir dinero a este usuario, ya que no tiene una cuenta de economía existente.**`,
          ephemeral: true,
        });
      }

      if (
        !cantidad ||
        ["todo", "all", "all-in"].includes(cantidad.toLowerCase())
      ) {
        cantidad = data.cash;
      }

      if (
        isNaN(cantidad) ||
        cantidad <= 0 ||
        cantidad % 1 !== 0 ||
        cantidad > data.cash
      ) {
        return await interaction.reply({
          content: `> <:no:1198446838819328050> **No es una cantidad válida para transferir.**`,
          ephemeral: true,
        });
      }
      /* Comprobaciones */

      await ecoSchema.findOneAndUpdate(
        { guildID: guild.id, userID: user.id },
        {
          $inc: {
            cash: -cantidad,
          },
        }
      );

      await ecoSchema.findOneAndUpdate(
        { guildID: guild.id, userID: usuario.id },
        {
          $inc: {
            cash: cantidad,
          },
        }
      );

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: `Transferencia de ${member.displayName} a ${miembro.displayName}`,
              iconURL: user.avatarURL({ extension: "png", size: 1024 }),
            })
            .setDescription(
              `💸 Has transferido <:coinIcon:1240873651956482139> **${cantidad.toLocaleString()} monedas** a la cuenta bancaria de ${
                miembro.displayName
              }.\n`
            )
            .addFields(
              {
                name: `Balance de Efectivo Actualizado`,
                value: `<:coinIcon:1240873651956482139> ${Math.floor(
                  data.cash - parseInt(cantidad)
                ).toLocaleString()} monedas`,
                inline: true,
              },
              {
                name: `Balance de Efectivo de ${miembro.displayName}`,
                value: `<:coinIcon:1240873651956482139> ${Math.floor(
                    dataUsuario.cash + parseInt(cantidad)
                ).toLocaleString()}  monedas`,
                inline: true,
              }
            )
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
