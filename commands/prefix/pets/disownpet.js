const { PermissionsBitField, Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { ServerPets, PetStats } = require('../../../models/ServerPet');

module.exports = {
    name: 'disownpet',
    description: 'Disown your server pet.',
    aliases: ['disown', 'abandonpet', 'abandon' ],
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

        try {
            // Check if a pet exists for this server
            const existingPet = await ServerPets.findOne({ where: { serverId } });
            if (!existingPet) {
                const noPetEmbed = new EmbedBuilder()
                    .setColor('FF0000')
                    .setAuthor({name: `Your server does not own a pet!`, iconURL: message.client.user.displayAvatarURL() });

                return message.reply({ embeds: [noPetEmbed] });
            }

            const dangerEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({ name: `${existingPet.petName} needs your care!`, iconURL: message.client.user.displayAvatarURL() })
                .setDescription(`Are you sure you want to disown **${existingPet.petName}**? This action is irreversible.`);
            
            const confirm = new ButtonBuilder()
                .setCustomId('confirm')
                .setLabel('Yes, Abandon')
                .setStyle(ButtonStyle.Danger);
    
            const cancel = new ButtonBuilder()
                .setCustomId('cancel')
                .setLabel('No, Keep Pet')
                .setStyle(ButtonStyle.Secondary);
            
            const row = new ActionRowBuilder()
			    .addComponents(cancel, confirm);

            const response = await message.reply({ embeds: [dangerEmbed], components: [row] });

            const collectorFilter = i => i.user.id === message.author.id;

            try {
                const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });

                if (confirmation.customId === 'confirm') {
                    // Delete the pet and its stats
                    await PetStats.destroy({ where: { petId: existingPet.id } });
                    await ServerPets.destroy({ where: { serverId: serverId}});
                    const embed = new EmbedBuilder()
                        .setColor(message.client.noColor)
                        .setAuthor({ name: `Imagine abandoning your pet tsk tsk tsk.`, iconURL: message.client.user.displayAvatarURL()});
                    await confirmation.update({ embeds: [embed], components: [] });
                } else if (confirmation.customId === 'cancel') {
                    const embed = new EmbedBuilder()
                        .setColor(message.client.noColor)
                        .setAuthor({ name: `Action cancelled.` });
                    await confirmation.update({ embeds: [embed], components: [] });
                }
            } catch (e) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setAuthor({ name: `Cancelling! Confirmation not received within 1 minute.`, iconURL: message.client.user.displayAvatarURL()});
                await response.edit({ embeds: [embed], components: [] });
            }
        } catch (error) {
            console.error('Error deleting pet:', error.message);
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setAuthor({name: 'There was an error disowning your pet. Please try again later.', iconURL: message.client.user.displayAvatarURL() });

            return message.reply({ embeds: [errorEmbed] });
        }
    }
};
