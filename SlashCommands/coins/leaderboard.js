// commands/leaderboard.js

const { MessageAttachment } = require('discord.js');

const { createCanvas, loadImage, registerFont } = require('canvas');

const Coin = require('../../DataBase/models/coins.js'); // Adjust the path as per your project structure

const formatNumber = (number) => {

  if (number >= 1000000000) {

    return (number / 1000000000).toFixed(1) + 'B';

  } else if (number >= 1000000) {

    return (number / 1000000).toFixed(1) + 'M';

  } else if (number >= 1000) {

    return (number / 1000).toFixed(1) + 'K';

  } else {

    return number.toString();

  }

};

const getColorForRank = (rank) => {

  switch (rank) {

    case 1:

      return '#FFD700'; // Gold

    case 2:

      return '#C0C0C0'; // Silver

    case 3:

      return '#CD7F32'; // Bronze

    default:

      return '#FFFFFF'; // White

  }

};

module.exports = {

  name: 'leaderboard',

  description: 'Show top 10 users with the most balances.',

  run: async (client, interaction) => {

    try {

      // Fetch top 10 users based on coins

      const topUsers = await Coin.find().sort({ coins: -1 }).limit(10);

      // Load background image

      const backgroundPath = './backgroundtop.png'; // Adjust path as necessary

      const background = await loadImage(backgroundPath);

      // Load custom font

      registerFont('./fonts/TypoGraphica.ttf', { family: 'CustomFont' });

      // Create canvas and context

      const canvas = createCanvas(400, 400);

      const ctx = canvas.getContext('2d');

      // Draw background image

      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      // Set font and color for text

      ctx.font = '18px CustomFont';

      ctx.textAlign = 'left';

      ctx.fillStyle = '#FFFFFF'; // White

      // Draw leaderboard title

      ctx.fillText('Top 10 of credits', 10, 30);

      // Draw user data

      const yStart = 50;

      const yStep = 35;

      for (let i = 0; i < topUsers.length; i++) {

        const user = await client.users.fetch(topUsers[i].userId);

        const avatarURL = user.displayAvatarURL({ format: 'png', dynamic: true });

        const avatar = await loadImage(avatarURL);

        // Set color based on rank

        ctx.fillStyle = getColorForRank(i + 1);

        ctx.fillText(`#${i + 1}`, 50, yStart + i * yStep + 20); // Rank number

        ctx.fillStyle = '#FFFFFF'; // White

        ctx.fillText(user.tag, 100, yStart + i * yStep + 20); // User tag

        ctx.fillText(`${formatNumber(topUsers[i].coins)} Credits`, 250, yStart + i * yStep + 20); // Coins

        // Draw user avatar

        ctx.drawImage(avatar, 10, yStart + i * yStep, 30, 30);

        // Draw thin white line separator

        ctx.strokeStyle = '#FFFFFF'; // White

        ctx.lineWidth = 1;

        ctx.beginPath();

        ctx.moveTo(10, yStart + (i + 1) * yStep);

        ctx.lineTo(canvas.width - 10, yStart + (i + 1) * yStep);

        ctx.stroke();

      }

      // Create message attachment from canvas

      const attachment = new MessageAttachment(canvas.toBuffer(), 'leaderboard.png');

      // Reply with the leaderboard image

      await interaction.reply({ files: [attachment] });

    } catch (error) {

      console.error('An error occurred:', error);

      return interaction.reply('An error occurred while processing your request.');

    }

  },

};