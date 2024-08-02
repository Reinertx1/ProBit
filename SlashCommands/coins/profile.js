const { createCanvas, loadImage, registerFont } = require('canvas');

const { MessageAttachment } = require('discord.js');

const Level = require('../../DataBase/models/level.js');

const Verified = require('../../DataBase/models/Verified.js');

const Coins = require('../../DataBase/models/coins.js');

const Rep = require('../../DataBase/models/rep.js');

const Bio = require('../../DataBase/models/bio.js');

module.exports = {

  name: 'profile',

  description: 'View user profile and stats',

  cooldown: 20,

  options: [

    {

      name: 'user',

      type: 'USER',

      description: 'The user to view profile (optional)',

      required: false,

    },

  ],

  run: async (client, interaction) => {

    try {

      await interaction.deferReply(); // تأكيد استلام الرسالة

      // الحصول على المستخدم المستهدف

      const targetUser = interaction.options.getUser('user') || interaction.user;

      if (!targetUser) {

        return interaction.editReply('User not found.');

      }

      if (targetUser.bot) {

        return interaction.editReply('Bots do not have profiles!');

      }

      // الحصول على بيانات المستخدم من MongoDB

      const userLevelData = await Level.findOne({ userId: targetUser.id }) || { level: 0, xp: 0, nextLevelXP: 600 };

      const verifiedData = await Verified.findOne({ userId: targetUser.id }) || { verified: false };

      const coinsData = await Coins.findOne({ userId: targetUser.id }) || { coins: 0 };

      const repData = await Rep.findOne({ userId: targetUser.id }) || { rep: 0 };

      const bioData = await Bio.findOne({ userId: targetUser.id });

      const bio = bioData ? bioData.bio : '';

      // تنسيق البيانات للاستخدام

      const { level, xp, nextLevelXP } = userLevelData;

      const verified = verifiedData.verified;

      const coins = formatCoins(coinsData.coins);

      const reps = repData.rep;

      // حساب ترتيب المستخدم بناءً على العملات

      const sortedUsers = await Coins.find({}).sort({ coins: -1 });

      const userRank = sortedUsers.findIndex(user => user.userId === targetUser.id) + 1;

      // إعداد canvas لرسم الصورة

      registerFont('./fonts/TypoGraphica.ttf', { family: 'CustomFont' });

      const canvas = createCanvas(400, 400);

      const ctx = canvas.getContext('2d');

      // رسم الخلفية والصورة الرمزية

      const avatarURL = targetUser.displayAvatarURL({ format: 'jpg', size: 512 });

      const avatar = await loadImage(avatarURL);

      ctx.drawImage(avatar, 0, 0, canvas.width, canvas.height);

      ctx.save();

      ctx.beginPath();

      ctx.arc(175, 100, 50, 0, Math.PI * 2, true);

      ctx.closePath();

      ctx.clip();

      ctx.drawImage(avatar, 125, 50, 100, 100);

      ctx.restore();

 
// رسم البايو
if (bio) {
  // تحديد مواضع الخلفية للنص
  const bioBackgroundWidth = 200;
  const bioBackgroundHeight = 100;
  const xOffset = 50; // زيادة هذا الرقم لتحريك الخلفية إلى اليمين
  const bioBackgroundX = (canvas.width - bioBackgroundWidth) / 2 + xOffset;
  const yOffset = 30; // زيادة هذا الرقم لتحريك الخلفية للأسفل
  const bioBackgroundY = 160 + yOffset;
  const bioBackgroundRadius = 15;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  roundRect(ctx, bioBackgroundX, bioBackgroundY, bioBackgroundWidth, bioBackgroundHeight, bioBackgroundRadius);

  // رسم النص
  ctx.font = 'bold 13px Arial'; // حجم الخط للبايو
  ctx.fillStyle = 'rgba(255, 255, 255, 1)'; // لون النص
  ctx.textAlign = 'left'; // محاذاة النص إلى اليسار

  const textX = bioBackgroundX + 10; // بداية النص من اليمين
  let textY = bioBackgroundY + 15; // بداية النص من الأعلى

  // تقسيم النص إلى أسطر
  const maxWidth = bioBackgroundWidth - 5; // عرض النص داخل الخلفية
  const maxHeight = bioBackgroundHeight - 0; // ارتفاع النص داخل الخلفية
  let words = bio.split(' ');
  let lines = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine + ' ' + words[i];
    const testWidth = ctx.measureText(testLine).width;
    if (testWidth > maxWidth && i > 0) {
      lines.push(currentLine.trim());
      currentLine = words[i] + ' ';
    } else {
      currentLine = testLine;
    }
  }
  lines.push(currentLine.trim());

  // Ensure text fits within maxHeight
  if (lines.length * 14 > maxHeight) {
    lines = lines.slice(0, Math.floor(maxHeight / 14));
  }

  // رسم كل سطر من النص
  lines.forEach(line => {
    if (textY < bioBackgroundY + bioBackgroundHeight - 10) {
      ctx.fillText(line, textX, textY);
      textY += 14; // زيادة الارتفاع بين كل سطر
    }
  });
}
  
  
    
      // رسم المعلومات الشخصية

      const titles = ["CREDITS", "REP", "LEVEL", "RANK"];

      const values = [`${coins}`, `+${reps}`, `${level}`, `${userRank}`];

      if (verified) {

        const verificationBadge = await loadImage('./verification_badge.png');

        ctx.drawImage(verificationBadge, 45, 130, 20, 20);

      }

      let maxTextWidth = 0;

      titles.forEach(title => {

        const textWidth = ctx.measureText(title).width;

        if (textWidth > maxTextWidth) maxTextWidth = textWidth;

      });

      const textBoxWidth = maxTextWidth + 40;

      const textX = 16;

      let textY = 177;

      const lineHeight = 20;

      const radius = 15;

      const backgroundWidth = textBoxWidth;

      const backgroundHeight = titles.length * (lineHeight + 25);

      // رسم خلفية البيانات الشخصية

      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // لون خلفية البيانات الشخصية

      roundRect(ctx, textX - 5, textY - 10, backgroundWidth, backgroundHeight, radius);

      // رسم العناوين والقيم

      ctx.font = '13px CustomFont'; // حجم الخط للعناوين

      ctx.fillStyle = 'rgba(255, 255, 255, 1)'; // لون النص للعناوين

      ctx.textAlign = 'left';

      ctx.textBaseline = 'top';

      for (let i = 0; i < titles.length; i++) {

        const title = titles[i];

        const value = values[i];

        ctx.font = '12px Tahoma'; // حجم الخط للقيم

        ctx.fillText(`${title}:`, textX, textY);

        const titleHeight = lineHeight;

        const valueHeight = ctx.measureText(value).actualBoundingBoxAscent + ctx.measureText(value).actualBoundingBoxDescent;

        ctx.font = '19px CustomFont'; // حجم الخط للقيم

        ctx.fillText(value, textX, textY + titleHeight);

        textY += titleHeight + valueHeight + 10;

      }

      // حساب نسبة XP

      const xpRatio = xp / nextLevelXP;

      // موقع وحجم شريط XP

      const xpBarWidth = 230; // قم بتعديل العرض إذا لزم الأمر

      const xpBarHeight = 17; // قم بتعديل الارتفاع إذا لزم الأمر

      const xpBarX = ((canvas.width - xpBarWidth) / 2) + 30; // مركزيًا أفقيًا

      const xpBarY = canvas.height - 50; // قرب الجزء السفلي

 // رسم خلفية شريط XP بحواف مستديرة

      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';

      roundRect(ctx, xpBarX, xpBarY, xpBarWidth, xpBarHeight, xpBarHeight / 2); // نصف قطر الحواف المستديرة هو نصف ارتفاع الشريط

      // رسم الجزء الممتلئ لشريط XP بحواف مستديرة

      ctx.fillStyle = '#d76aff';

      roundRect(ctx, xpBarX, xpBarY, xpBarWidth * xpRatio, xpBarHeight, xpBarHeight / 2);

      // رسم نص XP فوق الشريط

      ctx.font = '14px Arial';

      ctx.fillStyle = 'rgba(255, 255, 255, 1)';

      ctx.textAlign = 'center';

      ctx.textBaseline = 'middle';

      ctx.fillText(`${xp} / ${nextLevelXP} XP`, xpBarX + xpBarWidth / 2, xpBarY + xpBarHeight / 2);

      // تحويل canvas إلى صورة وإرسالها

      const attachment = new MessageAttachment(canvas.toBuffer(), 'profile.png');

      await interaction.editReply({ files: [attachment] });

    } catch (error) {

      console.error('An error occurred:', error);

      await interaction.editReply('An error occurred while processing your request.');

    }

  },

};

// دالة لتنسيق العملات بطريقة مناسبة

function formatCoins(coins) {

  if (coins >= 1000000000) {

    return (coins / 1000000000).toFixed(2) + 'B';

  } else if (coins >= 1000000) {

    return (coins / 1000000).toFixed(2) + 'M';

  } else if (coins >= 1000) {

    return (coins / 1000).toFixed(2) + 'K';

  }

  return coins.toString();

}

// دالة لرسم مستطيل بحواف مستديرة

function roundRect(ctx, x, y, width, height, radius) {

  ctx.beginPath();

  ctx.moveTo(x + radius, y);

  ctx.lineTo(x + width - radius, y);

  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);

  ctx.lineTo(x + width, y + height - radius);

  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);

  ctx.lineTo(x + radius, y + height);

  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);

  ctx.lineTo(x, y + radius);

  ctx.quadraticCurveTo(x, y, x + radius, y);

  ctx.closePath();

  ctx.fill();

}