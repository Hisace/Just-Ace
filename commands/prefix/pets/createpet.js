const { PermissionsBitField, Message, EmbedBuilder } = require('discord.js');
const { ServerPets, PetStats } = require('../../../models/ServerPet');

module.exports = {
    name: 'createpet',
    description: 'Create a pet for your server.',
    aliases: ['adoptpet', 'adopt'],
    usage: '<name> <type>',
    requiredPermissions: [PermissionsBitField.Flags.EmbedLinks],
    userPermissions: [PermissionsBitField.Flags.Administrator],
    owner: false,

    /**
     * Executes the createpet command.
     * @param {Message} message The message object.
     * @param {string[]} args The command arguments.
     */
    async execute(message, args) {
        const serverId = message.guild.id;

        // Validate input
        if (args.length < 2) {
            const usageEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setAuthor({ name: 'Invalid Usage', iconURL: message.client.user.displayAvatarURL() })
                .setDescription(`**Usage:** \`${message.client.prefix}createpet <name> <type>\`\n**Example:** \`${message.client.prefix}createpet Fluffy cat\``);

            return message.reply({ embeds: [usageEmbed] });
        }

        const petName = args[0];
        const petType = args.slice(1).join(' ');

        try {
            // Check if a pet already exists for this server
            const existingPet = await ServerPets.findOne({ where: { serverId } });
            if (existingPet) {
                const existingPetEmbed = new EmbedBuilder()
                    .setColor('FF0000')
                    .setDescription(`Your server already has a pet named **${existingPet.petName}**!`);

                return message.reply({ embeds: [existingPetEmbed] });
            }

            // Create the pet and its stats
            const newPet = await ServerPets.create({
                serverId: serverId,
                petName: petName,
                petType: petType
            });

            await PetStats.create({
                petId: newPet.id,
                hunger: 100,
                happiness: 100,
                level: 1,
                experience: 0
            });

            const successEmbed = new EmbedBuilder()
                .setColor(message.client.noColor)
                .setAuthor({ name: 'Take good care of your pet!', iconURL: message.client.user.displayAvatarURL() })
                .setDescription(`A new pet named **${petName}** (Type: ${petType}) has been created for your server!`);

            return message.reply({ embeds: [successEmbed] });
        } catch (error) {
            console.error('Error creating pet:', error.message);
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setAuthor({name: 'There was an error creating your pet. Please try again later.', iconURL: message.client.user.displayAvatarURL() });

            return message.reply({ embeds: [errorEmbed] });
        }
    }
};
