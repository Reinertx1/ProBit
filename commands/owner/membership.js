const fs = require('fs');

const { MessageEmbed } = require('discord.js');

module.exports = {

  name: 'membership',

  description: 'View user membership information.',

  aliases: [],

  run: async (client, message) => {

    try {

      const premiumFilePath = 'premium.json';

      let premiumData = {};

      // قراءة بيانات العضوية المتميزة من الملف

      if (fs.existsSync(premiumFilePath)) {

        const premiumFile = fs.readFileSync(premiumFilePath, 'utf8');

        premiumData = JSON.parse(premiumFile);

      }

      const serverId = message.guild.id; // الحصول على ID الخادم الحالي

      const serverName = message.guild.name; // الحصول على اسم الخادم الحالي

      const userId = message.author.id; // الحصول على ID المستخدم

      // سجل للتتبع

      console.log(`Checking premium membership for user ${userId} in server ${serverId}`);

      // التحقق من أن المستخدم لديه عضوية متميزة في الخادم الحالي

      if (!premiumData[serverId] || !premiumData[serverId].members || !premiumData[serverId].members[userId]) {

        return message.reply('You do not have a premium membership in this server.');

      }

      // سجل للتتبع

      console.log(`Found premium membership for user ${userId} in server ${serverId}`);

      // الحصول على معلومات العضوية المتميزة

      const membershipInfo = premiumData[serverId].members[userId];

      const expiryDate = new Date(membershipInfo.expiry).toLocaleString();

      // بناء الرسالة

      const embed = new MessageEmbed()

        .setColor('#0099ff')

        .setTitle('Premium Membership Information')

        .setDescription(`**Server Name:** ${serverName}\n**Server ID:** ${serverId}\n\n**Membership:** Premium\n**Expires on:** ${expiryDate}`)

        .setFooter(`Granted by user ID: ${membershipInfo.grantedBy}`);

      // إرسال الرسالة

      await message.channel.send({ embeds: [embed] });

    } catch (error) {

      console.error('An error occurred:', error);

      return message.reply('An error occurred while processing your request.');

    }

  }

};