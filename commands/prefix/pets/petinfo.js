const { PermissionsBitField, Message, EmbedBuilder } = require('discord.js');
const { ServerPets, PetStats } = require('../../../models/ServerPet');

module.exports = {
    name: 'petinfo',
    description: 'Displays information about your server pet.',
    aliases: ['petstats'],
    requiredPermissions: [PermissionsBitField.Flags.EmbedLinks],
    userPermissions: [],
    owner: false,

    /**
     * Executes the petinfo command.
     * @param {Message} message The message object.
     * @param {string[]} args The command arguments.
     */
    async execute(message, args) {
        const serverId = message.guild.id;

        try {
            // Retrieve the pet and its stats for this server
            const existingPet = await ServerPets.findOne({ where: { serverId: serverId }, include: [PetStats] });

            if (!existingPet) {
                const noPetEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setAuthor({ name: `Your server does not own a pet!`, iconURL: message.client.user.displayAvatarURL() });

                return message.reply({ embeds: [noPetEmbed] });
            }

            const stats = existingPet.PetStat;
            const petInfoEmbed = new EmbedBuilder()
                .setColor(message.client.noColor)
                .setAuthor({ name: `${existingPet.petName} the ${existingPet.petType}`, iconURL: message.client.user.displayAvatarURL() })
                .addFields(
                    { name: 'Level', value: `${stats.level}`, inline: true },
                    { name: 'Experience', value: `${stats.experience} XP`, inline: true },
                    { name: 'Hunger', value: `${stats.hunger}/100`, inline: true },
                    { name: 'Happiness', value: `${stats.happiness}/100`, inline: true }
                )
                .setFooter({ text: `Take care of ${existingPet.petName} to keep them happy!` });

            return message.reply({ embeds: [petInfoEmbed] });
        } catch (error) {
            console.error('Error fetching pet info:', error.message);

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({ name: 'There was an error fetching your pet info. Please try again later.', iconURL: message.client.user.displayAvatarURL() });

            return message.reply({ embeds: [errorEmbed] });
        }
    }
};
