const { PermissionsBitField, Message, EmbedBuilder } = require('discord.js');
const { ServerPets, PetStats } = require('../../../models/ServerPet');
const calculateXpForNextLevel = require('../../../utilities/calculateXpForNextLevel');

module.exports = {
    name: 'feedpet',
    description: 'Feed your server pet to restore its hunger.',
    aliases: ['petfeed'],
    requiredPermissions: [PermissionsBitField.Flags.EmbedLinks],
    userPermissions: [],
    owner: false,

    /**
     * Executes the feedpet command.
     * @param {Message} message The message object.
     * @param {string[]} args The command arguments.
     */
    async execute(message, args) {
        const serverId = message.guild.id;

        try {
            // Check if a pet exists for this server
            const existingPet = await ServerPets.findOne({ where: { serverId: serverId } });
            if (!existingPet) {
                const noPetEmbed = new EmbedBuilder()
                    .setColor('FF0000')
                    .setAuthor({ name: `Your server does not own a pet!`, iconURL: message.client.user.displayAvatarURL() });

                return message.reply({ embeds: [noPetEmbed] });
            }

            const petStats = await PetStats.findOne({ where: { petId: existingPet.id } });
            if (!petStats) {
                const noStatsEmbed = new EmbedBuilder()
                    .setColor('FF0000')
                    .setAuthor({ name: `Pet stats could not be found. Please try again later.`, iconURL: message.client.user.displayAvatarURL() });

                return message.reply({ embeds: [noStatsEmbed] });
            }

            // Check if hunger is already full
            if (petStats.hunger >= 100) {
                const fullHungerEmbed = new EmbedBuilder()
                    .setColor(message.client.noColor)
                    .setAuthor({ name: `${existingPet.petName} is already full!`, iconURL: message.client.user.displayAvatarURL() });

                return message.reply({ embeds: [fullHungerEmbed] });
            }

            // Restore hunger and save
            petStats.hunger = Math.min(petStats.hunger + 20, 100); // Increase hunger by 20, max 100

            // Gain XP
            const xpGained = 50; // Example XP gain
            petStats.experience += xpGained;

            // Check for level-up
            let xpForNextLevel = calculateXpForNextLevel(petStats.level);
            let levelUpMessage = '';

            while (petStats.experience >= xpForNextLevel) {
                petStats.experience -= xpForNextLevel; // Carry over extra XP
                petStats.level += 1; // Increase level
                xpForNextLevel = calculateXpForNextLevel(petStats.level);

                levelUpMessage += `${existingPet.name} leveled up to level **${petStats.level}**! 🎉\n`;
            }

            await petStats.save();

            const fedEmbed = new EmbedBuilder()
                .setColor(message.client.noColor)
                .setAuthor({ name: `${existingPet.petName} enjoyed the food!`, iconURL: message.client.user.displayAvatarURL() })
                .setDescription(`Hunger restored to ${petStats.hunger}/100.`);

            message.reply({ embeds: [fedEmbed] });

            if (levelUpMessage) {
                const levelEmbed = new EmbedBuilder()
                .setColor(message.client.noColor)
                .setDescription(`Level-Up! ${levelUpMessage}`);
                message.reply({ embeds: [levelEmbed] });
            }
        } catch (error) {
            console.error('Error feeding pet:', error.message);
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setAuthor({ name: 'There was an error feeding your pet. Please try again later.', iconURL: message.client.user.displayAvatarURL() });

            return message.reply({ embeds: [errorEmbed] });
        }
    }
};
