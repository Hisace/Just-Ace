const axios = require('axios');
const { PermissionsBitField, EmbedBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
    name: 'trackinfo',
    description: 'Get detailed information about a specific track.',
    usage: '!trackinfo <track name> [artist name]',
    requiredPermissions: [PermissionsBitField.Flags.EmbedLinks],
    userPermissions: [],
    owner: false,
    execute: async (message, args) => {
        const apiKey = process.env.LASTFM_API_KEY;

        // Parse input
        const trackQuery = args.join(' ');
        if (!trackQuery) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('Please provide a track name. Example: `!trackinfo Bohemian Rhapsody`');
            return await message.reply({ embeds: [errorEmbed], allowedMentions: { repliedUser: false } });
        }

        try {
            // Step 1: Search for the track
            const searchResponse = await axios.get('http://ws.audioscrobbler.com/2.0/', {
                params: {
                    method: 'track.search',
                    track: trackQuery,
                    api_key: apiKey,
                    format: 'json',
                },
            });

            const tracks = searchResponse.data.results.trackmatches.track;

            if (!tracks || tracks.length === 0) {
                const noTrackEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('No matches found for the given track name.');
                return await message.reply({ embeds: [noTrackEmbed], allowedMentions: { repliedUser: false } });
            }

            // Step 2: Get the top match
            const topMatch = tracks[0];
            const trackName = topMatch.name;
            const artistName = topMatch.artist;

            // Step 3: Fetch detailed track information
            const infoResponse = await axios.get('http://ws.audioscrobbler.com/2.0/', {
                params: {
                    method: 'track.getInfo',
                    track: trackName,
                    artist: artistName,
                    api_key: apiKey,
                    format: 'json',
                },
            });

            const track = infoResponse.data.track;

            if (!track) {
                const noInfoEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('Failed to retrieve detailed information for the track.');
                return await message.reply({ embeds: [noInfoEmbed], allowedMentions: { repliedUser: false } });
            }

            // Fetch related tracks (optional)
            const similarResponse = await axios.get('http://ws.audioscrobbler.com/2.0/', {
                params: {
                    method: 'track.getSimilar',
                    track: track.name,
                    artist: track.artist.name,
                    api_key: apiKey,
                    format: 'json',
                    limit: 3,
                },
            });

            const relatedTracks = similarResponse.data.similartracks.track
                .map((t) => `**[${t.name}](https://www.last.fm/music/${encodeURIComponent(t.artist.name)}/_/${encodeURIComponent(t.name)})** by ${t.artist.name}`)
                .join('\n') || 'No similar tracks found.';
            
            const artistsResponse = await axios.get('http://ws.audioscrobbler.com/2.0/', {
                params: {
                    method: 'artist.getInfo',
                    artist: track.artist.name,
                    api_key: apiKey,
                    format: 'json',
                },
            });

            const artist = artistsResponse.data.artist;

            // Create embed
            const embed = new EmbedBuilder()
                .setColor(message.client.noColor)
                .setTitle(track.name)
                .setURL(track.url)
                .setAuthor({ name: track.artist.name, iconURL: artist.image.find(img => img.size === "large")["#text"] })
                .addFields(
                    { name: 'Listeners', value: track.listeners.toLocaleString(), inline: true },
                    { name: 'Play Count', value: track.playcount.toLocaleString(), inline: true },
                    { name: 'Similar Tracks', value: relatedTracks }
                )
                .setThumbnail(track.album.image.find(img => img.size === "large")["#text"])
                .setFooter({ text: 'Track Information via Last.fm', iconURL: 'https://cdn.discordapp.com/attachments/1316122697859858564/1316122796744642605/favicon.png?ex=6759e65f&is=675894df&hm=a3da216ea20dba8803da5e5928a0320e95075f2624a6c4dc801ade0dfec0c1da&' });

            await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });

        } catch (error) {
            console.error('Error fetching track info:', error.message);

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('Failed to fetch track information. Please try again later.');
            await message.reply({ embeds: [errorEmbed], allowedMentions: { repliedUser: false } });
        }
    },
};