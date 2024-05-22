require("dotenv").config();
const fs = require("node:fs");
const { Client, GatewayIntentBits } = require("discord.js");

const token = process.env.CLIENT_TOKEN;

const HELP = `
- \`!help\` *List commands*
- \`!ping\` *Pong*
- \`!eval\` *Evaluates a JS script and write the returned value*
- \`!eval\` *Evaluates a JS script and write the returned value*
`;

const timestampToDate = (ts) => {
  const date = new Date(ts * 1000);
  const hours = date.getHours();
  const minutes = "0" + date.getMinutes();
  const seconds = "0" + date.getSeconds();
  return hours + ":" + minutes.substr(-2) + ":" + seconds.substr(-2);
};

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: ["MESSAGE", "CHANNEL"],
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", (msg) => {
  const content = msg.content;

  console.log(
    `${msg.author} ${timestampToDate(msg.createdTimestamp)} - ${content}`
  );

  if (msg.content.startsWith("!help")) {
    msg.reply(HELP);
  }

  if (msg.content.startsWith("!ping")) {
    msg.reply("Pong!");
  }

  if (msg.content.startsWith("!eval ")) {
    const script = msg.content.slice(6);
    try {
      const interp = eval(script);
      // Token disclosure protection
      if (/[\w-]{24}\.[\w-]{6}\.[\w-]{27}/.test(interp)) {
        msg.reply("Don't try to get the token u stinky whore");
      } else {
        switch (typeof interp) {
          case "string":
            msg.reply(interp);
            break;
          case "object":
            msg.reply("```json\n" + JSON.stringify(interp, true, 3) + "```");
            break;
          default:
            msg.reply(interp + "");
        }
      }
    } catch (e) {
      msg.reply("Error while evaluating code: " + e);
    }
  }
});

client.login(token);
