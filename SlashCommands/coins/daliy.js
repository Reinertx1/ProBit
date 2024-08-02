const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

const Coin = require('../../DataBase/models/coins.js');

const Blacklist = require('../../DataBase/models/blacklist.js');

const Level = require('../../DataBase/models/level.js');

module.exports = {

  name: 'daily',

  description: 'Get random coins every 24 hours.',

  cooldown: 30,

  run: async (client, interaction) => {

    try {

      const userId = interaction.user.id;

      // التحقق من القائمة السوداء

      const blacklistData = await Blacklist.findOne({ userId: userId });

      if (blacklistData) {

        return interaction.reply({ content: 'You are blacklisted and cannot receive daily rewards.', ephemeral: true });

      }

      // التحقق من عمر الحساب

      const accountCreationDate = interaction.user.createdTimestamp;

      const accountAgeInMilliseconds = Date.now() - accountCreationDate;

      const accountAgeInDays = accountAgeInMilliseconds / (1000 * 60 * 60 * 24);

      if (accountAgeInDays < 60) {

        return interaction.reply({ content: 'Your account must be older than 2 months to receive daily rewards.', ephemeral: true });

      }

      // جلب بيانات مستوى المستخدم

      const userLevelData = await Level.findOne({ userId: userId });

      if (!userLevelData || userLevelData.level < 5) {

        return interaction.reply({ content: 'You must be at least level 5 to receive daily rewards. If you want to know level **/profile**', ephemeral: true });

      }

      // جلب بيانات العملات للمستخدم

      let userCoinData = await Coin.findOne({ userId: userId }) || new Coin({ userId: userId });

      const now = new Date();

      if (userCoinData.lastDaily && (now - userCoinData.lastDaily) < 86400000) {

        const remaining = 86400000 - (now - userCoinData.lastDaily);

        const remainingHours = Math.floor(remaining / 3600000);

        const remainingMinutes = Math.floor((remaining % 3600000) / 60000);

        const remainingSeconds = Math.floor((remaining % 60000) / 1000);

        return interaction.reply(`⏳ | You can receive your credit within **${remainingHours} hours, ${remainingMinutes} minutes, ${remainingSeconds} seconds**.`);

      }

      const dailyCoins = Math.floor(Math.random() * (2000 - 900 + 1)) + 900;

      const verificationCode = Math.floor(10000 + Math.random() * 90000).toString();

      const width = 500;

      const height = 300;

      const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

      const configuration = {

        type: 'line',

        data: { labels: [''], datasets: [] },

        options: {

          plugins: {

            legend: { display: false },

            tooltip: { enabled: false },

          },

          scales: { x: { display: false }, y: { display: false } },

          animation: false,

        },

        plugins: [{

          id: 'custom-text',

          beforeDraw: (chart) => {

            const ctx = chart.ctx;

            ctx.save();

            ctx.fillStyle = '#000000';

            ctx.fillRect(0, 0, width, height);

            ctx.font = 'bold 50px Arial';

            ctx.fillStyle = 'white';

            ctx.textAlign = 'center';

            ctx.textBaseline = 'middle';

            for (let i = 0; i < 100; i++) {

              ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);

            }

            const text = verificationCode;

            const textWidth = ctx.measureText(text).width;

            const x = width / 2;

            const y = height / 2;

            for (let i = 0; i < text.length; i++) {

              const letter = text[i];

              const xOffset = (Math.random() - 0.5) * 10;

              const yOffset = (Math.random() - 0.5) * 10;

              ctx.fillText(letter, x - textWidth / 2 + i * (textWidth / text.length) + xOffset, y + yOffset);

            }

            ctx.restore();

          },

        }],

      };

      const image = await chartJSNodeCanvas.renderToBuffer(configuration);

      const replyMessage = await interaction.reply({

        content: `${interaction.user.username}, please enter the verification code displayed in the image to claim your daily credits:`,

        files: [{ attachment: image, name: 'verification.png' }],

        fetchReply: true,

      });

      let verificationActive = true;

      // إعداد مؤقت لحذف الرسالة بعد فترة معينة

      setTimeout(async () => {

        if (replyMessage && replyMessage.deletable) {

          await replyMessage.delete().catch(console.error);

        }

        verificationActive = false;

      }, 8000); // تعديل الزمن حسب حاجتك

      const filter = (message) => message.author.id === userId && message.content === verificationCode;

      const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 60000 });

      collector.on('collect', async (message) => {

        if (verificationActive && replyMessage && replyMessage.deletable) {

          await replyMessage.delete().catch(console.error); // حذف رسالة الصورة بعد التحقق

        }

        userCoinData.coins += dailyCoins;

        userCoinData.lastDaily = now;

        await userCoinData.save();

        const nowTimestamp = Math.floor(now.getTime() / 1000);

        const formattedCoins = new Intl.NumberFormat('en-US').format(dailyCoins);

        const logChannelId = '1245506396896759838'; // معرف القناة للتسجيل

        const logChannel = client.channels.cache.get(logChannelId);

        if (logChannel) {

          const embed = {

            color: 0x0099ff,

            title: 'Daily Reward Log',

            description: `**${interaction.user.username}** (ID: ${userId}) received \`$${formattedCoins}\` as a daily reward.`,

            fields: [

              { name: 'Amount', value: `$${formattedCoins}`, inline: true },

              { name: 'Date', value: `<t:${nowTimestamp}:f>`, inline: false },

            ],

            timestamp: new Date(),

          };

          logChannel.send({ embeds: [embed] });

        }

        // حذف الرسالة التي تحتوي على الرمز بعد التحقق

        await message.delete().catch(console.error);

        await interaction.followUp(`🎉 | **Congratulations! You have received \`$${formattedCoins}\`! 🏦 | Received Date: <t:${nowTimestamp}:f>**`);

      });

    } catch (error) {

      console.error('An error occurred:', error);

      return interaction.reply('An error occurred while processing your request.');

    }

  },

};