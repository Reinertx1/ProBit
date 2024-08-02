const Blacklist = require('../../DataBase/models/blacklist.js'); // تأكد من تعديل المسار حسب بنية مشروعك

const botOwners = ['651790725536546818'];

module.exports = {

  name: 'blacklist',

  description: 'Ban a user from using the daily command for a specified period of time.',

  options: [

    {

      name: 'user',

      description: 'The user to be blacklisted.',

      type: 'STRING',

      required: true,

    },

    {

      name: 'duration',

      description: 'The duration of the blacklist in minutes, days, months, or years (m, d, M, y).',

      type: 'STRING',

      required: true,

    }

  ],

  run: async (client, interaction) => {

    try {

      if (!botOwners.includes(interaction.user.id)) {

        return interaction.reply({ content: 'This command is only available to bot owners.', ephemeral: true });

      }

      const userString = interaction.options.getString('user');

      let userId;

      if (userString.startsWith('<@') && userString.endsWith('>')) {

        userId = userString.slice(2, -1);

        if (userId.startsWith('!')) {

          userId = userId.slice(1);

        }

      } else {

        userId = userString;

      }

      const durationString = interaction.options.getString('duration');

      if (!userId || !durationString) {

        return interaction.reply('Please provide a valid user and duration.');

      }

      let duration = 0;

      const durationUnit = durationString.slice(-1);

      const durationValue = parseInt(durationString.slice(0, -1));

      switch (durationUnit) {

        case 'm':

          duration = durationValue * 60 * 1000; // Minutes to milliseconds

          break;

        case 'd':

          duration = durationValue * 24 * 60 * 60 * 1000; // Days to milliseconds

          break;

        case 'M':

          duration = durationValue * 30 * 24 * 60 * 60 * 1000; // Months to milliseconds (approx.)

          break;

        case 'y':

          duration = durationValue * 365 * 24 * 60 * 60 * 1000; // Years to milliseconds (approx.)

          break;

        default:

          return interaction.reply('Please provide a valid duration unit (m, d, M, y).');

      }

      const endDateTime = new Date(Date.now() + duration);

      // إضافة المستخدم إلى القائمة السوداء أو تحديث مدة القائمة السوداء

      await Blacklist.findOneAndUpdate(

        { userId: userId },

        { endTime: endDateTime },

        { upsert: true, new: true }

      );

      return interaction.reply(`User with ID ${userId} has been blacklisted until ${endDateTime}.`);

    } catch (error) {

      console.error('An error occurred:', error);

      return interaction.reply('An error occurred while processing your request.');

    }

  }

};