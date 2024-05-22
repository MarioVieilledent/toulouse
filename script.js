require("dotenv").config();
const fs = require("node:fs");
const { Client, GatewayIntentBits } = require("discord.js");

const token = process.env.CLIENT_TOKEN;

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
  console.log("messageCreate => command " + msg.content);

  fs.writeFile("./msg_data.json", JSON.stringify(msg, true, 3), (err) => {
    if (err) {
      console.error(err);
    }
  });

  if (msg.content.startsWith("!")) {
    msg.reply("Commande " + msg.content);
  }
});

client.login(token);
