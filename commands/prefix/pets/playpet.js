const { PermissionsBitField, Message, EmbedBuilder } = require('discord.js');
const { ServerPets, PetStats } = require('../../../models/ServerPet');
const calculateXpForNextLevel = require('../../../utilities/calculateXpForNextLevel');

module.exports = {
    name: 'playpet',
    description: 'Play with your server pet to make it happier.',
    aliases: ['petplay'],
    requiredPermissions: [PermissionsBitField.Flags.EmbedLinks],
    userPermissions: [],
    owner: false,

    /**
     * Executes the playpet command.
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

            // Check if happiness is already full
            if (petStats.happiness >= 100) {
                const maxHappinessEmbed = new EmbedBuilder()
                    .setColor(message.client.noColor)
                    .setAuthor({ name: `${existingPet.petName} is already as happy as can be!`, iconURL: message.client.user.displayAvatarURL() });

                return message.reply({ embeds: [maxHappinessEmbed] });
            }

            // Increase happiness
            const happinessIncrease = 20;
            petStats.happiness = Math.min(petStats.happiness + happinessIncrease, 100);

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

            const playEmbed = new EmbedBuilder()
                .setColor(message.client.noColor)
                .setAuthor({ name: `You played with ${existingPet.petName}!`, iconURL: message.client.user.displayAvatarURL() })
                .setDescription(`${existingPet.name}'s happiness increased by **${happinessIncrease}** points!`)
                .addFields(
                    { name: 'Current Happiness', value: `${petStats.happiness}/100`, inline: true },
                    { name: 'Pet Type', value: existingPet.petType, inline: true }
                );

            message.reply({ embeds: [playEmbed] });

            if (levelUpMessage) {
                const levelEmbed = new EmbedBuilder()
                .setColor(message.client.noColor)
                .setDescription(`Level-Up! ${levelUpMessage}`);
                message.reply({ embeds: [levelEmbed] });
            }
        } catch (error) {
            console.error('Error playing with pet:', error.message);

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({ name: 'There was an error playing with your pet. Please try again later.', iconURL: message.client.user.displayAvatarURL() });

            return message.reply({ embeds: [errorEmbed] });
        }
    }
};
