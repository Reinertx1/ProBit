const Blacklist = require('../../DataBase/models/blacklist.js'); // تأكد من تعديل المسار حسب بنية مشروعك

const botOwners = ['651790725536546818'];

module.exports = {

  name: 'unblacklist',

  description: 'Unban a user from the daily command blacklist.',

  options: [

    {

      name: 'user',

      description: 'The user to be removed from the blacklist.',

      type: 'STRING',

      required: true,

    }

  ],

  run: async (client, interaction) => {

    try {

      // التحقق مما إذا كان المستخدم الذي يستخدم الأمر هو أحد مالكي البوت

      if (!botOwners.includes(interaction.user.id)) {

        return interaction.reply({ content: 'This command is only available to bot owners.', ephemeral: true });

      }

      const userString = interaction.options.getString('user');

      let userId;

      // تحقق مما إذا كان userString هو إشارة للمستخدم (مثل "<@1234567890>") أو معرف المستخدم الخام

      if (userString.startsWith('<@') && userString.endsWith('>')) {

        userId = userString.slice(2, -1);

        if (userId.startsWith('!')) {

          userId = userId.slice(1);

        }

      } else {

        userId = userString;

      }

      // محاولة العثور على المستخدم وإزالته من القائمة السوداء

      const result = await Blacklist.findOneAndDelete({ userId: userId });

      if (!result) {

        return interaction.reply('User is not in the blacklist.');

      }

      return interaction.reply(`User with ID ${userId} has been removed from the blacklist.`);

    } catch (error) {

      console.error('An error occurred:', error);

      return interaction.reply('An error occurred while processing your request.');

    }

  }

};