const axios = require('axios');
const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const LastFm = require('../../../models/LastFm');
require('dotenv').config();

module.exports = {
    name: 'recent',
    description: 'Displays the user\'s last few scrobbled tracks.',
    aliases: ['r'],
    usage: '[number]',
    requiredPermissions: [PermissionsBitField.Flags.EmbedLinks],
    userPermissions: [],
    owner: false,
    execute: async (message, args) => {
        const apiKey = process.env.LASTFM_API_KEY;
        const numberOfTracks = args[0] ? parseInt(args[0], 10) : 5; // Default to 5 if no number is provided

        if (isNaN(numberOfTracks) || numberOfTracks <= 0 || numberOfTracks > 10) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('Please provide a valid number between **1** and **10**.');
            return await message.reply({ embeds: [errorEmbed], allowedMentions: { repliedUser: false } });
        }

        try {
            // Fetch the user's Last.fm username from the database
            const user = await LastFm.findOne({ where: { userId: message.author.id } });

            if (!user) {
                const noUserEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription(
                        `You haven't set your Last.fm account yet. Use the \`${message.client.prefix}setlastfm\` command to link your account.`
                    );
                return await message.reply({ embeds: [noUserEmbed], allowedMentions: { repliedUser: false } });
            }

            const username = user.lastfmUsername;

            // Fetch the user's recent tracks from Last.fm API
            const response = await axios.get('http://ws.audioscrobbler.com/2.0/', {
                params: {
                    method: 'user.getrecenttracks',
                    user: username,
                    api_key: apiKey,
                    format: 'json',
                    limit: numberOfTracks,
                },
            });

            const recentTracks = response.data.recenttracks.track;

            if (!recentTracks || recentTracks.length === 0) {
                const noTracksEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('You haven\'t scrobbled any tracks yet!');
                return await message.reply({ embeds: [noTracksEmbed], allowedMentions: { repliedUser: false } });
            }

            // Build the list of tracks
            const trackList = recentTracks.map((track, index) => {
                const trackName = track.name;
                const artistName = track.artist['#text'];
                const timestamp = track.date
                    ? `<t:${Math.floor(track.date.uts)}:R>` // Discord relative timestamp
                    : '*Now Playing*';

                return `**${index + 1}.** [${trackName}](https://www.last.fm/music/${encodeURIComponent(artistName)}/_/${encodeURIComponent(trackName)}) by **${artistName}** (${timestamp})`;
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
                .setAuthor({name: `Recent Tracks for ${username}`, iconURL: message.author.displayAvatarURL() })
                .setDescription(trackList.join('\n'))
                .setFooter({ text: `Total Scrobbles ${totalScrobbles}.` });
            
            if (avatar) embed.setThumbnail(avatar);

            await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        } catch (error) {
            console.error('Error fetching recent tracks:', error.message);

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('Failed to fetch your recent tracks. Please try again later.');
            await message.reply({ embeds: [errorEmbed], allowedMentions: { repliedUser: false } });
        }
    },
};
