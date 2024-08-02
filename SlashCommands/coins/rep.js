const { MessageEmbed } = require('discord.js');

const Rep = require('../../DataBase/models/rep.js'); // تأكد من تعديل المسار حسب بنية مشروعك

module.exports = {

  name: 'rep',

  description: 'Give someone a point.',

  options: [

    {

      name: 'user',

      type: 'USER',

      description: 'The user you want to give',

      required: true,

    },

  ],

  run: async (client, interaction) => {

    try {

      const giver = interaction.user;

      const receiver = interaction.options.getUser('user');

      if (giver.id === receiver.id) {

        return interaction.reply('لا يمكنك منح نقطة تقدير لنفسك.');

      }

      const now = new Date();

      // العثور على بيانات المعطي في قاعدة البيانات أو إنشاء مستند جديد إذا لم يكن موجودًا

      let giverData = await Rep.findOne({ userId: giver.id });

      if (!giverData) {

        giverData = new Rep({ userId: giver.id });

      }

      // التحقق من الوقت منذ آخر مرة تم منح نقطة تقدير منها

      if (giverData.lastGiven && (now - giverData.lastGiven) < 43200000) {

        const repDate = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric' });

        return interaction.reply(`يمكنك منح نقطة تقدير واحدة كل 12 ساعة. الوقت الحالي: ${repDate}.`);

      }

      // العثور على بيانات المستقبل في قاعدة البيانات أو إنشاء مستند جديد إذا لم يكن موجودًا

      let receiverData = await Rep.findOne({ userId: receiver.id });

      if (!receiverData) {

        receiverData = new Rep({ userId: receiver.id });

      }

      // تحديث بيانات المعطي والمستقبل

      giverData.lastGiven = now;

      receiverData.rep += 1;

      // حفظ البيانات المحدثة في قاعدة البيانات

      await giverData.save();

      await receiverData.save();

      // إنشاء واستجابة الرسالة المضمنة

      const embed = new MessageEmbed()

        .setColor('#00FF00')

        .setDescription(`${giver.username} منح نقطة تقدير لـ ${receiver.username}.`);

      await interaction.reply({ embeds: [embed] });

    } catch (error) {

      console.error('حدث خطأ:', error);

      return interaction.reply('حدث خطأ أثناء معالجة طلبك.');

    }

  },

};