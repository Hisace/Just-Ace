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
            const guildSettings = await GuildSettings.findOne({ where: { guildId: message.guild.id }});

            const serverPrefix = guildSettings.prefix;

            const Embed = new EmbedBuilder()
                .setAuthor({ name: `My prefix in this server is ${serverPrefix}`, iconURL: message.client.user.displayAvatarURL()})
                .setColor(message.client.noColor);
            return message.channel.send({ embeds: [Embed] });
        }

        const newPrefix = args[0];

        try {
            // Update the prefix in the database
            await GuildSettings.update({ prefix: newPrefix }, { where: { guildId: message.guild.id } });
            const successEmbed =  new EmbedBuilder()
                .setDescription(`Prefix set to \`${newPrefix}\``)
                .setColor(message.client.noColor);
            message.channel.send({ embeds: [successEmbed] });
        } catch (error) {
            const errorEmbed = new EmbedBuilder()
                .setAuthor({ name: 'There was an error setting the prefix.', iconURL:message.client.user.displayAvatarURL() })
                .setColor(0xc72c3b);
            console.error('Error setting prefix:', error.message);
            return message.channel.send({ embeds: [errorEmbed] });
        }
    },
};