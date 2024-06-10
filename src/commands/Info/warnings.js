const { SlashCommandBuilder } = require("discord.js");
const { paginacion } = require("../../structures/Functions");
const warningsSchema = require("../../models/warning");
module.exports = {
  CMD: new SlashCommandBuilder()
    .setDescription(
      "🧐 Listado de advertencias de un usuario dentro del servidor"
    )
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setDescription("¿De qué usuario deseas ver la lista?")
    ),

  async execute(client, interaction, prefix) {
    try {
      const usuario =
        interaction.options.getUser("usuario") || interaction.user;
      const miembro =
        interaction.options.getMember("usuario") || interaction.member;

      const data = await warningsSchema.findOne({
        guildID: interaction.guild.id,
        userID: usuario.id,
      });
      if (!data || data.warnings.length === 0) {
        return interaction.reply({
          content: `> <:newmember:1198448064881512450> **El usuario no tiene ninguna advertencia en el servidor.**`,
          ephemeral: true,
        });
      }

      const texto = data.warnings.map(
        (warn, index) =>
          `================================\n**Id:** \`${index}\`\n**Fecha:** <t:${Math.round(
            warn.date / 1000
          )}>\n**Autor:** <@${warn.author}>\n**Razón:**\n\`\`\`yml\n${
            warn.reason
          }\`\`\``
      );

      paginacion(
        client,
        interaction,
        texto,
        `<:shield:1198447657761390622> \`[${data.warnings.length}]\` Advertencias de ${miembro.displayName}`,
        1
      );
    } catch (e) {
      console.log(e);
      interaction.reply({
        content: `> <:error:1198447011448508466> **¡Ocurrió un error al intentar ejecutar el comando!**`,
        ephemeral: true,
      });
    }
  },
};
