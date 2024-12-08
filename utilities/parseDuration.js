const ms = require('ms');

function parseDuration(durationString) {
    const parsedDuration = ms(durationString);

    if (parsedDuration) {
        return parsedDuration;
    }

    const regex = /(\d+)([dDhHmMsS])?/g;
    let match;
    let totalMilliseconds = 0;

    while ((match = regex.exec(durationString)) !== null) {
        const value = parseInt(match[1], 10);
        const unit = match[2].toLowerCase();

        switch (unit) {
            case 'd':
                totalMilliseconds += value * 24 * 60 * 60 * 1000;
                break;
            case 'h':
                totalMilliseconds += value * 60 * 60 * 1000;
                break;
            case 'm':
                totalMilliseconds += value * 60 * 1000;
                break;
            case 's':
                totalMilliseconds += value * 1000;
                break;
            default:
                return null; // Invalid unit
        }
    }

    return totalMilliseconds;
}

module.exports = {
    parseDuration,
};