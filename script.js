require("dotenv").config();
const fs = require("node:fs");
const { Client, GatewayIntentBits } = require("discord.js");

const token = process.env.CLIENT_TOKEN;

const HELP = "!help";
const PING = "!ping";
const ECHO = "!echo";
const LIFE = "!life";
const EVAL = "!eval";

const COMMAND_LIST = `
- \`${HELP}\` *List commands*
- \`${PING}\` *Pong*
- \`${ECHO} <your shit here>\` *Stupidly repeats your message*
- \`${LIFE}\` *Game of life*
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
    GatewayIntentBits.DirectMessageTyping,
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

  if (msgObj.content.startsWith(LIFE)) {
    log(LIFE, content);
    const x = 20;
    const y = 10;

    let msgToEdit;

    let gol = Array(x).fill(Array(y).fill(false));

    gol[5][3] = true;
    gol[5][4] = true;
    gol[5][5] = true;
    gol[5][6] = true;
    gol[5][7] = true;
    gol[6][7] = true;

    const toStr = (gol) =>
      gol
        .map((row) => row.map((cell) => (cell ? "■" : " ")).join(""))
        .join("\n");

    // Function to get the next state of the grid
    const next = (gol) => {
      let newGrid = Array.from({ length: x }, () => Array(y).fill(false));

      // Helper function to count the live neighbors
      const countLiveNeighbors = (gol, i, j) => {
        let liveNeighbors = 0;
        for (let di = -1; di <= 1; di++) {
          for (let dj = -1; dj <= 1; dj++) {
            if (di === 0 && dj === 0) continue;
            const ni = i + di;
            const nj = j + dj;
            if (ni >= 0 && ni < x && nj >= 0 && nj < y && gol[ni][nj]) {
              liveNeighbors++;
            }
          }
        }
        return liveNeighbors;
      };

      // Loop through each cell to determine the next state
      for (let i = 0; i < x; i++) {
        for (let j = 0; j < y; j++) {
          const liveNeighbors = countLiveNeighbors(gol, i, j);
          if (gol[i][j]) {
            newGrid[i][j] = liveNeighbors === 2 || liveNeighbors === 3;
          } else {
            newGrid[i][j] = liveNeighbors === 3;
          }
        }
      }

      return newGrid;
    };

    for (let i = 0; i < 10; i++) {
      msgObj.reply(toStr(gol)).then((elem) => {
        console.log(Object.getOwnPropertyNames(elem));

        setTimeout(() => {
          gol = next(gol);
          msgToEdit.edit(toStr(gol));
        }, i * 300);
      });
    }
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
