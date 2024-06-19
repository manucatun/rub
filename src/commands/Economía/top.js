const { SlashCommandBuilder } = require("discord.js");
const { asegurarTodo, paginacion } = require("../../structures/Functions");
const ecoSchema = require("../../models/economy");
module.exports = {
  CMD: new SlashCommandBuilder().setDescription(
    "🏅 Mejores 10 posiciones de economía en el servidor"
  ),

  async execute(client, interaction, prefix) {
    try {
      const medallas = { 1: "🥇", 2: "🥈", 3: "🥉" };

      const todos = await ecoSchema.find({ guildID: interaction.guild.id });
      const lista = todos
        .sort((a, b) => Number(b.cash + b.bank) - (a.cash + a.bank))
        .slice(0, 10);

      const texto = lista.map(
        (miembro, index) =>
          `${medallas[index + 1] ?? ""} \`${index + 1}\` • <@${
            miembro.userID
          }>\n**Balance General:** <:coinIcon:1240873651956482139> ${Math.floor(
            miembro.cash + miembro.bank
          ).toLocaleString()} monedas\n**Efectivo:** <:coinIcon:1240873651956482139> ${miembro.cash.toLocaleString()} monedas • **Banco:** <:coinIcon:1240873651956482139> ${miembro.bank.toLocaleString()} monedas\n\n`
      );

      paginacion(
        client,
        interaction,
        texto,
        `🏆 \`[${lista.length}]\` Top de Economía en ${interaction.guild.name}`,
        5
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
