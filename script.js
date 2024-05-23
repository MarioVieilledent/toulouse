require("dotenv").config();
const fs = require("node:fs");
const { Client, GatewayIntentBits } = require("discord.js");

const token = process.env.CLIENT_TOKEN;

const HELP = "!help";
const PING = "!ping";
const ECHO = "!echo";
const EVAL = "!eval";

const COMMAND_LIST = `
- \`${HELP}\` *List commands*
- \`${PING}\` *Pong*
- \`${ECHO} <your shit here>\` *Stupidly repeats your message*
- \`${EVAL} <some js script>\` *Evaluates a JS script and write the returned value*
  - *e.g.* \`${EVAL} Math.sqrt(2)\`
  - *e.g.* \`${EVAL} [...Array(10)].reduce((a,_,i)=>a.concat(i>1?a[i-1]+a[i-2]:i),[]).join(', ')\`
  - *e.g.* \`${EVAL} world.a = 4; world.a *= 3; world;\`
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

// Object playground
let world = {
  name: "World",
  description: "Add properties and store shit here",
  logs: [],
};

// Log for each command
const log = (command, content) =>
  world.logs.push({ command, content, timestamp: new Date() });

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", (msgObj) => {
  const content = msgObj.content;

  console.log(
    `${msgObj.author} ${timestampToDate(msgObj.createdTimestamp)} - ${content}`
  );

  if (msgObj.content.startsWith(HELP)) {
    log(HELP, content);
    msgObj.reply(COMMAND_LIST);
  }

  if (msgObj.content.startsWith(PING)) {
    log(PING, content);
    msgObj.reply("Pong!");
  }

  if (msgObj.content.startsWith(ECHO)) {
    log(ECHO, content);
    msgObj.reply(msgObj.content.slice(6));
  }

  if (msgObj.content.startsWith(EVAL)) {
    log(EVAL, content);
    const script = msgObj.content.slice(6);
    try {
      const interp = eval(script);

      // Token disclosure protection
      if (/[\w-]{24}\.[\w-]{6}\.[\w-]{27}/.test(interp)) {
        msgObj.reply("Don't try to get the token u stinky whore");
        return;
      }

      // Token disclosure protection
      if (script.includes("msgObj")) {
        msgObj.reply("Don't try to get the token u stinky whore");
        return;
      }

      let rep;

      switch (typeof interp) {
        case "string":
          if (interp.length > 1999) {
            msg.reply(interp.slice(0, 1999));
          } else {
            msg.reply(interp);
          }
          break;
        case "object":
          rep = "```json\n" + JSON.stringify(interp, true, 3) + "```";
          if (rep.length > 1999) {
            msg.reply(rep.slice(0, 1999));
          } else {
            msg.reply(rep);
          }
          break;
        default:
          rep = interp + "";
          if (rep.length > 1999) {
            msg.reply(rep.slice(0, 1999));
          } else {
            msg.reply(rep);
          }
      }
    } catch (e) {
      msgObj.reply("Error while evaluating code: " + e);
    }
  }
});

client.login(token);
