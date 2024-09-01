const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const ecoSchema = require("../../models/economy");
const { asegurarTodo } = require("../../structures/Functions");
module.exports = {
  CMD: new SlashCommandBuilder().setDescription(
    "🚜 Obtén monedas realizando trabajos"
  ),

  async execute(client, interaction, prefix) {
    const { user, member, guild } = interaction;

    try {
      await asegurarTodo(guild.id, user.id);

      const data = await ecoSchema.findOne({
        guildID: guild.id,
        userID: user.id,
      });

      /* Variables */
      const tiempoMs = 1 * 45 * 60 * 1000; // Tiempo en horas
      const recompensa = Math.floor(Math.random() * 800) + 200; // Recompensa del trabajo

      const trabajos = [
        "¡Jornada como conductor de tren completada con éxito! Tu habilidad para mantener la puntualidad y la seguridad en las vías ha sido reconocida con un generoso aumento salarial.",
        "¡Turno como enfermera finalizado con excelencia! Tu dedicación y capacidad para brindar cuidados de calidad han sido recompensadas con una merecida promoción.",
        "¡Proyecto de arquitectura terminado con éxito! Tu visión creativa y atención al detalle han sido reconocidas con un aumento significativo en tu salario.",
        "¡Semana como chef completada con maestría! Tu talento culinario y pasión en la cocina han sido celebrados con una oferta para liderar un nuevo restaurante.",
        "¡Día de trabajo como desarrollador de software finalizado con logros! Tu habilidad para resolver problemas y crear soluciones innovadoras ha sido recompensada con una bonificación considerable.",
        "¡Mes de trabajo como gerente de ventas concluido con éxito! Tu capacidad para superar metas y liderar tu equipo ha sido reconocida con un ascenso y un aumento salarial.",
        "¡Jornada como maestra finalizada con brillantez! Tu compromiso con la educación y el bienestar de tus alumnos ha sido valorado con una mejora en tus condiciones laborales.",
        "¡Día de trabajo como bombero completado con valentía! Tu coraje y rápida respuesta en situaciones de emergencia han sido recompensados con una medalla al mérito y un incremento salarial.",
        "¡Semana como diseñador gráfico concluida con creatividad! Tu habilidad para transformar ideas en arte ha sido reconocida con un proyecto destacado y una bonificación especial.",
        "¡Turno como policía finalizado con honor! Tu dedicación y servicio a la comunidad han sido celebrados con una condecoración y un aumento salarial.",
        "¡Jornada como ingeniero finalizada con éxito! Tu habilidad para solucionar problemas complejos y mejorar procesos ha sido recompensada con una promoción y un incremento en tu salario."
    ];
      let trabajo = trabajos[Math.floor(Math.random() * trabajos.length)];

      if (tiempoMs - (Date.now() - data.work) > 0) {
        const tiempoRes = Math.round(
          (Date.now() + (tiempoMs - (Date.now() - data.work))) / 1000
        );

        return await interaction.reply({
          content: `> <:time:1279138439417303161> **Podrás volver a trabajar <t:${tiempoRes}:R>.**`,
          ephemeral: true,
        });
      }
      /* Variables */

      await ecoSchema.findOneAndUpdate(
        { guildID: guild.id, userID: user.id },
        {
          $inc: {
            cash: recompensa,
          },
          work: Date.now(),
        }
      );

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: `Trabajo de ${member.displayName}`,
              iconURL: user.avatarURL({ extension: "png", size: 1024 }),
            })
            .setDescription(
              `💸 ¡Obtuviste una recompensa de <:coin:1279135394918694922> **${recompensa.toLocaleString()} monedas**!\n`
            )
            .addFields({
              name: `Trabajo Realizado`,
              value: `${trabajo}`,
            })
            /* .setColor(process.env.COLOR) */
            .setFooter({
              text: `Powered by manucatun`,
              iconURL: `https://static.independent.co.uk/2023/04/10/12/GettyImages-1399738189.jpg?width=1200&height=1200&fit=crop`,
            }),
        ],
      });
    } catch (e) {
      console.log(e);
      interaction.reply({
        content: `> <:error:1279142677308248238> **¡Ocurrió un error al intentar ejecutar el comando!**`,
        ephemeral: true,
      });
    }
  },
};
