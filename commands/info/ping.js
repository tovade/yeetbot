module.exports = {
    name: 'ping', // The name of the command
    description: 'Pong!', //The description of what the command does
    aliases: ['p'], // An array of aliases your command has // If true this command can only be done in server/If false command can be done in servers and dms
    cooldown: 5, // Cooldown in seconds your command has (This example has 5 seconds cooldown)
    usage: '<member>', // Usage of the command
    category: 'Info',  // What category your command is in
    ownerOnly: false,
    nsfwOnly: false,
    execute(client ,message, args) {
    message.channel.send(`${client.ws.ping}`)
    }
}