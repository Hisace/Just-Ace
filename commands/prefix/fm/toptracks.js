const axios = require('axios');
const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const LastFm = require('../../../models/LastFm');
require('dotenv').config();

module.exports = {
    name: 'toptracks',
    description: 'Displays the user\'s top tracks over a specified time period.',
    aliases: ['tt'],
    usage: '[timeperiod]',
    requiredPermissions: [PermissionsBitField.Flags.EmbedLinks],
    userPermissions: [],
    owner: false,
    execute: async (message, args) => {
        const apiKey = process.env.LASTFM_API_KEY;
        const period = args[0]?.toLowerCase() || '7d'; // Default to 7 days if no period is provided

        const validPeriods = {
            '7d': '7day',
            '1m': '1month',
            '3m': '3month',
            '6m': '6month',
            '12m': '12month',
            'alltime': 'overall',
        };

        if (!validPeriods[period]) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('Invalid time period. Use one of the following: `7d`, `1m`, `3m`, `6m`, `12m`, or `alltime`.');
            return await message.reply({ embeds: [errorEmbed], allowedMentions: { repliedUser: false } });
        }

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

            // Fetch the user's top tracks from Last.fm API
            const response = await axios.get('http://ws.audioscrobbler.com/2.0/', {
                params: {
                    method: 'user.gettoptracks',
                    user: username,
                    api_key: apiKey,
                    format: 'json',
                    period: validPeriods[period],
                    limit: 10,
                },
            });

            const topTracks = response.data.toptracks.track;

            if (!topTracks || topTracks.length === 0) {
                const noTracksEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('No top tracks found for the specified period!');
                return await message.reply({ embeds: [noTracksEmbed], allowedMentions: { repliedUser: false } });
            }

            // Build the list of top tracks
            const trackList = topTracks.map((track, index) => {
                const trackName = track.name;
                const artistName = track.artist.name;
                const playCount = track.playcount;

                return `**${index + 1}.** [${trackName}](https://www.last.fm/music/${encodeURIComponent(artistName)}/_/${encodeURIComponent(trackName)}) by **${artistName}** (${playCount} plays)`;
            });

            // Fetch user info from the Last.fm API
            const response_2 = await axios.get('http://ws.audioscrobbler.com/2.0/', {
                params: {
                    method: 'user.getinfo',
                    user: username,
                    api_key: apiKey,
                    format: 'json',
                },
            });

            const userInfo = response_2.data.user;
            const totalScrobbles = userInfo.playcount;
            const avatar = userInfo.image?.find((img) => img.size === 'large')?.['#text'] || null;

            // Create the embed
            const embed = new EmbedBuilder()
                .setColor(message.client.noColor)
                .setAuthor({name: `Top Tracks for ${username} (${args[0]?.toUpperCase() || '7D'})`, iconURL: message.author.displayAvatarURL() })
                .setDescription(trackList.join('\n'))
                .setFooter({ text: `Total Scrobbles ${totalScrobbles}.` });
            
            if (avatar) embed.setThumbnail(avatar);

            await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        } catch (error) {
            console.error('Error fetching top tracks:', error.message);

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('Failed to fetch your top tracks. Please try again later.');
            await message.reply({ embeds: [errorEmbed], allowedMentions: { repliedUser: false } });
        }
    },
};
