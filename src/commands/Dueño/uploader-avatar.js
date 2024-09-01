const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
module.exports = {
  CMD: new SlashCommandBuilder()
    .setDescription("📡 Cambia el avatar del bot • OWNER")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addAttachmentOption((option) =>
      option
        .setName("archivo")
        .setDescription("¿Qué imagen se le colocará al bot?")
        .setRequired(true)
    ),
  owner: true,

  async execute(client, interaction) {
    try {
      await interaction.deferReply();

      const archivo = interaction.options.getAttachment("archivo");
      if (!archivo.contentType.startsWith("image/"))
        return interaction.editReply({
          content: `> <:warning:1279144320062066748> **No es un formato de archivo válido.**`,
          ephemeral: true,
        });

      await client.user.setAvatar(archivo.url).catch(async (e) => {
        console.log(e);
        return await interaction.editReply({
          content: `> <:error:1279142677308248238> **¡Ocurrió un error al intentar ejecutar el comando!**`,
          ephemeral: true,
        });
      });

      await interaction.editReply({
        content: `> <:management:1279139587448504460> **¡Avatar modificado correctamente!**`,
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
