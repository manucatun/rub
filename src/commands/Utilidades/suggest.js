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
const {
  asegurarTodo,
  formatoResultados,
} = require("../../structures/Functions");
const setupSchema = require("../../models/setup");
const sugSchema = require("../../models/suggestion");
module.exports = {
  CMD: new SlashCommandBuilder().setDescription(
    "💡 Sugiere una idea para mejorar el servidor"
  ),

  async execute(client, interaction) {
    const { guild, user, member, channel } = interaction;

    /* Comprobaciones */
    if (!guild || !channel) return;

    await asegurarTodo(guild.id);
    const data = await setupSchema.findOne({ guildID: guild.id });

    if (
      !data ||
      !data.suggestions ||
      !guild.channels.cache.get(data.suggestions)
    )
      return interaction.reply({
        content: `> <:management:1198448111547318282> **No se ha establecido un canal para enviar sugerencias en el servidor.**`,
        ephemeral: true,
      });

    const canal = guild.channels.cache.get(data.suggestions);
    if (!canal)
      return interaction.reply({
        content: `> <:management:1198448111547318282> **No se ha establecido un canal para enviar sugerencias en el servidor.**`,
        ephemeral: true,
      });
    /* Comprobaciones */

    /* Crear Modal */
    const modal = new ModalBuilder()
      .setTitle(`💡 ¡Crea una nueva sugerencia!`)
      .setCustomId(`sug-${user.username}`);

    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId(`sugText`)
          .setLabel(`¿Qué quieres sugerir?`)
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
          .setMaxLength(150)
          .setMinLength(10)
          .setPlaceholder(`Sugiero que...`)
      )
    );
    /* Crear Modal */

    let modalInteraction;

    try {
      modalInteraction = await interaction.showModal(modal);

      modalInteraction = await interaction.awaitModalSubmit({
        filter: (i) => i.customId === `sug-${user.username}`,
        time: 180e3,
      });

      await modalInteraction.deferReply({ ephemeral: true });

      const text = modalInteraction.fields.getTextInputValue("sugText");

      const sugMsg = await canal.send({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: member.displayName,
              iconURL: user.avatarURL({ extension: "png", size: 1024 }),
            })
            .setDescription(`\`\`\`yml\n${text}\`\`\``)
            .addFields(
              {
                name: `Estado`,
                value: `<:noti:1198447092155297802> \`Pendiente\``,
              },
              { name: `Votos`, value: formatoResultados() }
            )
            .setFooter({
              text: `Powered by manucatun`,
              iconURL: `https://static.independent.co.uk/2023/04/10/12/GettyImages-1399738189.jpg?width=1200&height=1200&fit=crop`,
            })
            .setCOLOR("Yellow")
            .setTimestamp(),
        ],
        components: [
          new ActionRowBuilder().addComponents([
            new ButtonBuilder()
              .setEmoji("👍🏼")
              .setCustomId("votarSi")
              .setStyle("Success"),
            new ButtonBuilder()
              .setEmoji("👎🏼")
              .setCustomId("votarNo")
              .setStyle("Danger"),
            new ButtonBuilder()
              .setEmoji("❓")
              .setLabel("¿Quién ha votado?")
              .setCustomId("quienVota")
              .setStyle("Primary"),
          ]),
          new ActionRowBuilder().addComponents([
            new ButtonBuilder()
              .setEmoji("1198446878258385026")
              .setCustomId("aprobar")
              .setStyle("Secondary"),
            new ButtonBuilder()
              .setEmoji("1198446838819328050")
              .setCustomId("denegar")
              .setStyle("Secondary"),
          ]),
        ],
      });

      const newSug = new sugSchema({
        messageID: sugMsg.id,
        author: user.id,
      });
      await newSug.save().then(() => {
        console.log(
          `〔💾〕Guardando: Nueva Sugerencia. (En ${guild.id} de ${user.id})`
            .brightCyan.bold
        );
      });

      modalInteraction.editReply({
        content: `> <:new:1198448546207248606> **¡Tu sugerencia se creó correctamente!**`,
      });
    } catch (e) {
      if (e.code === "InteractionCollectorError") {
        return;
      } else if (e instanceof DiscordAPIError && e.code === 10008) {
        console.log(e);
      } else {
        console.log(e);
        modalInteraction.editReply({
          content: `> <:warning:1198447554497618010> **¡Ocurrió un error al intentar ejecutar el comando!**`,
          ephemeral: true,
        });
      }
    }
  },
};
