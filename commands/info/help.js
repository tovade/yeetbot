const Discord = require('discord.js');
module.exports = {
    name: 'help',
    description: 'Get help on all the commands',
    aliases: ['h'],
    cooldown: 5,
    usage: '<command>',
    category: 'Info',
    ownerOnly: false, 
    nsfwOnly: false, 
    async execute(client, message, args) {
        const embed = new Discord.MessageEmbed()
            .setColor('BLUE')


        const cmd = client.commands.get(args[0]);
        if (cmd) {
            const data = [];

            data.push(`**Command:** ${cmd.name}`);
            if (cmd.description) data.push(`**Description:** ${cmd.description}`);
            if (cmd.aliases ? cmd.aliases.length : null) data.push(`**Aliases:** ${cmd.aliases.map(a => `\`${a}\``).join(', ')}`);
            if (cmd.usage) data.push(`**Usage:** ${cmd.usage}`);
            if (cmd.cooldown) data.push(`**Cooldown:** ${cmd.cooldown}`);
            data.push(`**Nsfw Only:** ${cmd.nsfwOnly ? 'Yes' : 'No'}`);
            data.push(`**Owner Only:** ${cmd.ownerOnly ? 'Yes' : 'No'}`);
            if (cmd.category) data.push(`**Category:** ${cmd.category}`);

            embed.setDescription(data.join('\n'));
        } else {

    
            }
            const commands = client.commands
            const infoCmds = commands.filter(({ category }) => category === "Info").map(({ name }) => name).join(", ")
            const funCmds = commands.filter(({ category }) => category === "Fun").map(({ name }) => name).join(", ")
            const levelCmds = commands.filter(({ category }) => category === "Levels").map(({ name }) => name).join(", ")
            const embed1 = new Discord.MessageEmbed()
            .setTitle("Help")
            .addField("Info", `\`${infoCmds}\``)
            .addField("Fun", `\`${funCmds}\``)
            .addField("Levels", `\`${levelCmds}\``)
    
        

        message.channel.send(embed1);
    }
};