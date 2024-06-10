const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const ms = require("ms");
module.exports = {
  CMD: new SlashCommandBuilder()
    .setDescription("🎁 Sistema de Sorteos")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
    .addSubcommand((sub) =>
      sub
        .setName("create")
        .setDescription("🎁 Crea un nuevo sorteo")
        .addStringOption((option) =>
          option
            .setName("premio")
            .setDescription("¿Qué ganará el usuario?")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("duración")
            .setDescription("¿Cuánto durará el sorteo?")
            .setRequired(true)
        )
        .addNumberOption((option) =>
          option
            .setName("ganadores")
            .setDescription("¿Cuántas personas podrán ganar el sorteo?")
        )
        .addChannelOption((option) =>
          option
            .setName("canal")
            .setDescription("¿En qué canal se ejecutará el sorteo?")
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("reroll")
        .setDescription("🎁 Vuelve a elegir al ganador de un sorteo")
        .addStringOption((option) =>
          option
            .setName("id")
            .setDescription(
              "¿Qué Id tiene el sorteo que deseas volver a jugar?"
            )
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("end")
        .setDescription("🎁 Finaliza un sorteo activo")
        .addStringOption((option) =>
          option
            .setName("id")
            .setDescription("¿Qué Id tiene el sorteo que deseas finalizar?")
            .setRequired(true)
        )
    ),

  async execute(client, interaction) {
    try {
      const { options, user, member, channel } = interaction;

      switch (options.getSubcommand()) {
        case "create":
          {
            const premio = options.getString("premio");
            const duración = options.getString("duración");
            const duraciónMs = ms(duración);
            const ganadores = options.getNumber("ganadores") || 1;
            const canal = options.getChannel("canal") || channel;

            /* Comprobaciones */
            if (!ganadores || ganadores < 0 || ganadores % 1 != 0) {
              return interaction.reply({
                content: `> <:error:1198447011448508466> **La cantidad de ganadores no es válida.**`,
                ephemeral: true,
              });
            }

            if (!duraciónMs || duraciónMs < 0 || duraciónMs % 1 != 0) {
              return interaction.reply({
                content: `> <:error:1198447011448508466> **La duración del sorteo no es válida.**`,
                ephemeral: true,
              });
            }
            /* Comprobaciones */

            client.giveawaysManager
              .start(canal, {
                duration: duraciónMs,
                winnerCount: Number(ganadores),
                prize: premio,
                hostedBy: user,
                messages: {
                  giveaway:
                    "<:event:1198447473346236506> **NUEVO SORTEO** <:event:1198447473346236506>",
                  giveawayEnded:
                    "<:event:1198447473346236506> **SORTEO FINALIZADO** <:event:1198447473346236506>",
                  inviteToParticipate:
                    "**¡Reacciona con <:event:1198447473346236506> para participar!**",
                  winMessage:
                    "> <:event:1198447473346236506> ¡Felicidades {winners}! Por ganar **{this.prize}**.",
                  winners: "**Ganador(es):**",
                  hostedBy: "**Iniciado por:** {this.hostedBy}",
                  endedAt: "Finalizado el:",
                  drawing:
                    "**Finaliza:** <t:{Math.round(this.endAt / 1000)}:R>",
                  noWinner: "> **No se ha encontrado a un ganador válido.**",
                },
              })
              .then(() => {
                return interaction.reply({
                  content: `> <:new:1198448546207248606> **El sorteo se creó correctamente en ${canal}.**`,
                  ephemeral: true,
                });
              });
          }
          break;

        case "reroll":
          {
            const id = options.getString("id");
            if (!id || id < 0 || id % 1 != 0) {
              return interaction.reply({
                content: `> <:error:1198447011448508466> **La Id no es válida.**`,
                ephemeral: true,
              });
            }

            await client.giveawaysManager
              .reroll(id, {
                messages: {
                  congrat:
                    "> <:event:1198447473346236506> ¡Nuevo(s) ganador(es)! Felicidades {winners}, por ganar **{this.prize}**.",
                  error:
                    "> <:error:1198447011448508466> **No se ha encontrado a un ganador válido.**",
                },
              })
              .then(() => {
                interaction.reply({
                  content: `> <:event:1198447473346236506> **Eligiendo a un nuevo ganador...**`,
                  ephemeral: true,
                });
              })
              .catch(() => {
                interaction.reply({
                  content: `> <:error:1198447011448508466> **No se ha podido elegir a un nuevo ganador.**`,
                  ephemeral: true,
                });
              });
          }
          break;

        case "end":
          {
            const id = options.getString("id");
            if (!id || id < 0 || id % 1 != 0) {
              return interaction.reply({
                content: `> <:error:1198447011448508466> **La Id no es válida.**`,
                ephemeral: true,
              });
            }

            client.giveawaysManager
              .end(id, {
                messages: {
                  congrat:
                    "> <:event:1198447473346236506> ¡Felicidades {winners}! Por ganar **{this.price}**",
                  error: "**No se ha encontrado a un ganador válido.**",
                },
              })
              .then(() => {
                interaction.reply({
                  content: `> <:event:1198447473346236506> **Eligiendo a un ganador...**`,
                  ephemeral: true,
                });
              })
              .catch(() => {
                interaction.reply({
                  content: `> <:error:1198447011448508466> **No se ha podido elegir a un ganador.**`,
                  ephemeral: true,
                });
              });
          }
          break;
      }
    } catch (e) {
      console.log(e);
      interaction.reply({
        content: `> <:warning:1198447554497618010> **¡Ocurrió un error al intentar ejecutar el comando!**`,
        ephemeral: true,
      });
    }
  },
};
