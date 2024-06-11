const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
module.exports = {
  CMD: new SlashCommandBuilder()
    .setDescription("🎱 La bola mágica del bot responderá tu pregunta")
    .addStringOption((option) =>
      option
        .setName("pregunta")
        .setDescription("¿Qué quieres preguntarle al bot?")
        .setRequired(true)
    ),

  async execute(client, interaction) {
    try {
      const pregunta = interaction.options.getString("pregunta");

      const resp = [
        "Si",
        "No",
        "Claro",
        "Exactamente",
        "Probablemente si",
        "Probablemente no",
        "Definitivamente si",
        "Definitivamente no",
        "Tal vez",
        "Puede ser",
        "No lo sé",
        "Obviamente si",
        "Obviamente no",
        "Creo que si",
        "Creo que no",
        "¿Tú crees?",
        "No hay que hablar de esto",
        "¿Por qué preguntas eso?",
        "Pregúntame otra cosa",
        "No puedo responder eso",
      ];
      const random = Math.floor(Math.random() * resp.length);

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(
              `¿${(
                pregunta.charAt(0).toUpperCase() +
                pregunta.slice(1).toLowerCase()
              ).replace(/[¿?]/, "")}?`
            )
            .setDescription(`${resp[random]}`)
            .setFooter({
              text: `Powered by manucatun`,
              iconURL: `https://static.independent.co.uk/2023/04/10/12/GettyImages-1399738189.jpg?width=1200&height=1200&fit=crop`,
            })
            .setCOLOR(process.env.COLOR),
        ],
      });
    } catch (e) {
      console.log(e);
      interaction.reply({
        content: `> <:warning:1198447554497618010> **¡Ocurrió un error al intentar ejecutar el comando!**`,
        ephemeral: true,
      });
    }
  },
};
