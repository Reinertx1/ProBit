const fs = require('fs');

const { MessageEmbed } = require('discord.js');

module.exports = {

  name: 'premium',

  description: 'Give or remove premium membership.',

  aliases: [],

  run: async (client, message) => {

    try {

      const botOwnerId = '651790725536546818'; // استبدل هذا بالـ ID الخاص بصاحب البوت

      const giver = message.author;

      // السماح لصاحب البوت أو المشرفين باستخدام الأمر

      if (giver.id !== botOwnerId && !message.member.permissions.has('ADMINISTRATOR')) {

        return message.reply('You do not have permission to use this command.');

      }

      const args = message.content.split(' ').slice(1);

      const action = args[0];

      const serverId = args[1];

      const receiver = message.mentions.users.first() || (args[2] ? await client.users.fetch(args[2]).catch(() => null) : null);

      const duration = parseInt(args[3]);

      if (!receiver) {

        return message.reply('You need to mention a user or provide their ID.');

      }

      const server = client.guilds.cache.get(serverId);

      if (!server) {

        return message.reply('The specified server ID is invalid or the bot is not a member of that server.');

      }

      const serverName = server.name; // الحصول على اسم الخادم الحالي

      let premiumData = {};

      const premiumFilePath = 'premium.json';

      // قراءة بيانات البريميوم الموجودة

      if (fs.existsSync(premiumFilePath)) {

        const premiumFile = fs.readFileSync(premiumFilePath, 'utf8');

        premiumData = JSON.parse(premiumFile);

      }

      const now = Date.now();

      if (action === 'add') {

        if (isNaN(duration)) {

          return message.reply('You need to specify the duration in days.');

        }

        const premiumExpiry = now + duration * 24 * 60 * 60 * 1000;

        // تحديث بيانات البريميوم للمستخدم في الخادم المحدد

        if (!premiumData[serverId]) {

          premiumData[serverId] = { serverName: serverName, members: {} };

        } else if (!premiumData[serverId].members) {

          // التحقق من وجود مفتاح الأعضاء وتحديثه إذا لم يكن موجوداً

          premiumData[serverId].members = {};

        }

        premiumData[serverId].members[receiver.id] = {

          grantedBy: giver.id,

          expiry: premiumExpiry

        };

        const embed = new MessageEmbed()

          .setColor('#FFD700')

          .setDescription(`${giver.username} granted premium membership to ${receiver.username} for ${duration} days in server ${serverName} (${serverId}).`);

        await message.reply({ embeds: [embed] });

      } else if (action === 'remove') {

        if (premiumData[serverId] && premiumData[serverId].members && premiumData[serverId].members[receiver.id]) {

          delete premiumData[serverId].members[receiver.id];

          const embed = new MessageEmbed()

            .setColor('#FF0000')

            .setDescription(`${giver.username} removed premium membership from ${receiver.username} in server ${serverName} (${serverId}).`);

          await message.reply({ embeds: [embed] });

        } else {

          return message.reply('This user does not have a premium membership in the specified server.');

        }

      } else {

        return message.reply('Invalid action. Use "add" to grant premium or "remove" to revoke premium.');

      }

      // كتابة البيانات المحدثة إلى الملف

      fs.writeFileSync(premiumFilePath, JSON.stringify(premiumData, null, 2));

    } catch (error) {

      console.error('An error occurred:', error);

      return message.reply('An error occurred while processing your request.');

    }

  }

};

// وظيفة للتحقق وإزالة العضويات البريميوم المنتهية

const checkPremiumExpiry = () => {

  const premiumFilePath = 'premium.json';

  if (fs.existsSync(premiumFilePath)) {

    const premiumFile = fs.readFileSync(premiumFilePath, 'utf8');

    let premiumData = JSON.parse(premiumFile);

    const now = Date.now();

    let updated = false;

    for (const serverId in premiumData) {

      if (!premiumData[serverId].members) continue; // تجاوز إذا لم يكن هناك مفتاح الأعضاء

      for (const userId in premiumData[serverId].members) {

        if (premiumData[serverId].members[userId].expiry <= now) {

          delete premiumData[serverId].members[userId];

          updated = true;

        }

      }

    }

    if (updated) {

      fs.writeFileSync(premiumFilePath, JSON.stringify(premiumData, null, 2));

      console.log('Expired premium memberships removed.');

    }

  }

};

// التحقق من العضويات البريميوم المنتهية كل ساعة

setInterval(checkPremiumExpiry, 60 * 60 * 1000);