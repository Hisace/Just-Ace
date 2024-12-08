const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ping',
    description: 'Check the bot\'s latency to the Discord API and WebSocket.',
    usage: '',
    permissions: [PermissionFlagsBits.SendMessages],
    owner: false,
    async execute(message, args) {
        // Get websocket heartbeat
        const websocketHeartbeat = message.client.ws.ping;

        // Create embed
        const embed = new EmbedBuilder()
        	.setColor('2B2D31')
          .setDescription(`Pong in \`${websocketHeartbeat}ms\``);

        // Edit the sent message with the embed
        await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false} });
    },
};