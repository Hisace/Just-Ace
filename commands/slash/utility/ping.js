const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Check the bot\'s latency to the Discord API and WebSocket.'),
	async execute(interaction) {
        // Calculate roundtrip latency
        const startTime = Date.now();
        const testEmbed = new EmbedBuilder()
        	.setColor('2B2D31')
        	.setDescription('Pinging...');
        const sentMessage = await interaction.reply({ embeds: [testEmbed] });
        const endTime = Date.now();
        const roundtripLatency = endTime - startTime;

        // Get websocket heartbeat
        const websocketHeartbeat = interaction.client.ws.ping;

        // Create embed
        const embed = new EmbedBuilder()
        	.setColor('2B2D31')
            .setDescription(`Roundtrip Latency: ${roundtripLatency}ms\nWebsocket Heartbeat: ${websocketHeartbeat}ms`);

        // Edit the sent message with the embed
        await interaction.editReply({ embeds: [embed] });
	},
};