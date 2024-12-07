const axios = require('axios');
const ms = require('ms');

async function checkRatelimt(token) {
    try {
        const response = await axios.get('https://discord.com/api/v10/gateway/bot', {
            headers: {
                'Authorization': `Bot ${token}`,
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        if (error.response && error.response.status === 429) {
            const retry = error.response.headers['retry-after'];
			const retryAfter = Number(retry*1000);
			
            console.error(`Rate limited. Retry after ${ms(retryAfter, { long: true })}.`);
        } else {
            console.error('Error making request:', error);
        }
    }
}

module.exports = { checkRatelimt };