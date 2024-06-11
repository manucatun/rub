const {
  SlashCommandBuilder,
  AttachmentBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const Canvas = require("@napi-rs/canvas");
const moment = require("moment");
const { getAverageCOLOR } = require("fast-average-color-node");
const { Client } = require("genius-lyrics");
const geniusClient = new Client(
  "47XVh9RXZwamYGOVqeYGX0oLkCR1JuwJW2-ckaS4upkn-deF6nYxoj_c4fJ-6vqO"
);
module.exports = {
  CMD: new SlashCommandBuilder()
    .setDescription("🎶 Muestra la actividad de Spotify")
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setDescription("¿De qué usuario quieres ver la información?")
    ),

  async execute(client, interaction) {
    try {
      const miembro =
        interaction.options.getMember("usuario") || interaction.member;

      /* Encontrar Actividad */
      let actividad = await miembro.presence;
      if (!actividad) {
        return interaction.reply({
          content: `> <:error:1198447011448508466> **El usuario no está escuchando Spotify en este momento.**`,
          ephemeral: true,
        });
      }
      actividad = actividad.activities.filter(
        (act) => act.name === "Spotify" && act.details
      );
      if (!actividad.length) {
        return interaction.reply({
          content: `> <:error:1198447011448508466> **El usuario no está escuchando Spotify en este momento.**`,
          ephemeral: true,
        });
      }
      actividad = actividad[0];
      /* Encontrar Actividad */

      await interaction.deferReply();

      /* Crear Menu */
      const menu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("menu")
          .setPlaceholder("🎶 Edita la imagen!")
          .addOptions(
            new StringSelectMenuOptionBuilder()
              .setLabel("VERTICAL - Original")
              .setDescription("La imagen en formato vertical.")
              .setValue("vertical")
              .setEmoji("📒"),
            new StringSelectMenuOptionBuilder()
              .setLabel("HORIZONTAL - Original")
              .setDescription("La imagen en formato horizontal.")
              .setValue("horizontal")
              .setEmoji("📂"),
            new StringSelectMenuOptionBuilder()
              .setLabel("LETRA - [BETA]")
              .setDescription("La imagen con la letra de la canción.")
              .setValue("lyrics")
              .setEmoji("🎶")
          )
      );
      /* Crear Menu */

      let msg = await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: interaction.member.displayName + ` está escuchando Spotify`,
              iconURL: interaction.user.avatarURL({
                extension: "png",
                size: 1024,
              }),
            })
            .setDescription(
              `¡Selecciona una opción del menú para generar la imagen!`
            )
            .addFields(
              { name: `🎶 Canción`, value: `${actividad.details}` },
              { name: `👥 Artista(s)`, value: `${actividad.state}` }
            )
            .setThumbnail(
              `https://i.scdn.co/image/${
                actividad.assets.largeImage.split(":")[1]
              }`
            )
            .setFooter({
              text: `Powered by manucatun`,
              iconURL: `https://static.independent.co.uk/2023/04/10/12/GettyImages-1399738189.jpg?width=1200&height=1200&fit=crop`,
            })
            .setColor(process.env.COLOR)
            .setTimestamp(),
        ],
        components: [menu],
      });

      const collector = msg.createMessageComponentCollector({
        filter: (i) =>
          i.isSelectMenu() && i.user && i.message.author.id == client.user.id,
        time: 180e3,
      });

      collector.on("collect", async (i) => {
        if (i.user.id !== interaction.user.id) {
          return i.reply({
            content: `> <:error:1198447011448508466> **Solo la persona que utilizó el comando puede seleccionar esta opción.**`,
            ephemeral: true,
          });
        }

        /* Valores por Defecto */
        let songImage = actividad.assets.largeImage.split(":")[1];
        songImage = await Canvas.loadImage(
          `https://i.scdn.co/image/${songImage}`
        );

        const botAvatar = await Canvas.loadImage(
          client.user.avatarURL({ format: "png" })
        );

        const spotifyLogo = await Canvas.loadImage(
          `https://cdn.discordapp.com/emojis/1223111980160647198.png`
        );

        const now = moment();
        const startTime = moment(actividad.timestamps.start);
        const duration = moment(actividad.timestamps.end).diff(startTime);
        const playbackTime = now.diff(startTime);
        const playbackTimeFormatted = moment(playbackTime).format("mm:ss");
        const durationFormatted = moment(duration).format("mm:ss");
        const fillBar = (546 / duration) * playbackTime;
        /* Valores por Defecto */

        switch (i.values[0]) {
          case "vertical":
            {
              const file = imgVertical(
                actividad,
                songImage,
                botAvatar,
                spotifyLogo,
                startTime,
                durationFormatted,
                playbackTimeFormatted,
                fillBar
              );

              const fileBuffer = new AttachmentBuilder(file.attachment, {
                name: "spotify.png",
              });

              const targetEmbed = await msg.embeds[0];
              const newEmbed = EmbedBuilder.from(targetEmbed).setImage(
                `attachment://${fileBuffer.name}`
              );

              await i.deferUpdate();

              msg = await msg.edit({
                embeds: [newEmbed],
                files: [fileBuffer],
                disableMentions: { parse: ["users"] },
              });

              await collector.resetTimer();
            }
            break;

          case "lyrics": {
            /* Encontrar Letra */
            const search = await geniusClient.songs.search(
              `${actividad.details} ${actividad.state}`
            );
            if (
              search.length === 0 ||
              actividad.state.split(";")[0].toLowerCase() !==
                search[0].artist.name.split(",")[0].toLowerCase()
            ) {
              return i.reply({
                content: `> <:error:1198447011448508466> **No he podido encontrar la letra de la canción actual.**`,
                ephemeral: true,
              });
            }

            let letra = await search[0].lyrics();
            letra = letra.replace(/\[[^\]]*\]/g, "").replace(/\n\n/g, "\n");
            /* Encontrar Letra */

            /* Crear Modal */
            const modal = new ModalBuilder()
              .setTitle(
                `🎶 Letra de ${search[0].title} • ${
                  search[0].artist.name.split(",")[0]
                }`.substring(0, 45)
              )
              .setCustomId(`lyrics-song`);

            modal.addComponents(
              new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                  .setCustomId(`modalLyrics`)
                  .setLabel(`Selecciona solamente un párrafo`)
                  .setStyle(TextInputStyle.Paragraph)
                  .setRequired(true)
                  .setMaxLength(letra.length)
                  .setMinLength(50)
                  .setValue(
                    letra ? letra : "Introduce la letra de la canción aquí"
                  )
              )
            );

            let resultado;

            try {
              await i.showModal(modal);
              const submittedModal = await i.awaitModalSubmit({
                filter: (interaction) => interaction.customId === `lyrics-song`,
                time: 180e3,
              });

              await submittedModal.deferUpdate({ ephemeral: true });

              resultado =
                submittedModal.fields.getTextInputValue("modalLyrics");
              if (
                resultado.split("\n\n").length > 1 ||
                resultado.split("\n").length > 6
              ) {
                return i.followUp({
                  content: `> <:error:1198447011448508466> **El tamaño máximo debe ser de un solo párrafo o 6 líneas.**`,
                  ephemeral: true,
                });
              }

              console.log(resultado);
            } catch (e) {
              if (e.code === "InteractionCollectorError") {
                return;
              } else if (e instanceof DiscordAPIError && e.code === 10008) {
                return console.log(e);
              } else {
                console.error(e);
                return await submittedModal.editReply({
                  content: `> <:error:1198447011448508466> **Ha ocurrido un error al mostrar la letra de la canción.**`,
                  ephemeral: true,
                });
              }
            }
            /* Crear Modal */

            const file = imgLyrics(
              actividad,
              songImage,
              botAvatar,
              spotifyLogo,
              resultado
            );

            const fileBuffer = new AttachmentBuilder(file.attachment, {
              name: "spotify.png",
            });

            const targetEmbed = await msg.embeds[0];
            const newEmbed = EmbedBuilder.from(targetEmbed).setImage(
              `attachment://${fileBuffer.name}`
            );

            msg = await msg.edit({
              embeds: [newEmbed],
              files: [fileBuffer],
              disableMentions: { parse: ["users"] },
            });

            await collector.resetTimer();
          }
        }
      });
    } catch (e) {
      console.log(e);
      interaction.editReply({
        content: `> <:warning:1198447554497618010> **¡Ocurrió un error al intentar ejecutar el comando!**`,
        ephemeral: true,
      });
    }
  },
};

