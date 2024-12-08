const { PermissionsBitField, EmbedBuilder } = require('discord.js');

function checkPermissions(context, requiredPermissions, isBot = false) {
    const member = isBot
        ? context.guild.members.cache.get(context.client.user.id)
        : context.member;

    let permissions = new PermissionsBitField();
    permissions.add(requiredPermissions);

    const missingPermissions = requiredPermissions.filter(perm => !member.permissions.has(perm));

    if (missingPermissions.length) {
        const target = isBot ? 'The bot is' : 'You are';
        const embed = new EmbedBuilder()
            .setDescription(`${target} missing the following permissions: \`${permissions.toArray().join(', ')}\`.`)
            .setColor(0xc72c3b);
        context.reply({ embeds: [embed], ephemeral: true });
        return false;
    }

    return true;
}


module.exports = { checkPermissions };