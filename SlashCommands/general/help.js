const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require("discord.js");

const fs = require("fs");

const path = require("path");

module.exports = {

  name: `help`,

  description: 'Feeling lost?',

  type: 'CHAT_INPUT',

  botperms: ["EMBED_LINKS"],

  cooldown: 5,

  run: async (client, interaction, args) => {

    // مسار مجلد الأوامر الأساسي

    const commandsBasePath = '/home/container/SlashCommands';

    // قاعدة بيانات للأوامر مجمعة حسب المجلدات

    const commandCategories = {};

    // المسارات إلى مجلدات الأوامر

    const commandFolders = ['general', 'coins', 'admin']; // حدد مجلدات الأوامر هنا

    // قراءة الأوامر من المجلدات

    for (const folder of commandFolders) {

      const folderPath = path.join(commandsBasePath, folder);

      // تحقق من وجود المجلد قبل محاولة قراءة الملفات منه

      if (fs.existsSync(folderPath)) {

        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

        commandCategories[folder] = [];

        for (const file of commandFiles) {

          const command = require(path.join(folderPath, file));

          commandCategories[folder].push(command);

        }

      } else {

        console.log(`المجلد ${folderPath} غير موجود.`);

      }

    }

    // إعداد قائمة الاختيار (Select Menu) لفئات الأوامر

    const categoryOptions = Object.keys(commandCategories).map(category => ({

      label: category.charAt(0).toUpperCase() + category.slice(1), // تحويل أول حرف إلى كبير

      description: `أوامر ${category}`,

      value: category

    }));

    // رسالة مضمنة لعرض خيارات الفئات

    const embed = new MessageEmbed()

      .setTitle(`ProBit's Help Menu`)

      .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })

      .setColor(`BLUE`)

      .setThumbnail(client.user.avatarURL())

      .setDescription('If you don\'t know anything about bot commands, you can use the options of the select menu to get a list of commands by category, like:\n\n**General** - get general commands. The prefix is `/` and `!`.')

      .setImage('https://cdn.discordapp.com/attachments/1093686676812988546/1251133669230248037/ProBitS.png?ex=666e2147&is=666ccfc7&hm=699bff59172da3a800ad89c8c3218b7cb78a1a9a933526789036931b2785f8c3&') // الرابط للصورة

      .setTimestamp()

      .setFooter({ text: `ProBit!` });

    const row = new MessageActionRow()

      .addComponents(

        new MessageSelectMenu()

          .setCustomId('category-menu')

          .setPlaceholder('Select Commands Category')

          .addOptions(categoryOptions)

      );

    await interaction.reply({ embeds: [embed], components: [row] });

    // الاستماع لتفاعل المستخدم مع قائمة الفئات

    const filter = i => i.customId === 'category-menu' && i.user.id === interaction.user.id;

    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async i => {

      const selectedCategory = i.values[0];

      const commandsInCategory = commandCategories[selectedCategory];

      if (!commandsInCategory.length) {

        return i.update({ content: `لا توجد أوامر في مجموعة ${selectedCategory}.`, components: [] });

      }

      // إعداد وصف الأوامر للفئة المختارة

      const commandsDescription = commandsInCategory.map(command => `**/${command.name}**\n${command.description}`).join('\n\n');

      // تحديث الرسالة الأصلية مع الأوامر المختارة

      const updatedEmbed = new MessageEmbed()

        .setTitle(`ProBit's Help Menu - ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`)

        .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })

        .setColor(`BLUE`)

        .setThumbnail(client.user.avatarURL())

        .setDescription(commandsDescription) // تحديث النص مع الأوامر الجديدة

        .setImage('attachment://PoBotImage.png') // الاحتفاظ بالصورة

        .setTimestamp()


      await i.update({ embeds: [updatedEmbed], components: [row] });

    });

    collector.on('end', collected => {

      if (collected.size === 0) {

        interaction.editReply({ content: '.انتهت فترة الاختيار', components: [] });

      }

    });

  }

};