const { GiveawaysManager } = require("discord-giveaways");
const giveawaySchema = require("../models/giveaway");

module.exports = async (client) => {
  try {
    let db = await giveawaySchema.findOne({ ID: "sorteos" });
    if (!db || db === null) {
      db = await new giveawaySchema();
      await db.save();
    }

    /* Crear Constructor */
    class sorteosDB extends GiveawaysManager {
      async getAllGiveaways() {
        let db = await giveawaySchema.findOne({ ID: "sorteos" });
        return db.data;
      }

      async saveGiveaways(messageId, gData) {
        await giveawaySchema.findOneAndUpdate(
          { ID: "sorteos" },
          {
            $push: {
              data: gData,
            },
          }
        );
        return true;
      }

      async editGiveaway(messageId, gData) {
        let db = await giveawaySchema.findOneAndUpdate({ ID: "sorteos" });
        let sorteos = db.data;
        let sorteoIndex = -1;

        sorteos.map((sorteo, index) => {
          if (sorteo.messageId.includes(messageId)) {
            return (sorteoIndex = index);
          }
        });

        if (sorteoIndex > -1) {
          db.data[sorteoIndex] = gData;
          await giveawaySchema.findOneAndUpdate({ ID: "sorteos" }, db);
          return true;
        }
      }

      async deleteGiveaway(messageId) {
        let db = await giveawaySchema.findOne({ ID: "sorteos" });
        let sorteos = db.data;
        let sorteoIndex = -1;

        sorteos.map((sorteo, index) => {
          if (sorteo.messageId.includes(messageId)) {
            return (sorteoIndex = index);
          }
        });

        if (sorteoIndex > -1) {
          db.data.splice(sorteoIndex, 1);
          await giveawaySchema.findOneAndUpdate({ ID: "sorteos" }, db);
          return true;
        }
      }
    }
    /* Crear Constructor */

    /* Crear Sistema */
    client.giveawaysManager = new sorteosDB(client, {
      default: {
        botsCanWin: false,
        embedCOLOR: process.env.COLOR,
        embedCOLOREnd: "Green",
        reaction: "1198447473346236506",
      },
    });
    /* Crear Sistema */
  } catch (e) {
    console.log(e);
  }
};
