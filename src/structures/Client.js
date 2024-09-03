const {
  Client,
  GatewayIntentBits,
  Partials,
  ActivityType,
  SlashCommandBuilder,
  PresenceUpdateStatus,
  Collection,
} = require("discord.js");
const BotUtils = require("./Utils");

module.exports = class extends Client {
  constructor(
    options = {
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.DirectMessages,
      ],

      partials: [
        Partials.User,
        Partials.Channel,
        Partials.GuildMember,
        Partials.Message,
        Partials.Reaction,
        Partials.GuildScheduledEvent,
        Partials.Channel,
      ],

      allowedMentions: {
        parse: ["users"],
        repliedUser: true,
      },

      presence: {
        activities: [
          {
            name: process.env.STATUS,
            type: ActivityType[process.env.STATUS_TYPE],
          },
        ],
        status: PresenceUpdateStatus.Online,
      },
    }
  ) {
    super({
      ...options,
    });

    this.slashCommands = new Collection();
    this.snipes = new Collection();
    this.slashArray = [];

    this.utils = new BotUtils(this);

    this.start();
  }

  async start() {
    await this.loadEvents();
    await this.loadHandlers();
    await this.loadSlashCommands();

    this.login(process.env.TOKEN);
  }

  async loadHandlers() {
    console.log(`〔🎲〕Cargando Handlers...`.yellow);

    const rutaArchivos = await this.utils.loadFiles("/src/handlers");
    if (rutaArchivos.length) {
      rutaArchivos.forEach((rutaArchivo) => {
        try {
          require(rutaArchivo)(this);
        } catch (e) {
          console.log(
            `〔💥〕ERROR AL CARGAR EL ARCHIVO >〔 ${rutaArchivo} 〕`.bgRed
          );
          console.log(e);
        }
      });
    }

    console.log(
      `〔🎲〕${rutaArchivos.length} Handlers Cargados!`.brightGreen.bold
    );
  }

  async loadEvents() {
    console.log(`〔📅〕Cargando Eventos...`.yellow);
    this.removeAllListeners();

    const rutaArchivos = await this.utils.loadFiles("/src/events");
    if (rutaArchivos.length) {
      rutaArchivos.forEach((rutaArchivo) => {
        try {
          const evento = require(rutaArchivo);
          const nombreEvento = rutaArchivo
            .split("\\")
            .pop()
            .split("/")
            .pop()
            .split(".")[0];
          this.on(nombreEvento, evento.bind(null, this));
        } catch (e) {
          console.log(
            `〔💥〕ERROR AL CARGAR EL ARCHIVO >〔 ${rutaArchivo} 〕`.bgRed
          );
          console.log(e);
        }
      });
    }

    console.log(
      `〔📅〕${rutaArchivos.length} Eventos Cargados!`.brightGreen.bold
    );
  }

  async loadSlashCommands() {
    console.log(`〔🔩〕Cargando Slash Commands...`.yellow);
    await this.slashCommands.clear();
    this.slashArray = [];

    const rutaArchivos = await this.utils.loadFiles("/src/commands");
    if (rutaArchivos.length) {
      rutaArchivos.forEach((rutaArchivo) => {
        try {
          const comando = require(rutaArchivo);
          const nombreComando = rutaArchivo
            .split("\\")
            .pop()
            .split("/")
            .pop()
            .split(".")[0];
          comando.CMD.name = nombreComando;

          if (nombreComando) this.slashCommands.set(nombreComando, comando);
          this.slashArray.push(comando.CMD.toJSON());
        } catch (e) {
          console.log(
            `〔💥〕ERROR AL CARGAR EL ARCHIVO >〔 ${rutaArchivo} 〕`.bgRed
          );
          console.log(e);
        }
      });
    }

    console.log(
      `〔🔩〕${this.slashCommands.size} Slash Commands Cargados!`.brightGreen
        .bold
    );

    if (this?.application?.commands) {
      this.application.commands.set(this.slashArray);
      console.log(
        `〔🤖〕${this.slashCommands.size} Slash Commands Publicados!`
          .brightGreen.bold
      );
    }
  }
};
