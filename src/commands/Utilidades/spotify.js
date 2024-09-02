const {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
} = require("discord.js");
const canvafy = require("canvafy");
const moment = require("moment");
const { getAverageColor } = require("fast-average-color-node");
const { spotifyApi } = require("../../events/client/ready");
module.exports = {
  CMD: new SlashCommandBuilder()
    .setDescription("🎶 Muestra la actividad en Spotify de un usuario")
    .addSubcommand((sub) =>
      sub
        .setName("track")
        .setDescription(
          "Observa la información sobre la canción que está sonando"
        )
        .addUserOption((option) =>
          option
            .setName("usuario")
            .setDescription("¿De qué usuario quieres ver la información?")
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("album")
        .setDescription(
          "Observa la información sobre el álbum de la canción que está sonando"
        )
        .addUserOption((option) =>
          option
            .setName("usuario")
            .setDescription("¿De qué usuario quieres ver la información?")
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("artist")
        .setDescription(
          "Observa la información sobre el autor de la canción que está sonando"
        )
        .addUserOption((option) =>
          option
            .setName("usuario")
            .setDescription("¿De qué usuario quieres ver la información?")
        )
    ),

  async execute(client, interaction, prefix) {
    const { options, guild, user, member } = interaction;

    try {
      /* Encontrar Actividad */
      let actividad = member.presence;
      if (!actividad) {
        return interaction.reply({
          content: `> <:cross:1279140540901888060> **El usuario no se encuentra escuchando Spotify en este momento.**`,
          ephemeral: true,
        });
      }

      actividad = actividad.activities.filter(
        (x) => x.name === "Spotify" && x.details
      );
      if (!actividad.length) {
        return interaction.reply({
          content: `> <:cross:1279140540901888060> **El usuario no se encuentra escuchando Spotify en este momento.**`,
          ephemeral: true,
        });
      }

      actividad = actividad[0];
      /* Encontrar Actividad */

      await interaction.deferReply();

      switch (options.getSubcommand()) {
        case "track":
          {
            const data = await spotifyApi.getTrack(actividad.syncId);

            const track = data.body;

            /* DATA */
            const nombre = track.name;
            const artistas = track.artists.map((a) => {
              return { name: a.name, url: a.external_urls.spotify };
            });
            const url = track.external_urls.spotify;
            const lanzamiento = Math.floor(
              new Date(track.album.release_date).getTime() / 1000
            );
            const img = track.album.images[0]?.url;
            const album =
              track.album.album_type === "album" || track.album.total_tracks > 2
                ? `[${track.album.name}](${track.album.external_urls.spotify})`
                : "Sencillo";
            const minutos = Math.floor(track.duration_ms / 60000);
            const segundos = Math.floor((track.duration_ms % 60000) / 1000);
            const now = moment();
            const startTime = moment(actividad.timestamps.start);
            const playbackTime = now.diff(startTime);
            const color = await getAverageColor(img);
            /* DATA */

            /* GENERAR IMAGEN */
            const imagen = await new canvafy.Spotify()
              .setAuthor(artistas.map((a) => `${a.name}`).join(", "))
              .setAlbum(
                `${
                  track.album.album_type === "album" ||
                  track.album.total_tracks > 2
                    ? `${track.album.name}`
                    : "Sencillo"
                }`
              )
              .setTimestamp(playbackTime, track.duration_ms)
              .setImage(img)
              .setTitle(nombre)
              .setBlur(5)
              .setOverlayOpacity(0.7)
              .build();
            /* GENERAR IMAGEN */

            const attachment = new AttachmentBuilder(imagen, {
              name: "spotify_image.png",
            });

            interaction.editReply({
              content: `¡${user} está escuchando [__**${nombre}** de **${artistas[0].name}**__](${url}) en <:spotify:1279145987574595685> **Spotify**!`,
              files: [attachment],
              embeds: [
                new EmbedBuilder()
                  .setAuthor({
                    name: `${member.displayName} está escuchando Spotify`,
                    iconURL: user.avatarURL({ extension: "png", size: 1024 }),
                  })
                  .setTitle(`${nombre}`)
                  .setURL(url)
                  .setThumbnail(img)
                  .setImage(`attachment://${attachment.name}`)
                  .addFields(
                    {
                      name: `🎙 Artista(s)`,
                      value: artistas
                        .map((a) => `[${a.name}](${a.url})`)
                        .join(", "),
                    },
                    {
                      name: `📅 Lanzamiento`,
                      value: `<t:${lanzamiento}:D> • <t:${lanzamiento}:R>`,
                    },
                    {
                      name: `💿 Álbum`,
                      value: `${album}`,
                      inline: true,
                    },
                    {
                      name: `🗣 Popularidad`,
                      value: `${track.popularity}%`,
                      inline: true,
                    },
                    {
                      name: `<:time:1279138439417303161> Duración`,
                      value: `${minutos}:${segundos}`,
                      inline: true,
                    }
                  )
                  .setColor(color.hex),
              ],
            });
          }
          break;

        case "album":
          {
            const song = await spotifyApi.getTrack(actividad.syncId);
            const data = await spotifyApi.getAlbum(song.body.album.id);

            if (
              song.body.album.album_type === "single" &&
              data.body.total_tracks === 1
            ) {
              return interaction.editReply({
                content: `> <:cross:1279140540901888060> **La canción actual no pertenece a un álbum, utiliza el comando </spotify track:1171933755917738065> para ver la información del sencillo.**`,
              });
            }

            const track = data.body;

            /* DATA */
            const nombre = track.name;
            const artistas = track.artists.map((a) => {
              return { name: a.name, url: a.external_urls.spotify };
            });
            const url = track.external_urls.spotify;
            const lanzamiento = Math.floor(
              new Date(track.release_date).getTime() / 1000
            );
            const img = track.images[0]?.url;
            const cancionActual = song.body.track_number;
            const cancionesTotales = track.total_tracks;
            const color = await getAverageColor(img);
            /* DATA */

            /* GENERAR IMAGEN */
            const imagen = await new canvafy.Spotify()
              .setAuthor(artistas.map((a) => `${a.name}`).join(", "))
              .setAlbum(`Álbum`)
              .setTimestamp(
                Math.floor(cancionActual * 60000),
                Math.floor(cancionesTotales * 60000)
              )
              .setImage(img)
              .setTitle(nombre)
              .setBlur(5)
              .setOverlayOpacity(0.7)
              .build();
            /* GENERAR IMAGEN */

            const attachment = new AttachmentBuilder(imagen, {
              name: "spotify_image.png",
            });

            interaction.editReply({
              content: `¡${user} está escuchando el álbum [__**${nombre}** de **${artistas[0].name}**__](${url}) en <:spotify:1279145987574595685> **Spotify**!`,
              files: [attachment],
              embeds: [
                new EmbedBuilder()
                  .setAuthor({
                    name: `${member.displayName} está escuchando Spotify`,
                    iconURL: user.avatarURL({ extension: "png", size: 1024 }),
                  })
                  .setTitle(`${nombre}`)
                  .setURL(url)
                  .setThumbnail(img)
                  .setImage(`attachment://${attachment.name}`)
                  .addFields(
                    {
                      name: `🎙 Artista(s)`,
                      value: artistas
                        .map((a) => `[${a.name}](${a.url})`)
                        .join(", "),
                    },
                    {
                      name: `📅 Lanzamiento`,
                      value: `<t:${lanzamiento}:D> • <t:${lanzamiento}:R>`,
                    },
                    {
                      name: `💿 Cantidad de Canciones`,
                      value: `${cancionesTotales}`,
                      inline: true,
                    },
                    {
                      name: `🔊 Canción Actual`,
                      value: `[${song.body.name}](${song.body.external_urls.spotify})`,
                      inline: true,
                    },
                    {
                      name: `🗣 Popularidad`,
                      value: `${track.popularity}%`,
                      inline: true,
                    },
                    {
                      name: `💽 Sello Discográfico`,
                      value: `${track.label}`,
                    }
                  )
                  .setColor(color.hex),
              ],
            });
          }
          break;

        case "artist": {
          try {
            const song = await spotifyApi.getTrack(actividad.syncId);
            const data = await spotifyApi.getArtist(song.body.artists[0].id);
            const songs = await spotifyApi.getArtistTopTracks(
              song.body.artists[0].id
            );

            const track = data.body;

            /* DATA */
            const nombre = track.name;
            const url = track.external_urls.spotify;
            const seguidores = track.followers.total;
            const img = track.images[0]?.url;
            const cancionActual = song.body.name;
            const generos = track.genres
              .slice(0, 3)
              .map((genre) => genre.charAt(0).toUpperCase() + genre.slice(1))
              .join(", ");
            const cancionesPopulares = songs.body.tracks
              .slice(0, 3)
              .map((track, index) => {
                return `\`${index + 1}\` [${track.name}](${
                  track.external_urls.spotify
              }) • (${track.popularity}%)`;
              })
              .filter((track) => track.trim() != "")
              .join("\n");
            const color = await getAverageColor(img);
            const now = moment();
            const startTime = moment(actividad.timestamps.start);
            const playbackTime = now.diff(startTime);
            /* DATA */

            /* GENERAR IMAGEN */
            const imagen = await new canvafy.Spotify()
              .setAuthor(`Artista`)
              .setAlbum(`${seguidores.toLocaleString()} seguidores`)
              .setTimestamp(playbackTime, song.body.duration_ms)
              .setImage(img)
              .setTitle(nombre)
              .setBlur(5)
              .setOverlayOpacity(0.7)
              .build();
            /* GENERAR IMAGEN */

            const attachment = new AttachmentBuilder(imagen, {
              name: "spotify_image.png",
            });

            interaction.editReply({
              content: `¡${user} está escuchando a [__**${nombre}**__](${url}) en <:spotify:1279145987574595685> **Spotify**!`,
              files: [attachment],
              embeds: [
                new EmbedBuilder()
                  .setAuthor({
                    name: `${member.displayName} está escuchando Spotify`,
                    iconURL: user.avatarURL({ extension: "png", size: 1024 }),
                  })
                  .setTitle(`${nombre}`)
                  .setURL(url)
                  .setThumbnail(img)
                  .setImage(`attachment://${attachment.name}`)
                  .addFields(
                    {
                      name: `<:members:1279140407720022148> Cantidad de Seguidores`,
                      value: `${seguidores.toLocaleString()}`,
                      inline: true,
                    },
                    {
                      name: `🔊 Canción Actual`,
                      value: `[${cancionActual}](${song.body.external_urls.spotify})`,
                      inline: true,
                    },
                    {
                      name: `🗣 Popularidad`,
                      value: `${track.popularity}%`,
                      inline: true,
                    },
                    {
                      name: `💽 Géneros Realizados`,
                      value: `${generos}`,
                    },
                    {
                      name: `🎼 Canciones Populares`,
                      value: `${cancionesPopulares}`,
                    }
                  )
                  .setColor(color.hex),
              ],
            });
          } catch (e) {
            interaction.editReply({
              content: `> <:warning:1279144320062066748> **No fue posible obtener información sobre este artista.**`,
              ephemeral: true,
            });
          }
        }
      }
    } catch (e) {
      console.log(e);
      interaction.editReply({
        content: `> <:error:1279142677308248238> **¡Ocurrió un error al intentar ejecutar el comando!**`,
        ephemeral: true,
      });
    }
  },
};
