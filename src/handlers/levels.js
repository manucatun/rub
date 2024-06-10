const setupSchema = require("../models/setup");
const ecoSchema = require("../models/economy");
const { asegurarTodo } = require("../structures/Functions");
const Levels = require("discord-xp");
Levels.setURL(process.env.MONGODB);

module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    const { guild, author, channel } = message;

    try {
      /* Comprobaciones */
      if (!guild || !author || !channel || author.bot) {
        return;
      }

      const data = await setupSchema.findOne({ guildID: guild.id });

      const canal = guild.channels.cache.get(data.levels.channel);
      if (!data || !data.levels || !canal) {
        return;
      }
      /* Comprobaciones */

      const xp = Math.floor(Math.random() * 30) + 1;
      const aumento = await Levels.appendXp(author.id, guild.id, xp);
      const usuario = await Levels.fetch(author.id, guild.id);

      /* Enlazado al sistema de economía */
      const dataEco = await ecoSchema.findOne({
        guildID: guild.id,
        userID: author.id,
      });

      if (!dataEco) {
        if (aumento) {
          await canal.send(
            `> 🏆 ¡{usuario} has subido al **nivel {nivel}**! \nUtiliza el comando </balance:1240440501518336172> para crear una cuenta de economía y ganar dinero al subir de nivel.`
              .replace(/{usuario}/, author)
              .replace(/{nivel}/, usuario.level)
          );
        }
        return;
      } else {
        const recompensa = Math.floor(data.levels.coins * usuario.level);

        const msg = data.levels.message
          .replace(/{usuario}/, author)
          .replace(/{nivel}/, usuario.level)
          .replace(/{recompensa}/, recompensa.toLocaleString());

        if (aumento) {
          await canal.send(msg).then(async () => {
            await ecoSchema.findOneAndUpdate(
              { guildID: guild.id, userID: author.id },
              {
                $inc: {
                  cash: recompensa,
                },
              }
            );
          });
        }
      }
      /* Enlazado al sistema de economía */
    } catch (e) {
      console.log(e);
    }
  });
};
