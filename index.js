const fs = require("fs");
const Discord = require("discord.js");
const Client = require("./client/Client");
const config = require("./config.json");
const { Player } = require("discord-player");

const client = new Client();
client.commands = new Discord.Collection();

const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

console.log(client.commands);

const player = new Player(client);

player.on("error", (queue, error) => {
  console.log(
    `[${queue.guild.name}] Error emitted from the queue: ${error.message}`
  );
});

player.on("connectionError", (queue, error) => {
  console.log(
    `[${queue.guild.name}] Error emitted from the connection: ${error.message}`
  );
});

player.on("trackStart", (queue, track) => {
  queue.metadata.send(
    `▶ | Started playing: **${track.title}** .`
  );
});

player.on("trackAdd", (queue, track) => {
  queue.metadata.send(`🎶 | Track **${track.title}** queued!`);
});

player.on("botDisconnect", (queue) => {
  queue.metadata.send(
    "❌ | I was manually disconnected from the voice channel, clearing queue!"
  );
});

player.on("channelEmpty", (queue) => {
  queue.metadata.send("❌ | Nobody is in the voice channel, leaving...");
});

client.once("ready", async () => {
  console.log("Ready!");
});

client.on("ready", function () {
  client.user.setActivity(config.activity, { type: config.activityType });
});

client.once("reconnecting", () => {
  console.log("Reconnecting!");
});

client.once("disconnect", () => {
  console.log("Disconnect!");
});

client.on('messageCreate', message =>{
  if(message.author.bot || !message.guild) return;

   message.guild.commands.set(client.commands).then(() => {
  console.log("Added");

});
});


client.on("interactionCreate", async (interaction) => {
  const command = client.commands.get(interaction.commandName.toLowerCase());

  try {
    if (
      interaction.commandName == "ban" ||
      interaction.commandName == "userinfo"
    ) {
      command.execute(interaction, client);
    } else {
      command.execute(interaction, player);
    }
  } catch (error) {
    console.error(error);
    interaction.followUp({
      content: "There was an error trying to execute that command!",
    });
  }
});

client.login(config.token);
