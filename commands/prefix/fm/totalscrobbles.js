const axios = require('axios');
const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const LastFm = require('../../../models/LastFm');
require('dotenv').config();

module.exports = {
    name: 'totalscrobbles',
    description: 'Fetches the total number of scrobbles by a user.',
    usage: '',
    requiredPermissions: [PermissionsBitField.Flags.EmbedLinks],
    userPermissions: [],
    owner: false,
    execute: async (message) => {
        const apiKey = process.env.LASTFM_API_KEY;

        try {
            // Fetch the user's Last.fm username from the database
            const user = await LastFm.findOne({ where: { userId: message.author.id } });

            if (!user) {
                const noUserEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription(
                        "You haven't set your Last.fm username yet. Use the `!setlastfm` command to link your account."
                    );
                return await message.reply({ embeds: [noUserEmbed], allowedMentions: { repliedUser: false } });
            }

            const username = user.lastfmUsername;

            // Fetch user info from the Last.fm API
            const response = await axios.get('http://ws.audioscrobbler.com/2.0/', {
                params: {
                    method: 'user.getinfo',
                    user: username,
                    api_key: apiKey,
                    format: 'json',
                },
            });

            const userInfo = response.data.user;
            const totalScrobbles = userInfo.playcount;
            const profileUrl = userInfo.url;
            const avatar = userInfo.image?.find((img) => img.size === 'large')?.['#text'] || null;

            // Create an embed with the scrobbles information
            const embed = new EmbedBuilder()
                .setColor(message.client.noColor)
                .setAuthor({name: `Total Scrobbles for ${username}`, iconURL: message.author.displayAvatarURL() })
                .setDescription(`[View Last.fm Profile](${profileUrl})`)
                .addFields({ name: 'Total Scrobbles', value: `${totalScrobbles} tracks`, inline: true })

            if (avatar) embed.setThumbnail(avatar);

            await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        } catch (error) {
            console.error('Error fetching total scrobbles:', error.message);

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('Failed to fetch your total scrobbles. Please try again later.');
            await message.reply({ embeds: [errorEmbed], allowedMentions: { repliedUser: false } });
        }
    },
};
