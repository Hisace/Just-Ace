const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ping',
    description: 'Check the bot\'s latency to the Discord API and WebSocket.',
    requiredPermissions: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks],
    userPermissions: [],
    owner: false,
    async execute(message, args) {
        // Get websocket heartbeat
        const websocketHeartbeat = message.client.ws.ping;

        // Create embed
        const embed = new EmbedBuilder()
        	.setColor(message.client.noColor)
          .setAuthor({ name: `Pong in ${websocketHeartbeat}ms`, iconURL: message.client.user.displayAvatarURL() });

        // Edit the sent message with the embed
        await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false} });
    },
};