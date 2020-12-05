/*
  > Index.Js is the entry point of our application.
*/
// We import the modules.
const Discord = require("discord.js");
const mongoose = require("mongoose");
const config = require("./config");
const GuildSettings = require("./models/settings");
const Dashboard = require("./dashboard/dashboard");
const glob = require('glob')
const Levels = require('discord-xp')
// We instiate the client and connect to database.
const client = new Discord.Client();
mongoose.connect(config.mongodbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
client.config = config;

client.cooldowns = new Discord.Collection();
client.commands = new Discord.Collection();
// We listen for client's ready event.
client.on("ready", () => {
  console.log(`Bot is ready. (${client.guilds.cache.size} Guilds - ${client.channels.cache.size} Channels - ${client.users.cache.size} Users)`);
  Dashboard(client);
});
const commandFiles = glob.sync('./commands/**/*.js');
for (const file of commandFiles) {
  const command = require(file);
  client.commands.set(command.name, command);
};
client.on('message', async (message) => {
    var storedSettings = await GuildSettings.findOne({ gid: message.guild.id });
  if (!storedSettings) {
    // If there are no settings stored for this guild, we create them and try to retrive them again.
    const newSettings = new GuildSettings({
      gid: message.guild.id
    });
    await newSettings.save().catch(()=>{});
    storedSettings = await GuildSettings.findOne({ gid: message.guild.id });
  }
  if(message.channel.id === storedSettings.global) {
    client.guilds.cache.forEach(async guild => {
      if(guild.id === message.guild.id) return;
          var settin = await GuildSettings.findOne({ gid: guild.id });
      if(!settin) return;
      if(message.author.bot) return;
      const channel = guild.channels.cache.get(settin.global)
      channel.send(message.content)
    })
  }
  
  
});
client.on('message', async (message) => {
    var storedSettings = await GuildSettings.findOne({ gid: message.guild.id });
  if (!storedSettings) {
    // If there are no settings stored for this guild, we create them and try to retrive them again.
    const newSettings = new GuildSettings({
      gid: message.guild.id
    });
    await newSettings.save().catch(()=>{});
    storedSettings = await GuildSettings.findOne({ gid: message.guild.id });
  }
        const randomAmountOfXp = Math.floor(Math.random() * 29) + 1; // Min 1, Max 30
 
    const hasLeveledUp = await Levels.appendXp(message.author.id, message.guild.id, randomAmountOfXp);
    if(storedSettings.levelMessages === "on") {
    if (hasLeveledUp) {
      const user = await Levels.fetch(message.author.id, message.guild.id);
      message.channel.send(`${message.author}, congratulations! You have leveled up to **${user.level}**. :tada:`);
    }
}
})
// We listen for message events.
client.on("message", async (message) => {
  var storedSettings = await GuildSettings.findOne({ gid: message.guild.id });
  if (!storedSettings) {
    // If there are no settings stored for this guild, we create them and try to retrive them again.
    const newSettings = new GuildSettings({
      gid: message.guild.id
    });
    await newSettings.save().catch(()=>{});
    storedSettings = await GuildSettings.findOne({ gid: message.guild.id });
  }
  // Declaring a reply function for easier replies - we grab all arguments provided into the function and we pass them to message.channel.send function.

  // Doing some basic command logic.
  if (message.author.bot) return;
  if (!message.channel.permissionsFor(message.guild.me).has("SEND_MESSAGES")) return;
 
  // Retriving the guild settings from database.


  // If the message does not start with the prefix stored in database, we ignore the message.
  if (!message.content.startsWith(storedSettings.prefix)) return;

  // We remove the prefix from the message and process the arguments.
  const args = message.content.slice(storedSettings.prefix.length).trim().split(/ +/g);
  const commandName = args.shift();
  const command = client.commands.get(commandName)
  || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

if (!command) return;

if(command.nsfwOnly && !message.channel.nsfw) {
   return message.reply('Only use this in nsfw channels please')
}
if(command.ownerOnly && message.author.id !== config.ownerId) {
   return message.reply("Only the owner is allowed to run this")
}

if (!client.cooldowns.has(command.name)) {
  client.cooldowns.set(command.name, new Discord.Collection());
};

const now = Date.now();
const timestamps = client.cooldowns.get(command.name);
const cooldownAmount = (command.cooldown || 0) * 1000;

if (timestamps.has(message.author.id)) {
  const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

  if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
  };
};

timestamps.set(message.author.id, now);
setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

try {
  command.execute(client, message, args);
} catch (error) {
  console.log(error);
  message.reply('there was an error trying to execute that command!');
}  

  // If command is ping we send a sample and then edit it with the latency.
});

// Listening for error & warn events.
client.on("error", console.error);
client.on("warn", console.warn);
client.on("guildMemberAdd", async (member) => {
  const set = await GuildSettings.findOne({ gid: member.guild.id })
  const embed = new Discord.MessageEmbed()
  .setTitle("Welcome")
  .setDescription(`${member.user.username} welcome to ${member.guild.name}`)
    if(set.welcomeChannel !== null) {
      client.channels.cache.get(set.welcomeChannel).send(embed)
    }
})
// We login into the bot.
client.login(config.token);