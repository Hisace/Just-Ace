function calculateXpForNextLevel(level) {
    const baseXp = 100; // Base XP for level 1
    const multiplier = 1.5; // Exponential growth factor
    return Math.floor(baseXp * (level ** multiplier));
}

module.exports = calculateXpForNextLevel;