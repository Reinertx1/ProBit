const fs = require('fs');

const { MessageEmbed } = require('discord.js');

module.exports = {

  name: 'premiumlist',

  description: 'Display a list of users with premium membership.',

  aliases: ['plist'],

  run: async (client, message) => {

    try {

      const ownerId = '651790725536546818'; // تحديد معرف صاحب الخادم

      // التحقق من أن المستخدم هو صاحب الخادم

      if (message.author.id !== ownerId) {

        return message.reply('You do not have permission to use this command.');

      }

      // مسار ملف الـ JSON

      const premiumFilePath = 'premium.json';

      // قراءة البيانات من ملف الـ JSON

      fs.readFile(premiumFilePath, 'utf8', (err, data) => {

        if (err) {

          console.error('Error reading file:', err);

          return message.reply('An error occurred while reading data.');

        }

        try {

          // تحويل البيانات إلى كائن JSON

          const premiumData = JSON.parse(data);

          if (Object.keys(premiumData).length === 0) {

            return message.reply('No users have premium membership.');

          }

          // إعداد رسالة الـ Embed لعرض البيانات

          const premiumListEmbed = new MessageEmbed()

            .setColor('#0099ff')

            .setTitle('Premium Membership List');

          // ترتيب الأعضاء حسب تاريخ انتهاء البريميوم

          const sortedServers = Object.keys(premiumData).sort((a, b) => premiumData[a].expiry - premiumData[b].expiry);

          sortedServers.forEach(serverId => {

            const serverData = premiumData[serverId];

            const serverName = serverData.serverName;

            

            premiumListEmbed.addField('Server Name', serverName);

            for (const memberId in serverData.members) {

              const memberData = serverData.members[memberId];

              const expiryDate = new Date(memberData.expiry).toLocaleString();

              const grantDate = new Date(memberData.grantedAt).toLocaleString();

              const giver = message.guild.members.cache.get(memberData.grantedBy);

              premiumListEmbed.addField(

                `User ID: ${memberId}`,

                `Expiry Date: ${expiryDate}\nGranted Date: ${grantDate}\nGranted By: ${giver ? `<@${giver.id}>` : 'Unknown'}`

              );

            }

          });

          // إرسال رسالة الـ Embed

          message.channel.send({ embeds: [premiumListEmbed] });

        } catch (error) {

          console.error('Error parsing JSON:', error);

          message.reply('An error occurred while processing data.');

        }

      });

    } catch (error) {

      console.error('An error occurred:', error);

      message.reply('An error occurred while processing your request.');

    }

  },

};