const GuildSettings = require('../../../models/GuildSettings');
const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'prefix',
    description: 'Set the bot prefix in this server.',
    usage: '<prefix>',
    requiredPermissions: [PermissionsBitField.Flags.EmbedLinks],
    userPermissions: [PermissionsBitField.Flags.Administrator],
    owner: false,
    async execute(message, args) {

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