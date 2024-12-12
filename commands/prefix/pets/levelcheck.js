const { PermissionsBitField, Message, EmbedBuilder } = require('discord.js');
const { ServerPets, PetStats } = require('../../../models/ServerPet');

module.exports = {
    name: 'levelcheck',
    description: "Check your server pet's level and experience.",
    requiredPermissions: [PermissionsBitField.Flags.EmbedLinks],
    userPermissions: [],
    owner: false,

    /**
     * Executes the levelcheck command.
     * @param {Message} message The message object.
     * @param {string[]} args The command arguments.
     */
    async execute(message, args) {
        const serverId = message.guild.id;

        try {
            // Check if a pet exists for this server
            const existingPet = await ServerPets.findOne({ where: { serverId } });
            if (!existingPet) {
                const noPetEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setAuthor({ name: `Your server does not own a pet!`, iconURL: message.client.user.displayAvatarURL() });

                return message.reply({ embeds: [noPetEmbed] });
            }

            const petStats = await PetStats.findOne({ where: { petId: existingPet.id } });
            if (!petStats) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setAuthor({ name: 'Could not find pet stats. Please try again later.', iconURL: message.client.user.displayAvatarURL() });

                return message.reply({ embeds: [errorEmbed] });
            }

            // Calculate experience progress
            const xpToNextLevel = petStats.level * 100;
            const xpProgress = `${petStats.experience}/${xpToNextLevel}`;
            const xpPercentage = ((petStats.experience / xpToNextLevel) * 100).toFixed(2);

            const levelEmbed = new EmbedBuilder()
                .setColor(message.client.noColor)
                .setAuthor({ name: `${existingPet.petName}'s Level Info`, iconURL: message.client.user.displayAvatarURL() })
                .addFields(
                    { name: 'Level', value: `${petStats.level}`, inline: true },
                    { name: 'Experience', value: xpProgress, inline: true },
                    { name: 'Progress', value: `${xpPercentage}%`, inline: true }
                );

            return message.reply({ embeds: [levelEmbed] });
        } catch (error) {
            console.error('Error checking pet level:', error.message);

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({ name: 'There was an error checking your pet level. Please try again later.', iconURL: message.client.user.displayAvatarURL() });

            return message.reply({ embeds: [errorEmbed] });
        }
    }
};
