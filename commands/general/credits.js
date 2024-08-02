const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

const Coin = require('../../DataBase/models/coins.js');

const Blacklist = require('../../DataBase/models/blacklist.js'); // Adjust path based on your project structure

module.exports = {

  name: 'credits',

  description: 'Check your credit balance or transfer',

  aliases: ["credit", "r"],

  cooldown: 15,

  run: async (client, message) => {

    const args = message.content.split(' ');

    const userId = message.author.id;

    const mentionedUser = message.mentions.users.first();

    const targetUserId = mentionedUser ? mentionedUser.id : args[1];

    const amount = parseInt(args[2]);

    const logChannelId = '1245496963772715079';

    try {

      // Check if the user is blacklisted

      const blacklistData = await Blacklist.findOne({ userId: userId });

      if (blacklistData) {

        return message.reply('You are blacklisted and cannot perform this action.');

      }

      // Fetch sender's coin data or create new if none exists

      let sender = await Coin.findOne({ userId: userId });

      if (!sender) {

        sender = await Coin.create({ userId: userId, coins: 0 });

      }

      // Fetch target user's data if specified

      let targetUser = null;

      if (targetUserId) {

        targetUser = await client.users.fetch(targetUserId).catch(() => null);

        if (!targetUser) {

          return message.reply('Invalid user ID or mention.');

        }

        // Check if the target user is a bot

        if (targetUser.bot) {

          return message.reply('Bots are not allowed to receive coins or be targets for transfer.');

        }

        // Check if user is trying to transfer to themselves

        if (targetUser.id === userId) {

          return message.reply('You cannot transfer coins to yourself. 🙄');

        }

        // Check if the target user is blacklisted

        const targetBlacklistData = await Blacklist.findOne({ userId: targetUser.id });

        if (targetBlacklistData) {

          return message.reply('The recipient is blacklisted and cannot receive coins.');

        }

      }

      // If target user and amount are specified, initiate transfer process

      if (targetUser && amount) {

        if (amount <= 0) {

          return message.reply('The amount must be greater than 0.');

        }

        if (sender.coins < amount) {

          return message.reply('You do not have enough coins to make this transfer.');

        }

        // Calculate tax and amount after tax

        const taxRate = 0.05;

        const taxAmount = Math.ceil(amount * taxRate);

        const amountAfterTax = amount - taxAmount;

        // Generate verification code

        const verificationCode = Math.floor(10000 + Math.random() * 90000).toString();

        const width = 500;

        const height = 300;

        const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

        const configuration = {

          type: 'line',

          data: {

            labels: [''],

            datasets: [],

          },

          options: {

            plugins: {

              legend: { display: false },

              tooltip: { enabled: false },

            },

            scales: {

              x: { display: false },

              y: { display: false },

            },

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

              // Add noise to the image

              for (let i = 0; i < 100; i++) {

                ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);

              }

              // Distort the text

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

        const replyMessage = await message.reply({

          content: `${message.author.username}, **Transfer Fees:** \`$${taxAmount}\` **Amount:** \`$${amountAfterTax}\` **Type these numbers to confirm:**`,

          files: [{ attachment: image, name: 'verification.png' }],

          fetchReply: true,

        });

        let verificationActive = true;

        setTimeout(async () => {

          if (replyMessage && replyMessage.deletable) {

            await replyMessage.delete().catch(console.error);

          }

          verificationActive = false;

        }, 8000);

        const filter = (msg) => msg.author.id === userId && msg.content === verificationCode;

        const collector = message.channel.createMessageCollector({ filter, max: 1, time: 60000 });

        collector.on('collect', async (msg) => {

          if (!verificationActive) {

            return message.reply('Verification has expired. Transaction cancelled.');

          }

          let recipient = await Coin.findOne({ userId: targetUser.id });

          if (!recipient) {

            recipient = await Coin.create({ userId: targetUser.id, coins: 0 });

          }

          sender.coins -= amount;

          recipient.coins += amountAfterTax;

          await sender.save();

          await recipient.save();

          const currentDateTime = new Date().toLocaleString();

          const logChannel = client.channels.cache.get(logChannelId);

          if (logChannel) {

            const embed = {

              color: 0x0099ff,

              title: 'Coin Transfer Log',

              description: `**${message.author.username}** (ID: ${userId}) transferred **$${amountAfterTax}** credit to **${targetUser.username}** (ID: ${targetUser.id}).`,

              fields: [

                { name: 'Amount', value: `$${amountAfterTax}`, inline: true },

                { name: 'Tax', value: `$${taxAmount}`, inline: true },

                { name: 'Date', value: `${currentDateTime}`, inline: false },

              ],

              timestamp: new Date(),

            };

            logChannel.send({ embeds: [embed] });

          }

          await message.reply(`**${message.author.username} has transferred \`$${amountAfterTax}\` to <@${targetUser.id}>**`);

          const recipientUser = await client.users.fetch(targetUser.id);

          recipientUser.send(`🏧 | Transfer Receipt\nYou received $${amountAfterTax} from ${message.author.username} (ID: ${userId})\nTax: $${taxAmount}`);

          // Delete the verification message

          if (replyMessage && replyMessage.deletable) {

            await replyMessage.delete().catch(console.error);

          }

        });

        collector.on('end', (collected, reason) => {

          if (reason === 'time' && replyMessage && replyMessage.deletable) {

            replyMessage.delete().catch(console.error);

          }

          if (collected.size > 0) {

            const collectedMessage = collected.first();

            if (collectedMessage && collectedMessage.deletable) {

              collectedMessage.delete().catch(console.error);

            }

          }

        });

        return;

      } else if (targetUser) {

        // If targetUser is specified but no amount, show targetUser's balance

        let targetData = await Coin.findOne({ userId: targetUser.id });

        if (!targetData) {

          targetData = { coins: 0 };

        }

        return message.reply(`**${targetUser.username}, balance is \`$${targetData.coins}\`**`);

      } else {

        // If targetUser is not specified, show balance of current user

        let userData = await Coin.findOne({ userId: userId });

        if (!userData) {

          userData = { coins: 0 };

        }

        return message.reply(`**${message.author.username}, you have \`$${userData.coins}\`, Credit.**`);

      }

    } catch (err) {

      console.error('Error in credits command:', err);

      return message.reply('An error occurred while processing the command.');

    }

  },

};