function imgVertical(
  presence,
  songImage,
  botAvatar,
  spotifyLogo,
  startTime,
  duration,
  playbackTime,
  fillBar
) {
  const canvas = Canvas.createCanvas(858, 1713);
  const context = canvas.getContext("2d");
  const now = moment();

  /* Fondo e Imagen */
  context.filter = "blur(20px)";
  context.drawImage(songImage, -400, 0, 1723, 1723);
  context.filter = "blur(0px)";

  const imageX = (canvas.width - 725) / 2;
  const imageY = (canvas.height - 725) / 2;

  context.drawImage(songImage, imageX, imageY - 40, 725, 725);
  /* Fondo e Imagen */

  /* Cuadro de Texto */
  context.globalAlpha = 0.8;
  const rectWidth = 770;
  const rectHeight = 240;
  const cornerRadius = 25;
  const rectX = (canvas.width - rectWidth) / 2;
  const rectY = imageY + 725 + 50 - 40;

  context.beginPath();
  context.moveTo(rectX + cornerRadius, rectY);
  context.lineTo(rectX + rectWidth - cornerRadius, rectY);
  context.arcTo(
    rectX + rectWidth,
    rectY,
    rectX + rectWidth,
    rectY + cornerRadius,
    cornerRadius
  );
  context.lineTo(rectX + rectWidth, rectY + rectHeight - cornerRadius);
  context.arcTo(
    rectX + rectWidth,
    rectY + rectHeight,
    rectX + rectWidth - cornerRadius,
    rectY + rectHeight,
    cornerRadius
  );
  context.lineTo(rectX + cornerRadius, rectY + rectHeight);
  context.arcTo(
    rectX,
    rectY + rectHeight,
    rectX,
    rectY + rectHeight - cornerRadius,
    cornerRadius
  );
  context.lineTo(rectX, rectY + cornerRadius);
  context.arcTo(rectX, rectY, rectX + cornerRadius, rectY, cornerRadius);
  context.closePath();

  context.fillStyle = "#3b3737";
  context.fill();
  context.globalAlpha = 0.7;
  /* Cuadro de Texto */

  context.shadowCOLOR = "rgba(0, 0, 0, 5)";
  context.shadowBlur = 20;

  /* Nombre */
  context.fillStyle = "#FFFFFF";
  context.font = "42px Arial";
  context.textAlign = "center";
  context.fillText(presence.details, canvas.width / 2, rectY + 76);
  /* Nombre */

  /* Autor */
  context.fillStyle = "#b0b0b0";
  context.font = "35px Arial";
  context.fillText(presence.state, canvas.width / 2, rectY + 126);
  /* Autor */

  context.shadowCOLOR = "transparent";
  context.shadowBlur = 0;

  /* Progreso */
  const progressX = (canvas.width - 546) / 2;
  const progressY = rectY + 176;
  const radio = 10;

  context.fillStyle = "#34332F";
  context.beginPath();
  context.moveTo(progressX + radio, progressY);
  context.lineTo(progressX + 546 - radio, progressY);
  context.arc(
    progressX + 546 - radio,
    progressY + radio,
    radio,
    -Math.PI / 2,
    0
  );
  context.lineTo(progressX + 546, progressY + 20 - radio);
  context.arc(
    progressX + 546 - radio,
    progressY + 20 - radio,
    radio,
    0,
    Math.PI / 2
  );
  context.lineTo(progressX + radio, progressY + 20);
  context.arc(
    progressX + radio,
    progressY + 20 - radio,
    radio,
    Math.PI / 2,
    Math.PI
  );
  context.lineTo(progressX, progressY + radio);
  context.arc(
    progressX + radio,
    progressY + radio,
    radio,
    Math.PI,
    -Math.PI / 2
  );
  context.closePath();
  context.fill();

  context.fillStyle = "#FFFFFF";
  context.beginPath();
  context.moveTo(progressX + radio, progressY);
  context.lineTo(progressX + fillBar - radio, progressY);
  context.arc(
    progressX + fillBar - radio,
    progressY + radio,
    radio,
    -Math.PI / 2,
    0
  );
  context.lineTo(progressX + fillBar, progressY + 20 - radio);
  context.arc(
    progressX + fillBar - radio,
    progressY + 20 - radio,
    radio,
    0,
    Math.PI / 2
  );
  context.lineTo(progressX + radio, progressY + 20);
  context.arc(
    progressX + radio,
    progressY + 20 - radio,
    radio,
    Math.PI / 2,
    Math.PI
  );
  context.lineTo(progressX, progressY + radio);
  context.arc(
    progressX + radio,
    progressY + radio,
    radio,
    Math.PI,
    -Math.PI / 2
  );
  context.closePath();
  context.fill();
  /* Progreso */

  context.shadowCOLOR = "rgba(0, 0, 0, 5)";
  context.shadowBlur = 20;

  /* Duración */
  context.font = "30px Arial";
  const durationTextWidth = context.measureText(duration).width;
  const playbackTimeTextWidth = context.measureText(playbackTime).width;
  const durationX = progressX - durationTextWidth + 19;
  const playbackTimeX = progressX + 601;
  const durationY = progressY + 20;
  context.fillText(playbackTime, durationX, durationY);
  context.fillText(duration, playbackTimeX, durationY);
  /* Duración */

  /* Fecha y Hora */
  context.font = "225px Arial";
  context.fillText(now.format("hh:mm"), 430, 420 - 40);

  context.font = "70px Arial";
  context.fillText(now.locale("es").format("dddd Do, MMMM"), 430, 225 - 40);
  /* Fecha y Hora */

  /* Foto del Spotify logo */
  const spotifyLogoWidth = 90;
  const spotifyLogoHeight = 90;
  const spotifyLogoX = canvas.width - 60 - spotifyLogoWidth;
  const spotifyLogoY = canvas.height - 100 - spotifyLogoHeight / 2;
  context.drawImage(
    spotifyLogo,
    spotifyLogoX,
    spotifyLogoY,
    spotifyLogoWidth,
    spotifyLogoHeight
  );
  /* Foto del Spotify logo */

  const avatarWidth = 90;
  const avatarHeight = 90;
  const avatarX = 60;
  const avatarY = canvas.height - 100 - avatarHeight / 2;

  /* Nombre de usuario del bot */
  context.fillStyle = "#FFFFFF";
  context.font = "40px Arial";
  context.textAlign = "left";
  const text = "Powered by Rub";
  const textWidth = context.measureText(text).width;
  const textX = (canvas.width - textWidth) / 2;
  const textY = avatarY + avatarHeight / 2 + 20 / 2;
  context.fillText(text, textX, textY);
  /* Nombre de usuario del bot */

  /* Foto de perfil del bot */
  context.beginPath();
  context.arc(
    avatarX + avatarWidth / 2,
    avatarY + avatarHeight / 2,
    avatarWidth / 2,
    0,
    Math.PI * 2
  );
  context.closePath();
  context.clip();
  context.drawImage(botAvatar, avatarX, avatarY, avatarWidth, avatarHeight);
  /* Foto de perfil del bot */

  const file = new AttachmentBuilder(canvas.toBuffer("image/png"), {
    name: "spotify.png",
  });

  return file;
}

