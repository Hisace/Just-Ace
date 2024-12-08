const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'avatar',
    description: "Displays a user's avatar.",
    usage: '<user>',
    requiredPermissions: [PermissionsBitField.Flags.EmbedLinks, PermissionsBitField.Flags.AttachFiles],
    userPermissions: [],
    owner: false,
    async execute(message, args) {
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.guild.members.cache.find(x => x.user.username.toLowerCase() === args.slice(0).join(' ') || x.user.username === args[0]) || message.member;
        
        const embed = new EmbedBuilder()
            .setImage(member.displayAvatarURL({ dynamic: true, size: 2048 }))
            .setDescription(`[\`PNG\`](${member.displayAvatarURL({ dynamic: true, size: 2048, format: "png" })}) | [\`JPG\`](${member.displayAvatarURL({ dynamic: true, size: 2048, format: "jpg" })}) | [\`WEBP\`](${member.displayAvatarURL({ dynamic: true, size: 2048, format: "webp" })})`) 
            .setColor(`2B2D31`)
            .setFooter({
                text: `Requested by ${message.author.tag}`,
                iconURL: message.author.displayAvatarURL({ dynamic: true }),
            });
        await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false} });
    },
};
