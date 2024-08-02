const Bio = require('../../DataBase/models/bio.js');

module.exports = {

  name: 'bio',

  description: 'Set or remove your bio.',

  cooldown: 20,

  options: [

    {

      name: 'text',

      type: 'STRING',

      description: 'Enter the text you want to display in your bio.',

      required: false,

    },

  ],

  run: async (client, interaction) => {

    const newBio = interaction.options.getString('text');

    if (newBio && newBio.length > 100) {

      // إذا كان النص المقدم يتجاوز 100 حرف، قم بإعلام المستخدم بذلك

      return interaction.reply({ content: '**Your bio is too long. Please keep it under 100 characters.**', ephemeral: true });

    }

    if (!newBio) {

      // إذا لم يتم توفير أي نص، قم بإزالة البايو

      await Bio.findOneAndDelete({ userId: interaction.user.id });

      return interaction.reply({ content: '**✅-Your bio has been removed.**', ephemeral: false });

    }

    // إذا تم توفير نص ضمن الحد المطلوب، قم بتحديث البايو في قاعدة البيانات

    await Bio.findOneAndUpdate(

      { userId: interaction.user.id },

      { bio: newBio },

      { upsert: true }

    );

    return interaction.reply({ content: `**✅-Your bio has been updated to:** ${newBio}`, ephemeral: false });

  },

};