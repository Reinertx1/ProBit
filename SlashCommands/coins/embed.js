const { MessageEmbed } = require('discord.js');

module.exports = {

  name: "embed",

  description: "Send an embed message",

  options: [

    {

      name: "title",

      description: "The title of the embed",

      type: 3, // STRING type

      required: true,

    },

    {

      name: "description",

      description: "The description of the embed",

      type: 3, // STRING type

      required: true,

    },

    {

      name: "image",

      description: "Select an image",

      type: 11, // ATTACHMENT type

      required: false,

    },

    {

      name: "color",

      description: "The color of the embed (HEX color code, EX: #504bbf)",

      type: 3, // STRING type

      required: false,

    },

    {

      name: "text",

      description: "The text to send outside of the embed",

      type: 3, // STRING type

      required: false,

    },

    {

      name: "titleicon",

      description: "Choose 'ServerIcon' or 'authorAvatar' for the title icon",

      type: 3, // STRING type

      required: false,

      choices: [

        {

          name: "ServerIcon",

          value: "ServerIcon"

        },

        {

          name: "authorAvatar",

          value: "authorAvatar"

        }

      ]

    },

    {

      name: "thumbnail",

      description: "Choose a thumbnail image",

      type: 3, // STRING type

      required: false,

      choices: [

        {

          name: "ServerIcon",

          value: "ServerIcon"

        },

        {

          name: "authorAvatar",

          value: "authorAvatar"

        }

      ]

    }

  ],

  run: async (client, interaction) => {

    try {

      const title = interaction.options.getString('title');

      const description = interaction.options.getString('description');

      const imageAttachment = interaction.options.getAttachment('image'); // Use the attachment type for the image

      const color = interaction.options.getString('color');

      const text = interaction.options.getString('text');

      const titleIcon = interaction.options.getString('titleicon');

      const thumbnailChoice = interaction.options.getString('thumbnail');

      if (!interaction.member.permissions.has("ADMINISTRATOR")) {

        return interaction.reply({ content: "You don't have administrator permissions.", ephemeral: true });

      }

      // Validate color

      if (color && !isValidHexColor(color)) {

        return interaction.reply({ content: "Invalid color provided. Please provide a valid HEX color code.", ephemeral: true });

      }

      // Send hidden success message
       interaction.reply({ content: "The message has been sent successfully ✅", ephemeral: true });

      // Construct the embed

      const embed = new MessageEmbed()

        .setTitle(title)

        .setDescription(description);

      // Handle image if provided

      if (imageAttachment) {

        embed.setImage(imageAttachment.url);

      }

      if (color) {

        embed.setColor(color);

      }

      // Title Icon handling (choices only)

      if (titleIcon) {

        if (titleIcon === 'ServerIcon') {

          embed.setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL() });

        } else if (titleIcon === 'authorAvatar') {

          embed.setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() });

        }

      }

      // Thumbnail handling (choices only)

      if (thumbnailChoice) {

        if (thumbnailChoice === 'ServerIcon') {

          embed.setThumbnail(interaction.guild.iconURL());

        } else if (thumbnailChoice === 'authorAvatar') {

          embed.setThumbnail(interaction.user.displayAvatarURL());

        }

      }

      // Send the embed

      await interaction.channel.send({ embeds: [embed], content: text });

    } catch (error) {

      console.error("Error in embed command:", error);

      interaction.reply({ content: "An error occurred while executing the embed command.", ephemeral: true });

    }

  }

};

// Function to validate HEX color

function isValidHexColor(string) {

  const colorRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/;

  return colorRegex.test(string);

}