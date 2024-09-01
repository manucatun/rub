const { EmbedBuilder, WebhookClient } = require("discord.js");
const webhook = new WebhookClient({ url: process.env.WEBHOOK });
const { inspect } = require("util");

module.exports = (client) => {
  const embed = new EmbedBuilder().setColor("Red");

  process.removeAllListeners();

  client.on("error", (err) => {
    console.log(`〔💥〕ANTI CRASH - ERROR`.bgRed);
    console.log(err);

    return webhook.send({
      content: `<@&995485990049300490>`,
      embeds: [
        embed
          .setTitle(`<:warning:1279144320062066748> ERROR - DISCORD API`)
          .setURL(`https://discordjs.guide/popular-topics/errors.html#errors`)
          .setDescription(
            `\`\`\`js\n${inspect(err, { depth: 0 }).slice(0, 1000)}\`\`\``
          )
          .setTimestamp(),
      ],
    });
  });

  process.on("unhandledRejection", (reason, p) => {
    console.log(`〔💥〕ANTI CRASH - ERROR`.bgRed);
    console.log(reason);

    return webhook.send({
      content: `<@&995485990049300490>`,
      embeds: [
        embed
          .setTitle(`<:warning:1279144320062066748> ERROR - UNHANDLED REJECTION`)
          .setURL(
            `https://nodejs.org/dist/latest-v20.x/docs/api/process.html#event-unhandledrejection`
          )
          .addFields(
            {
              name: `Reason`,
              value: `\`\`\`js\n${inspect(reason, { depth: 0 }).slice(
                0,
                1000
              )}\`\`\``,
            },
            {
              name: `Promise`,
              value: `\`\`\`js\n${inspect(p, { depth: 0 }).slice(
                0,
                1000
              )}\`\`\``,
            }
          )
          .setTimestamp(),
      ],
    });
  });

  process.on("uncaughtException", (err, origin) => {
    console.log(`〔💥〕ANTI CRASH - ERROR`.bgRed);
    console.log(err);

    return webhook.send({
      content: `<@&995485990049300490>`,
      embeds: [
        embed
          .setTitle(`<:warning:1279144320062066748> ERROR - UNCAUGHT EXCEPTION`)
          .setURL(
            `https://nodejs.org/dist/latest-v20.x/docs/api/process.html#event-uncaughtexception`
          )
          .addFields(
            {
              name: `Error`,
              value: `\`\`\`js\n${inspect(err, { depth: 0 }).slice(
                0,
                1000
              )}\`\`\``,
            },
            {
              name: `Origin`,
              value: `\`\`\`js\n${inspect(origin, { depth: 0 }).slice(
                0,
                1000
              )}\`\`\``,
            }
          )
          .setTimestamp(),
      ],
    });
  });

  process.on("uncaughtExceptionMonitor", (err, origin) => {
    console.log(`〔💥〕ANTI CRASH - ERROR`.bgRed);
    console.log(err);

    return webhook.send({
      content: `<@&995485990049300490>`,
      embeds: [
        embed
          .setTitle(
            `<:warning:1279144320062066748> ERROR - UNCAUGHT EXCEPTION MONITOR`
          )
          .setURL(
            `https://nodejs.org/dist/latest-v20.x/docs/api/process.html#event-uncaughtexceptionmonitor`
          )
          .addFields(
            {
              name: `Error`,
              value: `\`\`\`js\n${inspect(err, { depth: 0 }).slice(
                0,
                1000
              )}\`\`\``,
            },
            {
              name: `Origin`,
              value: `\`\`\`js\n${inspect(origin, { depth: 0 }).slice(
                0,
                1000
              )}\`\`\``,
            }
          )
          .setTimestamp(),
      ],
    });
  });

  process.on("multipleResolves", () => {});
};