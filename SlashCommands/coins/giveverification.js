const Verified = require('../../DataBase/models/Verified.js');

const { MessageEmbed } = require('discord.js');

module.exports = {

  name: 'giveverification',

  description: 'Give or remove verification badge to a user',

  options: [

    {

      name: 'user',

      type: 'USER',

      description: 'The user to verify',

      required: true,

    },

  ],

  run: async (client, interaction) => {

    const botOwnerId = '651790725536546818';

    if (interaction.user.id !== botOwnerId) {

      return interaction.reply({ content: 'This command is only available to the bot owner.', ephemeral: true });

    }

    try {

      const targetUser = interaction.options.getUser('user');

      let isVerified = false;

      // Check if the user is already verified in MongoDB

      const existingVerification = await Verified.findOne({ userId: targetUser.id });

      if (existingVerification) {

        isVerified = existingVerification.verified;

      }

      if (isVerified) {

        // If already verified, remove verification

        await Verified.findOneAndDelete({ userId: targetUser.id });

        await interaction.reply({ content: `Verification badge has been removed from ${targetUser.username}.`, ephemeral: true });

      } else {

        // If not verified, grant verification

        await Verified.findOneAndUpdate(

          { userId: targetUser.id },

          { userId: targetUser.id, verified: true },

          { upsert: true, new: true }

        );

        await interaction.reply({ content: `Verification badge has been granted to ${targetUser.username}.`, ephemeral: true });

      }

    } catch (error) {

      console.error('An error occurred:', error);

      return interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });

    }

  },

};