const fs = require('fs');

const { COOLDOWN } = require('../../JSON/config.json');

module.exports = {

    name: "ping",

    cooldown: COOLDOWN,

    aliases: ['ping'],

    run: async (client, message) => {

        try {

            const userId = message.author.id;

            const guildId = message.guild.id;

            // قراءة بيانات البريميوم من الملف

            const premiumFilePath = 'premium.json';

            const premiumData = JSON.parse(fs.readFileSync(premiumFilePath, 'utf8'));

            // التحقق مما إذا كان لديه عضوية بريميوم في السيرفر المحدد

            if (premiumData[guildId]?.members?.[userId]) {

                message.reply('Pong.');

            } else {

                message.reply('You need premium membership in this server to use this command.');

            }

        } catch (error) {

            console.error('An error occurred:', error);

            message.reply('An error occurred while processing your request.');

        }

    }

};