function imgHorizontal(
  canvas,
  context,
  presence,
  songImage,
  startTime,
  duration,
  playbackTime,
  fillBar
) {}

async function imgLyrics(presence, songImage, botAvatar, spotifyLogo, lyrics) {
  const canvas = Canvas.createCanvas(858, 1713);
  const context = canvas.getContext("2d");

  const color = await getAverageCOLOR(songImage);

  /* Fondo e Imagen */
  context.filter = "blur(20px)";
  context.fillStyle = color.hex;
  context.fillRect(-400, 0, 1723, 1723);
  context.filter = "blur(0px)";

  const imageX = (canvas.width - 725) / 2;
  const imageY = (canvas.height - 725) / 2;

  context.drawImage(songImage, imageX, imageY - 40, 725, 725);
  /* Fondo e Imagen */

  /* Cuadro de Texto */
  context.globalAlpha = 0.8;
  const rectWidth = 770;
  const rectHeight = 240;
  const cornerRadius = 25;
  const rectX = (canvas.width - rectWidth) / 2;
  const rectY = imageY + 725 + 50 - 40;

  context.beginPath();
  context.moveTo(rectX + cornerRadius, rectY);
  context.lineTo(rectX + rectWidth - cornerRadius, rectY);
  context.arcTo(
    rectX + rectWidth,
    rectY,
    rectX + rectWidth,
    rectY + cornerRadius,
    cornerRadius
  );
  context.lineTo(rectX + rectWidth, rectY + rectHeight - cornerRadius);
  context.arcTo(
    rectX + rectWidth,
    rectY + rectHeight,
    rectX + rectWidth - cornerRadius,
    rectY + rectHeight,
    cornerRadius
  );
  context.lineTo(rectX + cornerRadius, rectY + rectHeight);
  context.arcTo(
    rectX,
    rectY + rectHeight,
    rectX,
    rectY + rectHeight - cornerRadius,
    cornerRadius
  );
  context.lineTo(rectX, rectY + cornerRadius);
  context.arcTo(rectX, rectY, rectX + cornerRadius, rectY, cornerRadius);
  context.closePath();

  context.fillStyle = "#3b3737";
  context.fill();
  context.globalAlpha = 0.7;
  /* Cuadro de Texto */

  context.shadowCOLOR = "rgba(0, 0, 0, 5)";
  context.shadowBlur = 20;

  /* Nombre */
  context.fillStyle = "#FFFFFF";
  context.font = "42px Arial";
  context.textAlign = "center";
  context.fillText(presence.details, canvas.width / 2, rectY + 76);
  /* Nombre */

  /* Autor */
  context.fillStyle = "#b0b0b0";
  context.font = "35px Arial";
  context.fillText(presence.state, canvas.width / 2, rectY + 126);
  /* Autor */

  context.shadowCOLOR = "transparent";
  context.shadowBlur = 0;

  context.shadowCOLOR = "rgba(0, 0, 0, 5)";
  context.shadowBlur = 20;

  /* Foto del Spotify logo */
  const spotifyLogoWidth = 90;
  const spotifyLogoHeight = 90;
  const spotifyLogoX = canvas.width - 60 - spotifyLogoWidth;
  const spotifyLogoY = canvas.height - 100 - spotifyLogoHeight / 2;
  context.drawImage(
    spotifyLogo,
    spotifyLogoX,
    spotifyLogoY,
    spotifyLogoWidth,
    spotifyLogoHeight
  );
  /* Foto del Spotify logo */

  const avatarWidth = 90;
  const avatarHeight = 90;
  const avatarX = 60;
  const avatarY = canvas.height - 100 - avatarHeight / 2;

  /* Nombre de usuario del bot */
  context.fillStyle = "#FFFFFF";
  context.font = "40px Arial";
  context.textAlign = "left";
  const text = "Powered by Rub";
  const textWidth = context.measureText(text).width;
  const textX = (canvas.width - textWidth) / 2;
  const textY = avatarY + avatarHeight / 2 + 20 / 2;
  context.fillText(text, textX, textY);
  /* Nombre de usuario del bot */

  /* Foto de perfil del bot */
  context.beginPath();
  context.arc(
    avatarX + avatarWidth / 2,
    avatarY + avatarHeight / 2,
    avatarWidth / 2,
    0,
    Math.PI * 2
  );
  context.closePath();
  context.clip();
  context.drawImage(botAvatar, avatarX, avatarY, avatarWidth, avatarHeight);
  /* Foto de perfil del bot */

  const file = new AttachmentBuilder(canvas.toBuffer("image/png"), {
    name: "spotify.png",
  });

  return file;
}
