const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
module.exports = {
  CMD: new SlashCommandBuilder()
    .setDescription("📡 Recarga la configuración y código del bot • OWNER")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName("módulo")
        .setDescription("¿Qué módulo deseas recargar?")
        .addChoices(
          { name: "Comandos", value: "cmd" },
          { name: "Eventos", value: "events" },
          { name: "Handlers", value: "handlers" }
        )
    ),
  owner: true,

  async execute(client, interaction, prefix) {
    try {
      const recargar = interaction.options.getString("módulo");
      let seleccionado = "Comandos, Eventos y Handlers";

      switch (recargar?.toLowerCase()) {
        case "cmd":
          {
            seleccionado = "Comandos";
            await client.loadSlashCommands();
          }
          break;

        case "events":
          {
            seleccionado = "Eventos";
            await client.loadEvents();
          }
          break;

        case "handlers":
          {
            seleccionado = "Handlers";
            await client.loadHandlers();
          }
          break;

        default:
          {
            await client.loadEvents();
            await client.loadHandlers();
            await client.loadSlashCommands();
          }
          break;
      }

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: `${client.user.username} fue recargado correctamente`,
              iconURL: client.user.avatarURL({ extension: "png", size: 1024 }),
            })
            .setDescription(
              `<:management:1279139587448504460> Se recargaron todos los procesos de \`${seleccionado}\` correctamente.`
            )
            /* .setColor(process.env.COLOR) */,
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
