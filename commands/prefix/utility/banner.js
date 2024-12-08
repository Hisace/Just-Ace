const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

module.exports = {
    name: 'banner',
    description: "Displays a user's banner.",
    usage: '<user>',
    requiredPermissions: [PermissionsBitField.Flags.EmbedLinks, PermissionsBitField.Flags.AttachFiles],
    userPermissions: [],
    owner: false,
    async execute(message, args) {

        // Find the user based on mention, ID, or username
        let user = message.mentions.members.first() ||
            message.guild.members.cache.get(args[0]) ||
            message.guild.members.cache.find(x => x.user.username.toLowerCase() === args.join(' ').toLowerCase()) ||
            message.member;

        // If the user is not found
        if (!user) return message.reply('User not found.');

        try {
            const userId = user.id || args[0];
            const data = await axios.get(`https://discord.com/api/users/${userId}`, {
                headers: {
                    Authorization: `Bot ${process.env.DISCORD_TOKEN}`
                }
            }).then(d => d.data);

            if (data.banner) {
                let url = data.banner.startsWith("a_") ? ".gif?size=4096" : ".png?size=4096";
                url = `https://cdn.discordapp.com/banners/${userId}/${data.banner}${url}`;
                
                const embed = new EmbedBuilder()
                    .setColor('2B2D31')
                    .setDescription(`[\`LINK\`](${url})`)
                    .setFooter({ 
                        text: `Requested by ${message.author.tag}`,
                        iconURL: message.author.displayAvatarURL({ dynamic: true }),
                    })
                    .setImage(url);
                
                await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
            } else {
                const embed = new EmbedBuilder()
                    .setColor('2B2D31')
                    .setDescription(`${user} doesn't have a banner.`);
                
                await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
            }
        } catch (error) {
            console.error('Error fetching banner:', error);
            await message.reply('There was an error fetching the banner. Please try again later.');
        }
    },
};
