const { EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require("discord.js");
const setupSchema = require("../models/setup");
const warningsSchema = require("../models/warning");
const ecoSchema = require("../models/economy");
module.exports = {
  asegurarTodo,
  formatoResultados,
  paginacion,
};

/* Data Save */
async function asegurarTodo(guildid, userid) {
  if (guildid) {
    try {
      let setupData = await setupSchema.findOne({ guildID: guildid });
      if (!setupData) {
        console.log(
          `〔💾〕Guardando Nuevo: Configuración del Servidor. (${guildid})`
            .brightCyan.bold
        );
        setupData = await new setupSchema({
          guildID: guildid,
        });
        await setupData.save();
      }
    } catch (e) {
      console.log(`〔💥〕ERROR AL GUARDAR EL SCHEMA`.bgRed);
      console.log(e);
    }
  }

  if (userid && guildid) {
    try {
      let warningsData = await warningsSchema.findOne({
        guildID: guildid,
        userID: userid,
      });
      if (!warningsData) {
        console.log(
          `〔💾〕Guardando: Advertencias del Usuario. (En ${guildid} de ${userid})`
            .brightCyan.bold
        );
        warningsData = await new warningsSchema({
          guildID: guildid,
          userID: userid,
        });
        await warningsData.save();
      }

      let ecoData = await ecoSchema.findOne({
        guildID: guildid,
        userID: userid,
      });
      if (!ecoData) {
        console.log(
          `〔💾〕Guardando: Economía del Usuario. (En ${guildid} de ${userid})`
            .brightCyan.bold
        );
        ecoData = await new ecoSchema({
          guildID: guildid,
          userID: userid,
        });
        await ecoData.save();
      }
    } catch (e) {
      console.log(`〔💥〕ERROR AL GUARDAR EL SCHEMA`.bgRed);
      console.log(e);
    }
  }
}
/* Data Save */

/* Format Results */
const pb = {
  le: "<:izqV:1203897842712977518>",
  me: "<:medV:1203897931359322122>",
  re: "<:derV:1203897987453952020>",
  lf: "<:izdR:1203898046803484752>",
  mf: "<:medR:1203898128298811402>",
  rf: "<:derR:1203898184196169788>",
};

function formatoResultados(upVotes = [], downVotes = []) {
  const votosTotales = upVotes.length + downVotes.length;
  const tamañoBarra = 14;
  const barraLlena =
    Math.round((upVotes.length / votosTotales) * tamañoBarra) || 0;
  const barraVacia = tamañoBarra - barraLlena || 0;

  if (!barraLlena && !barraVacia) {
    barraVacia = tamañoBarra;
  }

  const porcentajeSi = (upVotes.length / votosTotales) * 100 || 0;
  const porcentajeNo = (downVotes.length / votosTotales) * 100 || 0;

  const barra =
    (barraLlena ? pb.lf : pb.le) +
    (pb.mf.repeat(barraLlena) + pb.me.repeat(barraVacia)) +
    (barraLlena === tamañoBarra ? pb.rf : pb.re);

  const resultados = [];

  resultados.push(
    `<:yes:1198446878258385026> \`${
      upVotes.length
    } votos positivos (${porcentajeSi.toFixed(
      1
    )}%)\` • <:no:1198446838819328050> \`${
      downVotes.length
    } votos negativos (${porcentajeNo.toFixed(1)}%)\``
  );
  resultados.push(barra);

  return resultados.join("\n");
}
/* Format Results */

/* Paginación */
async function paginacion(
  client,
  interaction,
  text,
  title = "PAGINACIÓN",
  elements = 5
) {
  var embeds = [];
  const div = elements;
  for (let i = 0; i < text.length; i += div) {
    const desc = text.slice(i, elements);
    elements += div;

    /* Crear Embed */
    let embed = new EmbedBuilder()
      .setTitle(title.toString())
      .setDescription(desc.join(" "))
      .setCOLOR(process.env.COLOR);

    embeds.push(embed);
    /* Crear Embed */
  }

  let pagActual = 0;

  /* Enviar Embeds */
  if (embeds.length === 1) {
    return interaction.reply({ embeds: [embeds[0]] }).catch(() => {});
  }

  const bAtras = new ButtonBuilder()
    .setStyle("Primary")
    .setCustomId("atras")
    .setEmoji("993720768598904974")
    .setLabel("Anterior");
  const bInicio = new ButtonBuilder()
    .setStyle("Success")
    .setCustomId("inicio")
    .setEmoji("🏡")
    .setLabel("Inicio");
  const bAdelante = new ButtonBuilder()
    .setStyle("Primary")
    .setCustomId("adelante")
    .setEmoji("993720745848999936")
    .setLabel("Siguiente");

  let embedPag = await interaction.reply({
    content: `> <:management:1198448111547318282> **Utiliza los botones para cambiar de página.**`,
    embeds: [
      embeds[0].setFooter({
        text: `Página ${pagActual + 1} / ${embeds.length}`,
      }),
    ],
    components: [
      new ActionRowBuilder().addComponents([bAtras, bInicio, bAdelante]),
    ],
  });
  /* Enviar Embeds */

  /* Colector */
  const collector = embedPag.createMessageComponentCollector({
    filter: (i) =>
      i?.isButton() &&
      i?.user &&
      i?.user.id === interaction.user.id &&
      i?.message.author.id === client.user.id,
    time: 180e3,
  });

  collector.on("collect", async (button) => {
    if (button?.user.id !== interaction.user.id) {
      return button?.reply({
        content: `> <:error:1198447011448508466> **Solo la persona que ejecutó el comando puede utilizar los botones.**`,
        ephemeral: true,
      });
    }

    switch (button?.customId) {
      case "atras":
        {
          collector.resetTimer();

          if (pagActual !== 0) {
            pagActual -= 1;

            await embedPag
              .edit({
                embeds: [
                  embeds[pagActual].setFooter({
                    text: `Página ${pagActual + 1} / ${embeds.length}`,
                  }),
                ],
              })
              .catch(() => {});

            await button?.deferUpdate();
          } else {
            pagActual = embeds.length - 1;

            await embedPag
              .edit({
                embeds: [
                  embeds[pagActual].setFooter({
                    text: `Página ${pagActual + 1} / ${embeds.length}`,
                  }),
                ],
              })
              .catch(() => {});

            await button?.deferUpdate();
          }
        }
        break;

      case "inicio":
        {
          collector.resetTimer();
          pagActual = 0;

          await embedPag
            .edit({
              embeds: [
                embeds[pagActual].setFooter({
                  text: `Página ${pagActual + 1} / ${embeds.length}`,
                }),
              ],
            })
            .catch(() => {});

          await button?.deferUpdate();
        }
        break;

      case "adelante":
        {
          collector.resetTimer();

          if (pagActual < embeds.length - 1) {
            pagActual++;

            await embedPag
              .edit({
                embeds: [
                  embeds[pagActual].setFooter({
                    text: `Página ${pagActual + 1} / ${embeds.length}`,
                  }),
                ],
              })
              .catch(() => {});

            await button?.deferUpdate();
          } else {
            pagActual = 0;

            await embedPag
              .edit({
                embeds: [
                  embeds[pagActual].setFooter({
                    text: `Página ${pagActual + 1} / ${embeds.length}`,
                  }),
                ],
              })
              .catch(() => {});

            await button?.deferUpdate();
          }
        }
        break;

      default:
        break;
    }
  });

  collector.on("end", () => {
    embedPag.components[0].components.map((b) => (b.disabled = true));
  });
  /* Colector */
}
/* Paginación */
