const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'echo',
    aliases: ['repeat', 'say'],
    description: 'Echoes back the provided message.',
    usage: '<message>',
    requiredPermissions: [PermissionsBitField.Flags.Administrator],
    userPermissions: [PermissionsBitField.Flags.Administrator],
    owner: false,
    async execute(message, args) {
        // Check if there are arguments
        if (!args.length) {
            return message.reply('You need to provide a message to echo!');
        }

        // Join the arguments back into a single string
        const response = args.join(' ');

        // Delete the original command message
        await message.delete();

        // Send the response back
        await message.channel.send(response);
    },
};
