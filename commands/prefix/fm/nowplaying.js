const axios = require('axios');
const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const LastFm = require('../../../models/LastFm');
require('dotenv').config();

module.exports = {
    name: 'nowplaying',
    description: 'Displays the currently playing or last scrobbled track for a user.',
    aliases: ['np', 'fm', 'now'],
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
                        `You haven't set your Last.fm account yet. Use the \`${message.client.prefix}setlastfm\` command to link your account.`
                    );
                return await message.reply({ embeds: [noUserEmbed], allowedMentions: { repliedUser: false } });
            }

            const username = user.lastfmUsername;

            // Fetch the currently playing or last scrobbled track
            const response = await axios.get('http://ws.audioscrobbler.com/2.0/', {
                params: {
                    method: 'user.getrecenttracks',
                    user: username,
                    api_key: apiKey,
                    format: 'json',
                    limit: 1,
                },
            });

            const recentTracks = response.data.recenttracks.track;
            const nowPlayingTrack = Array.isArray(recentTracks) ? recentTracks[0] : recentTracks;

            if (!nowPlayingTrack) {
                const noTracksEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription("You haven't scrobbled any tracks yet!");
                return await message.reply({ embeds: [noTracksEmbed], allowedMentions: { repliedUser: false } });
            }

            const trackName = nowPlayingTrack.name;
            const artistName = nowPlayingTrack.artist['#text'];
            const albumName = nowPlayingTrack.album['#text'] || 'Unknown Album';
            const albumArt = nowPlayingTrack.image?.find((img) => img.size === 'large')?.['#text'] || null;
            const isNowPlaying = nowPlayingTrack['@attr']?.nowplaying === 'true';

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

            // Create an embed with the track information
            const embed = new EmbedBuilder()
                .setColor(message.client.noColor)
                .setAuthor({ name: `${isNowPlaying ? 'Now Playing' : 'Last Scrobbled Track'}`, iconURL: message.author.displayAvatarURL() })
                .setDescription(`**[${trackName}](https://www.last.fm/music/${encodeURIComponent(artistName)}/_/${encodeURIComponent(trackName)})**`)
                .addFields(
                    { name: 'Artist', value: artistName, inline: true },
                    { name: 'Album', value: albumName, inline: true }
                )
                .setFooter({ text: `Total Scrobbles ${totalScrobbles}.` });

            if (albumArt) embed.setThumbnail(albumArt);

            await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        } catch (error) {
            console.error('Error fetching now playing track:', error.message);

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('Failed to fetch your currently playing track. Please try again later.');
            await message.reply({ embeds: [errorEmbed], allowedMentions: { repliedUser: false } });
        }
    },
};
