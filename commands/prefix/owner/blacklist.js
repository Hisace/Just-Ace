const UserSettings = require("../../../models/UserSettings");
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'blacklist',
    description: 'bans a user from using the bot.',
    usage: '<userID>',
    requiredPermissions: [],
    userPermissions: [],
    owner: true,
    async execute(message, args) {
        // Check if a user ID was given
        if (!args[0] || args[0].length !== 19) {
            const errorEmbed = new EmbedBuilder()
                .setDescription('Please provide a valid user ID.')
                .setColor(0xc72c3b);
            return message.channel.send({ embeds: [errorEmbed] });
        }

        let userSettings = await UserSettings.findOne({ where: { userId: args[0] } });

        // If userSettings is null, create a new record
        if (!userSettings) {
            userSettings = await UserSettings.create({ userId: args[0], blocked: 0 });
        }

        if (userSettings.blocked === 0) {
            await UserSettings.update({ blocked: 1 }, { where: { userId: args[0] } });
            return message.channel.send({ content: `User (${args[0]}) is now banned from using me.` });
        } else {
            await UserSettings.update({ blocked: 0 }, { where: { userId: args[0] } });
            return message.channel.send({ content: `User (${args[0]}) is now unbanned and able to use me.` });
        }
    }
}