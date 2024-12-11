const axios = require('axios');
const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const LastFm = require('../../../models/LastFm');
require('dotenv').config();

module.exports = {
    name: 'stats',
    description: 'Displays a summary of the user\'s listening habits.',
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
                        "You haven't set your Last.fm account yet. Use the `!setlastfm` command to link your account."
                    );
                return await message.reply({ embeds: [noUserEmbed], allowedMentions: { repliedUser: false } });
            }

            const username = user.lastfmUsername;

            // Fetch the user's overall stats from Last.fm API
            const response = await axios.get('http://ws.audioscrobbler.com/2.0/', {
                params: {
                    method: 'user.getinfo',
                    user: username,
                    api_key: apiKey,
                    format: 'json',
                },
            });

            const userInfo = response.data.user;

            if (!userInfo) {
                const noStatsEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('Failed to fetch your listening stats. Please try again later.');
                return await message.reply({ embeds: [noStatsEmbed], allowedMentions: { repliedUser: false } });
            }

            const playCount = userInfo.playcount;
            const artistCount = userInfo.artist_count || 'N/A'; // Not always provided
            const albumCount = userInfo.album_count || 'N/A'; // Not always provided
            const trackCount = userInfo.track_count || 'N/A'; // Not always provided
            const avatar = userInfo.image?.find((img) => img.size === 'large')?.['#text'] || null;

            const embed = new EmbedBuilder()
                .setColor(message.client.noColor)
                .setAuthor({ name: `Listening Stats for ${username}`, iconURL: message.author.displayAvatarURL() })
                .setDescription(
                    `**Total Scrobbles:** ${playCount}\n` +
                    `**Unique Artists:** ${artistCount}\n` +
                    `**Unique Albums:** ${albumCount}\n` +
                    `**Unique Tracks:** ${trackCount}`
                );
            
            if (avatar) embed.setThumbnail(avatar);

            await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        } catch (error) {
            console.error('Error fetching listening stats:', error.message);

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('Failed to fetch your listening stats. Please try again later.');
            await message.reply({ embeds: [errorEmbed], allowedMentions: { repliedUser: false } });
        }
    },
};
