const { asegurarTodo } = require("../../structures/Functions");
const setupSchema = require("../../models/setup");

module.exports = async (client, interaction) => {
  if (!interaction.guild || !interaction.channel) return;

  await asegurarTodo(interaction.guild.id, interaction.user.id);
  const data = await setupSchema.findOne({ guildID: interaction.guild.id });

  const comando = client.slashCommands.get(interaction?.commandName);
  if (comando) {
    if (comando.owner) {
      const dueños = process.env.OWNERS.split(" ");
      if (!dueños.includes(interaction.user.id))
        return interaction.reply({
          content: `> <:no:1198446838819328050> **Solo los dueños de ${client.user.username} pueden utilizar este comando.**`,
          ephemeral: true,
        });
    }

    if (comando.botPerms) {
      if (!interaction.guild.members.me.permissions.has(comando.botPerms))
        return interaction.reply({
          content: `> <:error:1198447011448508466> **No tengo suficientes permisos para ejecutar este comando.**`,
          ephemeral: true,
        });
    }

    if (comando.perms) {
      if (!interaction.member.permissions.has(comando.perms))
        return interaction.reply({
          content: `> <:no:1198446838819328050> **No tienes suficientes permisos para ejecutar este comando.**`,
          ephemeral: true,
        });
    }

    try {
      comando.execute(client, interaction, "/");
    } catch (e) {
      interaction.reply({
        content: `> <:warning:1198447554497618010> **¡Ocurrió un error al intentar ejecutar el comando!**`,
        ephemeral: true,
      });
      console.log(e);
    }
  }
};
