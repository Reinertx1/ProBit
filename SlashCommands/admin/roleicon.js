const { MessageEmbed } = require("discord.js");

module.exports = {

  name: "role-icon",

  description: "Add or remove an icon from a role with a server emoji",

  type: 'CHAT_INPUT',

  options: [

    {

      name: "role",

      type: 8,

      description: "The role you want to add or remove an icon from",

      required: true,

    },

    {

      name: "emoji",

      type: 3,

      description: "The server emoji you want to use as the role icon (leave blank to remove icon)",

      required: false,

    },

  ],

  cooldown: 15,

  userPermissions: ["MANAGE_ROLES"],

  run: async (client, interaction, args) => {

    const serverBoostLevel = interaction.guild.premiumTier;

    if (serverBoostLevel !== 'TIER_2' && serverBoostLevel !== 'TIER_3') {

      return interaction.reply({ content: "This command requires at least server boost level 2.", ephemeral: true });

    }

    

    const role = interaction.options.getRole("role");

    const emojiInput = interaction.options.getString("emoji");

    if (!role) {

      return interaction.reply({ content: "Please provide a valid role.", ephemeral: true });

    }

    try {

      const botHighestRole = interaction.guild.me.roles.highest;

      if (role.comparePositionTo(botHighestRole) >= 0) {

        return interaction.reply({ content: "You cannot modify roles higher than or equal to the bot's highest role.", ephemeral: true });

      }

      let updatedRole;

      if (emojiInput) {

        // Extract emoji name (e.g., :hi: -> hi)

        const emojiName = emojiInput.match(/:([\w]+):/);

        if (!emojiName) {

          return interaction.reply({ content: "Please provide a valid emoji format (e.g., :emojiName:)." });

        }

        // Find emoji by name in the guild

        console.log("Searching for emoji:", emojiName[1]);

        const emoji = interaction.guild.emojis.cache.find(e => e.name === emojiName[1]);

        

        if (!emoji) {

          return interaction.reply({ content: `Emoji with name "${emojiName[1]}" not found in this server.`, ephemeral: true });

        }

        // Add emoji ID as role icon

        updatedRole = await role.setIcon(emoji.id);

        const embed = new MessageEmbed()

          .setColor("GREEN")

          .setDescription(`Icon has been added to role ${role.name}`);

        return interaction.reply({ embeds: [embed] });

      } else {

        // Remove role icon

        updatedRole = await role.setIcon(null);

        const embed = new MessageEmbed()

          .setColor("GREEN")

          .setDescription(`Icon has been removed from role ${role.name}`);

        return interaction.reply({ embeds: [embed], ephemeral: false }); // Make the message visible

      }

    } catch (error) {

      console.error("Error updating role icon:", error);

      return interaction.reply({ content: "An error occurred while updating the role icon.", ephemeral: true });

    }

  },

};