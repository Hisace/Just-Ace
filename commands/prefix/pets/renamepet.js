const { PermissionsBitField, Message, EmbedBuilder } = require('discord.js');
const { ServerPets } = require('../../../models/ServerPet');

module.exports = {
    name: 'renamepet',
    description: 'Rename your server pet.',
    aliases: ['petrename'],
    requiredPermissions: [PermissionsBitField.Flags.EmbedLinks],
    userPermissions: [PermissionsBitField.Flags.Administrator],
    owner: false,

    /**
     * Executes the renamepet command.
     * @param {Message} message The message object.
     * @param {string[]} args The command arguments.
     */
    async execute(message, args) {
        const serverId = message.guild.id;

        // Ensure the user provided a new name
        const newName = args.join(' ').trim();
        if (!newName) {
            const noNameEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({ name: 'You must provide a new name for your pet!', iconURL: message.client.user.displayAvatarURL() });

            return message.reply({ embeds: [noNameEmbed] });
        }

        try {
            // Check if a pet exists for this server
            const existingPet = await ServerPets.findOne({ where: { serverId: serverId } });
            if (!existingPet) {
                const noPetEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setAuthor({ name: `Your server does not own a pet!`, iconURL: message.client.user.displayAvatarURL() });

                return message.reply({ embeds: [noPetEmbed] });
            }

            // Update the pet's name
            const oldName = existingPet.petName;
            existingPet.petName = newName;
            await existingPet.save();

            const renameEmbed = new EmbedBuilder()
                .setColor(message.client.noColor)
                .setAuthor({ name: `Your pet has been renamed!`, iconURL: message.client.user.displayAvatarURL() })
                .setDescription(`**${oldName}** is now known as **${newName}**!`);

            return message.reply({ embeds: [renameEmbed] });
        } catch (error) {
            console.error('Error renaming pet:', error.message);

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({ name: 'There was an error renaming your pet. Please try again later.', iconURL: message.client.user.displayAvatarURL() });

            return message.reply({ embeds: [errorEmbed] });
        }
    }
};
