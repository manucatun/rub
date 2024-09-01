const {
  SlashCommandBuilder,
  ModalBuilder,
  ActionRowBuilder,
  EmbedBuilder,
  TextInputBuilder,
  TextInputStyle,
  ButtonBuilder,
  DiscordAPIError,
} = require("discord.js");
const setupSchema = require("../../models/setup");
module.exports = {
  CMD: new SlashCommandBuilder().setDescription(
    "🤫 Crea confesiones de forma anónima"
  ),

  async execute(client, interaction) {
    const { guild, user, member, channel } = interaction;

    /* Comprobaciones */
    if (!guild || !channel) return;

    const data = await setupSchema.findOne({ guildID: guild.id });

    if (
      !data ||
      !data.confessions ||
      !guild.channels.cache.get(data.confessions)
    )
      return interaction.reply({
        content: `> <:management:1279139587448504460> **No se ha establecido un canal para enviar confesiones en el servidor.**`,
        ephemeral: true,
      });

    const canal = guild.channels.cache.get(data.confessions);
    if (!canal)
      return interaction.reply({
        content: `> <:management:1279139587448504460> **No se ha establecido un canal para enviar confesiones en el servidor.**`,
        ephemeral: true,
      });
    /* Comprobaciones */

    /* Crear Modal */
    const modal = new ModalBuilder()
      .setTitle(`🤫 ¡Envía una nueva confesión!`)
      .setCustomId(`conf-${user.username}`);

    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId(`confText`)
          .setLabel(`¿Qué quieres confesar?`)
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
          .setMaxLength(150)
          .setMinLength(10)
          .setPlaceholder(`Confieso que...`)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId(`confAnon`)
          .setLabel(`¿Será anónima?`)
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(2)
          .setMinLength(2)
          .setPlaceholder(`Si o No`)
          .setValue(`Si`)
      )
    );
    /* Crear Modal */

    let modalInteraction;

    try {
      modalInteraction = await interaction.showModal(modal);

      modalInteraction = await interaction.awaitModalSubmit({
        filter: (i) => i.customId === `conf-${user.username}`,
        time: 180e3,
      });

      await modalInteraction.deferReply({ ephemeral: true });

      const text = modalInteraction.fields.getTextInputValue("confText");

      if (
        modalInteraction.fields.getTextInputValue("confAnon").toLowerCase() ===
        "si"
      ) {
        await canal.send({
          embeds: [
            new EmbedBuilder()
              .setTitle(`🤫 Nueva Confesión`)
              .setDescription(`\`\`\`yml\n${text}\`\`\``)
              .setFooter({
                text: `Powered by manucatun`,
                iconURL: `https://static.independent.co.uk/2023/04/10/12/GettyImages-1399738189.jpg?width=1200&height=1200&fit=crop`,
              })
              /* .setColor(process.env.COLOR) */
              .setTimestamp(),
          ],
        });
      } else if (
        modalInteraction.fields.getTextInputValue("confAnon").toLowerCase() ===
        "no"
      ) {
        await canal.send({
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: member.displayName,
                iconURL: user.avatarURL({ extension: "png", size: 1024 }),
              })
              .setTitle(`🤫 Nueva Confesión`)
              .setDescription(`\`\`\`yml\n${text}\`\`\``)
              /* .setColor(process.env.COLOR) */
              .setFooter({
                text: `Powered by manucatun`,
                iconURL: `https://static.independent.co.uk/2023/04/10/12/GettyImages-1399738189.jpg?width=1200&height=1200&fit=crop`,
              })
              .setTimestamp(),
          ],
        });
      } else {
        return modalInteraction.editReply({
          content: `> <:warning:1279144320062066748> **No es un valor válido para definir una confesión anónima.**`,
          ephemeral: true,
        });
      }

      modalInteraction.editReply({
        content: `> <:newmember:1279138879349456916> **¡Tu confesión se creó correctamente!**`,
      });
    } catch (e) {
      if (e.code === "InteractionCollectorError") {
        return;
      } else if (e instanceof DiscordAPIError && e.code === 10008) {
        console.log(e);
      } else {
        console.log(e);
        modalInteraction.editReply({
          content: `> <:error:1279142677308248238> **¡Ocurrió un error al intentar ejecutar el comando!**`,
          ephemeral: true,
        });
      }
    }
  },
};
