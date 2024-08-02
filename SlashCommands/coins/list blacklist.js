const { MessageEmbed } = require('discord.js');

const Blacklist = require('../../DataBase/models/blacklist.js'); // تأكد من تعديل المسار حسب بنية مشروعك

module.exports = {

  name: 'listbe',

  description: 'Show all blacklisted users.',

  run: async (client, interaction) => {

    try {

      // تحقق مما إذا كان المستخدم الذي يستخدم الأمر هو مالك البوت

      const ownerId = '651790725536546818'; // استبدل بمعرف مالك البوت الخاص بك

      if (interaction.user.id !== ownerId) {

        return interaction.reply({ content: 'This command is only available to the bot owner.', ephemeral: true });

      }

      // جلب جميع المستخدمين من القائمة السوداء من قاعدة البيانات

      const blacklistData = await Blacklist.find({});

      

      if (blacklistData.length === 0) {

        return interaction.reply({ content: 'No users are currently blacklisted.', ephemeral: true });

      }

      const embed = new MessageEmbed()

        .setTitle('Blacklisted Users')

        .setColor('#FF0000');

      // Fetch user details in batches

      const fetchUsers = async (ids) => {

        const users = [];

        for (let i = 0; i < ids.length; i += 100) {

          const batch = ids.slice(i, i + 100);

          const fetchedUsers = await Promise.all(batch.map(id => client.users.fetch(id).catch(() => null)));

          users.push(...fetchedUsers.filter(user => user !== null));

        }

        return users;

      };

      // استخراج معرفات المستخدمين من بيانات الحظر

      const userIds = blacklistData.map(entry => entry.userId);

      const users = await fetchUsers(userIds);

      users.forEach(user => {

        const entry = blacklistData.find(entry => entry.userId === user.id);

        const endDateTime = new Date(entry.endTime);

        embed.addField(

          `${user.tag} (${user.id})`,

          `**Username:** ${user.username}\n**Blacklist End:** ${endDateTime.toLocaleString()}`

        );

      });

      return interaction.reply({ embeds: [embed] });

    } catch (error) {

      console.error('An error occurred:', error);

      return interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });

    }

  }

};