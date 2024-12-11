const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = async (message, pages, time = 30 * 1000) => {

    try {
        if (!message || !pages || !pages > 0) throw new Error('[PAGINATION] Invalid args');

        if (pages.length === 1) {
            return await message.reply({ embeds: pages, components: [], allowedMentions: { repliedUser: false } });
        }

        var index = 0;

        const first = new ButtonBuilder()
        .setCustomId('pagefirst')
        .setEmoji('⏪')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

        const prev = new ButtonBuilder()
        .setCustomId('pageprev')
        .setEmoji('◀️')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

        const pageCount = new ButtonBuilder()
        .setCustomId('pagecount')
        .setLabel(`${index + 1}/${pages.length}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

        const next = new ButtonBuilder()
        .setCustomId('pagenext')
        .setEmoji('▶️')
        .setStyle(ButtonStyle.Secondary);

        const last = new ButtonBuilder()
        .setCustomId('pagelast')
        .setEmoji('⏩')
        .setStyle(ButtonStyle.Secondary);

        const buttons = new ActionRowBuilder().addComponents([first, prev, pageCount, next, last]);

        const msg = await message.edit({ embeds: [pages[index]], components: [buttons], allowedMentions: { repliedUser: false } });

        const collector = await msg.createMessageComponentCollector({
            ComponentType: ComponentType.Button,
            time
        });

        collector.on('collect', async i => {
            if (i.user.id !== message.author.id) return await i.reply({ content: "You can't use these buttons", ephemeral: true });

            await i.deferUpdate();

            if (i.customId === 'pagefirst') {
                index = 0;
                pageCount.setLabel(`${index + 1}/${pages.length}`);
            }

            if (i.customId === 'pageprev') {
                if (index > 0) index--;
                pageCount.setLabel(`${index + 1}/${pages.length}`);
            } else if (i.customId === 'pagenext') {
                if (index < pages.length - 1) {
                    index++;
                    pageCount.setLabel(`${index + 1}/${pages.length}`);
                }
            } else if (i.customId === 'pagelast') {
                index = pages.length - 1;
                pageCount.setLabel(`${index + 1}/${pages.length}`);
            }

            if (index === 0) {
                first.setDisabled(true);
                prev.setDisabled(true);
            } else {
                first.setDisabled(false);
                prev.setDisabled(false);
            }

            if (index === pages.length - 1) {
                next.setDisabled(true);
                last.setDisabled(true);
            } else {
                next.setDisabled(false);
                last.setDisabled(false);
            }

            await msg.edit({ embeds: [pages[index]], components: [buttons], allowedMentions: { repliedUser: false } }).catch(err => {});

            collector.resetTimer();
        });

        collector.on("end", async () => {
            await msg.edit({ embed: [pages[index]], components: [], allowedMentions: { repliedUser: false } }).catch(err => {});
        });

        return msg;
    } catch (error) {
        console.error(`[ERROR]:`, error.message);
    }
};