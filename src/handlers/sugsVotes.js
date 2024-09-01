const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { asegurarTodo, formatoResultados } = require("../structures/Functions");
const sugSchema = require("../models/suggestion");
const setupSchema = require("../models/setup");

module.exports = (client) => {
  client.on("interactionCreate", async (interaction) => {
    const { guild, message, user, member, channel, customId } = interaction;
    try {
      /* Comprobaciones */
      if (!guild || !channel || !message || !user) return;

      await asegurarTodo(guild.id, user.id);

      const setupData = await setupSchema.findOne({ guildID: guild.id });
      const msgData = await sugSchema.findOne({ messageID: message.id });
      if (
        !msgData ||
        !setupData ||
        !setupData.suggestions ||
        channel.id !== setupData.suggestions
      )
        return;
      /* Comprobaciones */

      const targetMessage = await channel.messages.fetch(msgData.messageID);
      const targetEmbed = await targetMessage.embeds[0];

      switch (customId) {
        case "aprobar":
          {
            /* Comprobaciones */
            if (
              !interaction.member.permissions.has(
                PermissionFlagsBits.ManageMessages
              )
            )
              return interaction.reply({
                content: `> <:cross:1279140540901888060> **No tienes permisos para utilizar este botón.**`,
                ephemeral: true,
              });

            if (msgData.status === "approved")
              return interaction.reply({
                content: `> <:management:1279139587448504460> **Esta sugerencia ya está aprobada.**`,
                ephemeral: true,
              });
            /* Comprobaciones */

            /* Si fue rechazada */
            if (msgData.status === "rejected") {
              if (
                !interaction.member.permissions.has(
                  PermissionFlagsBits.Administrator
                )
              )
                return interaction.reply({
                  content: `> <:cross:1279140540901888060> **Solo los Administradores pueden cambiar el estado de una sugerencia ya rechazada.**`,
                  ephemeral: true,
                });

              targetEmbed.data.color = 0xffff00;
              targetEmbed.fields[0].value = `<:notification:1279143649300451419> \`Pendiente\``;

              targetMessage.edit({
                embeds: [targetEmbed],
              });

              msgData.status = "pending";
              await msgData.save().then(() => {
                console.log(
                  `〔📂〕Actualizando: Estado de Sugerencia. (PENDIENTE) (En ${guild.id} de ${user.id})`
                    .brightMagenta.bold
                );
              });

              await interaction.deferUpdate();
              return;
            }
            /* Si fue rechazada */

            /* Editar Embed */
            targetEmbed.data.color = 0x57f287;
            targetEmbed.fields[0].value = `<:check:1279140507867418859> \`Aprobada\``;

            targetMessage.edit({
              embeds: [targetEmbed],
            });

            msgData.status = "approved";
            await msgData.save().then(() => {
              console.log(
                `〔📂〕Actualizando: Estado de Sugerencia. (APROBADA) (En ${guild.id} de ${user.id})`
                  .brightMagenta.bold
              );
            });
            /* Editar Embed */

            await interaction.deferUpdate();
          }
          break;

        case "denegar":
          {
            /* Comprobaciones */
            if (
              !interaction.member.permissions.has(
                PermissionFlagsBits.ManageMessages
              )
            )
              return interaction.reply({
                content: `> <:cross:1279140540901888060> **No tienes permisos para utilizar este botón.**`,
                ephemeral: true,
              });

            if (msgData.status === "rejected")
              return interaction.reply({
                content: `> <:management:1279139587448504460> **Esta sugerencia ya está rechazada.**`,
                ephemeral: true,
              });
            /* Comprobaciones */

            /* Si fue aprobada */
            if (msgData.status === "approved") {
              if (
                !interaction.member.permissions.has(
                  PermissionFlagsBits.Administrator
                )
              )
                return interaction.reply({
                  content: `> <:cross:1279140540901888060> **Solo los Administradores pueden cambiar el estado de una sugerencia ya aprobada.**`,
                  ephemeral: true,
                });

              targetEmbed.data.color = 0xffff00;
              targetEmbed.fields[0].value = `<:notification:1279143649300451419> \`Pendiente\``;

              targetMessage.edit({
                embeds: [targetEmbed],
              });

              msgData.status = "pending";
              await msgData.save().then(() => {
                console.log(
                  `〔📂〕Actualizando: Estado de Sugerencia. (PENDIENTE) (En ${guild.id} de ${user.id})`
                    .brightMagenta.bold
                );
              });

              await interaction.deferUpdate();
              return;
            }
            /* Si fue aprobada */

            /* Editar Embed */
            targetEmbed.data.color = 0xed4245;
            targetEmbed.fields[0].value = `<:cross:1279140540901888060> \`Rechazada\``;

            targetMessage.edit({
              embeds: [targetEmbed],
            });

            msgData.status = "rejected";
            await msgData.save().then(() => {
              console.log(
                `〔📂〕Actualizando: Estado de Sugerencia. (RECHAZADA) (En ${guild.id} de ${user.id})`
                  .brightMagenta.bold
              );
            });
            /* Editar Embed */

            await interaction.deferUpdate();
          }
          break;

        case "votarSi":
          {
            /* Comprobaciones */
            if (msgData.voteYes.includes(user.id))
              return interaction.reply({
                content: `> <:warning:1279144320062066748> **Ya has votado a favor.**`,
                ephemeral: true,
              });
            /* Comprobaciones */

            /* Si Votó en Contra */
            if (msgData.voteNo.includes(user.id))
              msgData.voteNo.splice(msgData.voteNo.indexOf(user.id), 1);
            /* Si Votó en Contra */

            msgData.voteYes.push(user.id);
            await msgData.save();

            /* Editar Embed */
            targetEmbed.fields[1].value = formatoResultados(
              msgData.voteYes,
              msgData.voteNo
            );

            targetMessage.edit({ embeds: [targetEmbed] });
            /* Editar Embed */

            await interaction.deferUpdate();
          }
          break;

        case "votarNo":
          {
            /* Comprobaciones */
            if (msgData.voteNo.includes(user.id))
              return interaction.reply({
                content: `> <:warning:1279144320062066748> **Ya has votado en contra. **`,
                ephemeral: true,
              });
            /* Comprobaciones */

            /* Si Votó en Contra */
            if (msgData.voteYes.includes(user.id))
              msgData.voteYes.splice(msgData.voteYes.indexOf(user.id), 1);
            /* Si Votó en Contra */

            msgData.voteNo.push(user.id);
            await msgData.save();

            /* Editar Embed */
            targetEmbed.fields[1].value = formatoResultados(
              msgData.voteYes,
              msgData.voteNo
            );

            targetMessage.edit({ embeds: [targetEmbed] });
            /* Editar Embed */

            await interaction.deferUpdate();
          }
          break;

        case "quienVota":
          {
            await interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setTitle(`¿Quién ha votado`)
                  .addFields(
                    {
                      name: `<:check:1279140507867418859> Votos positivos`,
                      value:
                        msgData.voteYes.length >= 1
                          ? msgData.voteYes
                              .map(
                                (u, index) => `\`${index + 1}\` • <@!${u}>\n`
                              )
                              .join("")
                              .toString()
                          : "Sin votos.",
                      inline: true,
                    },
                    {
                      name: `<:cross:1279140540901888060> Votos negativos`,
                      value:
                        msgData.voteNo.length >= 1
                          ? msgData.voteNo
                              .map(
                                (u, index) => `\`${index + 1}\` • <@!${u}>\n`
                              )
                              .join("")
                              .toString()
                          : "Sin votos.",
                      inline: true,
                    }
                  )
                  /* .setColor(process.env.COLOR) */,
              ],
              ephemeral: true,
            });
          }
          break;
      }
    } catch (e) {
      console.log(e);
      await interaction.reply({
        content: `> <:error:1279142677308248238> **¡Ocurrió un error al intentar ejecutar el comando!**`,
        ephemeral: true,
      });
    }
  });
};
