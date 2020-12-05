const { MessageEmbed } = require('discord.js')
const Levels = require('discord-xp')
module.exports = {
    name: 'leaderboard', 
    description: 'leaderboard!', 
    aliases: ['lb'], 
    guildOnly: true, 
    cooldown: 5, 
    usage: '',
    category: 'Levels', 
    ownerOnly: false, 
    nsfwOnly: false, 
   async execute(client, message, args) {
     

const rawLeaderboard = await Levels.fetchLeaderboard(message.guild.id, 10); // We grab top 10 users with most xp in the current server.
 
if (rawLeaderboard.length < 1) return message.reply("Nobody's in leaderboard yet.");
 
const leaderboard = Levels.computeLeaderboard(client, rawLeaderboard); // We process the leaderboard.
 
const lb = leaderboard.map(e => `${e.position}. ${e.username}#${e.discriminator}\nLevel: ${e.level}\nXP: ${e.xp.toLocaleString()}`); // We map the outputs.
 let embed = new MessageEmbed()
 .setTitle("Leaderboard")
 .setDescription(`\n\n${lb.join("\n\n")}`)
 .setThumbnail(message.guild.iconURL())
message.channel.send(embed);
}
};