const { SlashCommandBuilder } = require("discord.js");
module.exports = {
  CMD: new SlashCommandBuilder()
    .setDescription("🗣 El bot repetirá lo que le digas")
    .addStringOption((option) =>
      option
        .setName("texto")
        .setDescription("¿Qué mensaje repetirá el bot?")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("id")
        .setDescription("¿A qué mensaje responderá el bot? Proporciona la Id")
    )
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setDescription("¿A qué usuario responderá el bot?")
    ),

  async execute(client, interaction, prefix) {
    const { options, channel, user } = interaction;

    try {
      const texto = options.getString("texto");
      let id = options.getString("id");
      let usuario = options.getUser("usuario");

      /* Comprobaciones */
      const palabras = texto.trim().split(/\s+/);
      if (palabras.length > 15) {
        return interaction.reply({
          content: `> <:cross:1279140540901888060> **El texto es demasiado largo, asegúrate de que sean menos de 15 palabras.**`,
          ephemeral: true,
        });
      }

      if (id) {
        id = channel.messages.cache.get(id);
        if (!id) {
          return interaction.reply({
            content: `> <:cross:1279140540901888060> **No pude encontrar el Id del mensaje en este canal.**`,
            ephemeral: true,
          });
        }

        await interaction.reply({
          content: `> <:bot:1279142542306185368> **${client.user.username} repetirá:**\n\`\`\`yml\n${texto}\`\`\``,
          ephemeral: true,
        });
        channel.sendTyping();
        return setTimeout(() => id.reply(`${texto}`), 5000);
      } else if (usuario) {
        usuario = channel.messages.cache
          .filter((m) => m.author.id === usuario.id)
          .last();
        if (!usuario) {
          return interaction.reply({
            content: `> <:cross:1279140540901888060> **No pude encontrar el último mensaje del usuario en este canal.**`,
            ephemeral: true,
          });
        }

        await interaction.reply({
          content: `> <:bot:1279142542306185368> **${client.user.username} repetirá:**\n\`\`\`yml\n${texto}\`\`\``,
          ephemeral: true,
        });
        channel.sendTyping();
        return setTimeout(() => usuario.reply(`${texto}`), 5000);
      }
      /* Comprobaciones */

      await interaction.reply({
        content: `> <:bot:1279142542306185368> **${client.user.username} repetirá:**\n\`\`\`yml\n${texto}\`\`\``,
        ephemeral: true,
      });
      channel.sendTyping();
      return setTimeout(() => channel.send(`${texto}`), 5000);
    } catch (e) {
      console.log(e);
      interaction.reply({
        content: `> <:error:1279142677308248238> **¡Ocurrió un error al intentar ejecutar el comando!**`,
        ephemeral: true,
      });
    }
  },
};
