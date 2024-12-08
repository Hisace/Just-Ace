const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'eval',
    description: 'Evaluates JavaScript code (owner-only).',
    requiredPermissions: [],
    userPermissions: [],
    owner: true,
    async execute(message, args) {
        // Ensure code is provided
        const code = args.join(' ');
        if (!code) {
            return message.reply('Please provide the code to evaluate.');
        }

        try {
            // Evaluate the code
            let evaled = eval(code);

            // Handle promises
            if (evaled instanceof Promise) {
                evaled = await evaled;
            }

            // Convert the result to string
            const output = typeof evaled === 'string' ? evaled : require('util').inspect(evaled, { depth: 0 });

            // Create embed for the output
            const embed = new EmbedBuilder()
                .setTitle('Evaluation Result')
                .addFields(
                    { name: 'Input', value: `\`\`\`js\n${code}\n\`\`\`` },
                    { name: 'Output', value: `\`\`\`js\n${output}\n\`\`\`` }
                )
                .setColor(message.client.noColor);

            message.reply({ embeds: [embed], allowedMentions: { repliedUser: false} });
        } catch (error) {
            // Send error as an embed
            const embed = new EmbedBuilder()
                .setTitle('Evaluation Error')
                .addFields(
                    { name: 'Input', value: `\`\`\`js\n${code}\n\`\`\`` },
                    { name: 'Error', value: `\`\`\`js\n${error.message}\n\`\`\`` }
                )
                .setColor('Red');

            message.reply({ embeds: [embed], allowedMentions: { repliedUser: false} });
        }
    },
};
