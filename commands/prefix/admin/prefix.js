const GuildSettings = require('../../../models/GuildSettings');
const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'prefix',
    description: 'Set the bot prefix in this server.',
    usage: '<prefix>',
    requiredPermissions: [PermissionFlagsBits.Administrator],
    userPermissions: [PermissionFlagsBits.Administrator],
    owner: false,
    async execute(message, args) {
        // Check permissions
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            const errorEmbed = new EmbedBuilder()
                .setDescription('You do not have permission to use this command.')
                .setColor(0xc72c3b);
            return message.channel.send({ embeds: [errorEmbed] });
        }

        // Check if a prefix is provided
        if (!args[0]) {
            const errorEmbed = new EmbedBuilder()
                .setDescription('Please provide a new prefix.')
                .setColor(0xc72c3b);
            return message.channel.send({ embeds: [errorEmbed] });
        }

        const newPrefix = args[0];

        try {
            // Update the prefix in the database
            await GuildSettings.update({ prefix: newPrefix }, { where: { guildId: message.guild.id } });
            const successEmbed =  new EmbedBuilder()
                .setDescription(`Prefix set to \`${newPrefix}\``)
            message.channel.send({ embeds: [successEmbed] });
        } catch (error) {
            const errorEmbed = new EmbedBuilder()
                .setDescription('There was an error setting the prefix.')
                .setColor(0xc72c3b);
            console.error('Error setting prefix:', error);
            return message.channel.send({ embeds: [errorEmbed] });
        }
    },
};