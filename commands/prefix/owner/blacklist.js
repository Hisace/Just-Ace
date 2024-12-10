const UserSettings = require("../../../models/UserSettings");
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'blacklist',
    description: 'Bans or unbans a user from using the bot, or shows a list of banned users.',
    aliases: ['bl'],
    usage: '[userID]',
    requiredPermissions: [],
    userPermissions: [],
    owner: true,
    async execute(message, args) {
        const userId = args[0];

        // Validate the userId if provided
        if (userId && (userId.length !== 19 || isNaN(userId))) {
            const errorEmbed = new EmbedBuilder()
                .setDescription('Invalid user ID provided. Showing the banned users list instead.')
                .setColor('Red');
            await message.channel.send({ embeds: [errorEmbed] });
            return displayBannedUsers(message);
        }

        // If no user ID is provided, display the list of banned users
        if (!userId) {
            return displayBannedUsers(message);
        }

        // Check and update the user's ban status
        let userSettings = await UserSettings.findOne({ where: { userId } });

        // Create a new record if the user doesn't exist
        if (!userSettings) {
            userSettings = await UserSettings.create({ userId, blocked: 0 });
        }

        if (userSettings.blocked === 0) {
            await UserSettings.update({ blocked: 1 }, { where: { userId } });
            return message.channel.send({ content: `User (${userId}) is now banned from using me.` });
        } else {
            await UserSettings.update({ blocked: 0 }, { where: { userId } });
            return message.channel.send({ content: `User (${userId}) is now unbanned and able to use me.` });
        }
    }
};

// Helper function to display banned users
async function displayBannedUsers(message) {
    const bannedUsers = await UserSettings.findAll({ where: { blocked: 1 } });

    if (bannedUsers.length === 0) {
        const noBannedEmbed = new EmbedBuilder()
            .setDescription('There are currently no banned users.')
            .setColor(message.client.noColor);
        return message.channel.send({ embeds: [noBannedEmbed] });
    }

    const bannedList = bannedUsers.map(user => `- <@${user.userId}> (ID: ${user.userId})`).join('\n');
    const bannedEmbed = new EmbedBuilder()
        .setTitle('Banned Users')
        .setDescription(bannedList)
        .setColor(message.client.noColor);
    return message.channel.send({ embeds: [bannedEmbed] });
}
