const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  WebhookClient,
} = require("discord.js");
const webhook = new WebhookClient({ url: process.env.WEBHOOK });

module.exports = async (client, guild) => {
  try {
    const owner = await guild.fetchOwner();

    /* Enviar al Servidor */
    await webhook.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("¡Nuevo Servidor!")
          .setColor(process.env.COLOR)
          .setThumbnail(guild.iconURL({ extension: "png", size: 1024 }))
          .setTimestamp()
          .addFields([
            { name: `Nombre`, value: `${guild.name}`, inline: true },
            { name: `ID`, value: `\`${guild.id}\``, inline: true },
            {
              name: `Owner`,
              value: `<@${owner.id}> • \`${owner.id}\``,
            },
            { name: `Miembros`, value: `${guild.memberCount}`, inline: true },
            {
              name: `Creación`,
              value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`,
              inline: true,
            },
            {
              name: `Servidores`,
              value: `${client.guilds.cache.size}`,
              inline: true,
            },
          ]),
      ],
    });
    /* Enviar al Servidor */

    /* Enviar al Dueño del Servidor */
    owner.send({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `Powered by manucatun`,
            iconURL: `https://static.independent.co.uk/2023/04/10/12/GettyImages-1399738189.jpg?width=1200&height=1200&fit=crop`,
          })
          .setTitle(`¡Gracias por invitar a ${client.user.username}!`)
          .setThumbnail(
            client.user.displayAvatarURL({ extension: "png", size: 1024 })
          )
          .setDescription(
            `¡Gracias por apoyar a nuestro proyecto!\nSi necesitas ayuda o tienes alguna pregunta sobre el bot, no dudes en unirte a nuestro servidor de soporte.\n\n¡Esperamos que disfrutes de todas las funciones que el bot tiene para ofrecer en tu servidor!`
          )
          .addFields({ name: `Importante`, value: `Asegúrate de colocar el rol de __${client.user.username}__ en la posición más alta del servidor para garantizar un funcionamiento sin problemas. Evita posibles complicaciones con el bot o sus comandos siguiendo esta recomendación.` })
          .setColor(process.env.COLOR),
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setStyle("Link")
            .setLabel("Soporte")
            .setURL("https://discord.gg/zDvCUrXmcT")
        ),
      ],
    });
    /* Enviar al Dueño del Servidor */
  } catch (e) {
    console.log(
      `〔💥〕Error: No se ha podido enviar el mensaje al dueño del servidor. (${guild.id})`
        .bgRed,
      e
    );
  }
};
