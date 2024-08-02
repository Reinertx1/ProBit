const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

const ms = require('ms');

const Giveaway = require('../../DataBase/models/Giveaway.js');

module.exports = {

  name: 'gstart',

  description: 'Start a new giveaway',

  

  run: async (client, message, args) => {

    try {

      // التحقق من صحة عدد المعاملات (يفترض 4 معاملات: المدة، الجائزة، عدد الفائزين، أيقونة العنوان)

      if (args.length < 2) {

        return message.reply('Please provide the duration and the prize for the giveaway.');

      }

      const duration = args[0]; // المدة هي أول معامل

      const prize = args[1]; // الجائزة هي ثاني معامل

      const winnerCount = args[2] ? parseInt(args[2], 10) : 1; // عدد الفائزين (إذا تم توفيره)

      const titleIconChoice = args[3] || null; // أيقونة العنوان (إذا تم توفيرها)

      // التحقق من صحة المدخلات للمدة

      const durationPattern = /^\d+[smhd]$|^\d+mo$/;

      if (!durationPattern.test(duration)) {

        return message.reply("Invalid duration. Please use the following formats: `10s` for seconds, `5m` for minutes, `1h` for hours, `1d` for days, or `1mo` for months.");

      }

      // حساب المدة بالمللي ثانية

      let durationInMs;

      if (duration.endsWith('mo')) {

        const months = parseInt(duration.slice(0, -2));

        durationInMs = ms(`${months * 30}d`); // تحويل الأشهر إلى أيام (بافتراض 30 يومًا في الشهر)

      } else {

        durationInMs = ms(duration);

      }

      // حساب وقت النهاية للجيف أواي

      const endTime = Math.floor((Date.now() + durationInMs) / 1000);

      // إنشاء Embed للجيف أواي

      const embed = new MessageEmbed()

        .setTitle('🎉 **GIVEAWAY!** 🎉')

        .setDescription(`React with 🎉 to participate!\n\n**Prize:** ${prize}`)

        .setColor('#00FFFF')

        .addFields(

          { name: 'Ends:', value: `<t:${endTime}:R> (<t:${endTime}:f>)`, inline: true },

          { name: 'Hosted by:', value: `<@${message.author.id}>`, inline: true },

          { name: 'Entries:', value: `**0**`, inline: true },

          { name: 'Winners:', value: `**${winnerCount}**`, inline: true }

        )

        .setFooter('Giveaway time!');

      // إضافة الأيقونة إذا تم اختيارها

      if (titleIconChoice === 'serverIcon' && message.guild.iconURL()) {

        embed.setThumbnail(message.guild.iconURL());

      } else if (titleIconChoice === 'authorAvatar') {

        embed.setThumbnail(message.author.displayAvatarURL());

      }

      // إضافة زر المشاركة

      const participationButton = new MessageActionRow()

        .addComponents(

          new MessageButton()

            .setCustomId('participate_giveaway')

            .setEmoji('🎉')

            .setStyle('PRIMARY')

        );

      // إرسال رسالة البدء الخاصة بالجيف أواي

      await message.reply({

        content: `Giveaway started for ${duration} with prize: ${prize} and ${winnerCount} winner(s)!`,

      });

      // حفظ بيانات الجيف أواي في قاعدة البيانات

      const giveawayData = {

        messageId: message.id,

        prize: prize,

        endTime: endTime,

        winnerCount: winnerCount,

        guildId: message.guild.id,

        channelId: message.channel.id,

        authorId: message.author.id,

      };

      await new Giveaway(giveawayData).save();

      // إرسال الرسالة العامة مع الزر والـ Embed

      const giveawayMessage = await message.channel.send({

        components: [participationButton],

        embeds: [embed]

      });

      // إنشاء مجموعة لتتبع المشاركين

      const participants = new Set();

      // بدء منطق الجيف أواي (التعامل مع التفاعلات على الزر)

      const filter = i => i.customId === 'participate_giveaway' && i.isButton() && i.message.id === giveawayMessage.id;

      const collector = message.channel.createMessageComponentCollector({ filter, time: durationInMs });

      collector.on('collect', async i => {

        if (participants.has(i.user.id)) {

          // المستخدم قد دخل بالفعل، سيتم إعلامه

          const leaveButton = new MessageActionRow()

            .addComponents(

              new MessageButton()

                .setCustomId('leave_giveaway')

                .setLabel('Leave Giveaway')

                .setStyle('DANGER')

            );

          await i.reply({

            content: 'You have already entered this giveaway!',

            ephemeral: true,

            components: [leaveButton]

          });

          // التعامل مع التفاعل على زر الخروج

          const leaveFilter = leaveI => leaveI.customId === 'leave_giveaway' && leaveI.user.id === i.user.id;

          const leaveCollector = i.channel.createMessageComponentCollector({ leaveFilter, time: 30000, max: 1 });

          leaveCollector.on('collect', async leaveI => {

            participants.delete(leaveI.user.id);

            await leaveI.update({

              content: 'You have left the giveaway.',

              components: []

            });

            // تحديث حقل المشاركين في الـ Embed

            const updatedEmbed = new MessageEmbed(giveawayMessage.embeds[0])

              .spliceFields(2, 1, { name: 'Entries:', value: `**${participants.size}**`, inline: true });

            await giveawayMessage.edit({ embeds: [updatedEmbed] });

          });

        } else {

          // إضافة المستخدم إلى المشاركين

          participants.add(i.user.id);

          await i.reply({

            content: 'You have successfully entered the giveaway!',

            ephemeral: true

          });

          // تحديث حقل المشاركين في الـ Embed

          const updatedEmbed = new MessageEmbed(giveawayMessage.embeds[0])

            .spliceFields(2, 1, { name: 'Entries:', value: `**${participants.size}**`, inline: true });

          await giveawayMessage.edit({ embeds: [updatedEmbed] });

        }

      });

      collector.on('end', async collected => {

        // اختيار الفائزين عشوائيًا

        const winners = [...participants].sort(() => 0.5 - Math.random()).slice(0, winnerCount);

        if (winners.length > 0) {

          // إعلان الفائزين

          await message.channel.send(`The giveaway has ended! 🎉 Congratulations to the winners: ${winners.map(winner => `<@${winner}>`).join(', ')}!`);

          // تحديث الـ Embed للإشارة إلى أن الجيف أواي انتهى

          const endedEmbed = new MessageEmbed(giveawayMessage.embeds[0])

            .setDescription(`The giveaway has ended!\n\n**Prize:** ${prize}`)

            .spliceFields(0, 1, { name: 'Ended:', value: `<t:${Math.floor(Date.now() / 1000)}:R> (<t:${Math.floor(Date.now() / 1000)}:f>)`, inline: true })

            .setColor('#FF0000');

          await giveawayMessage.edit({ components: [], embeds: [endedEmbed] });

          // حذف بيانات الجيف أواي من قاعدة البيانات

          await Giveaway.deleteOne({ messageId: message.id }).exec();

        } else {

          // لم يشارك أي شخص

          await message.channel.send('The giveaway has ended! No participants entered.');

          // تحديث الـ Embed للإشارة إلى عدم وجود مشاركين

          const noEntriesEmbed = new MessageEmbed(giveawayMessage.embeds[0])

            .setDescription(`The giveaway has ended!\n\n**Prize:** ${prize}`)

            .spliceFields(2, 1, { name: 'Entries:', value: `**0**`, inline: true })

            .setColor('#FF0000');

          await giveawayMessage.edit({ components: [], embeds: [noEntriesEmbed] });

          // حذف بيانات الجيف أواي من قاعدة البيانات

          await Giveaway.deleteOne({ messageId: message.id }).exec();

        }

      });

    } catch (error) {

      console.error(error);

      await message.reply('There was an error starting the giveaway. Please try again later.');

    }

  }

};