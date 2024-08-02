console.clear()

require('events').EventEmitter.defaultMaxListeners = 100000;

const Discord = require("discord.js");

const { Client, Collection, Intents, MessageButton, MessageActionRow,MessageEmbed,MessageSelectMenu } = require('discord.js');

const client = new Client({

    intents: [

        Intents.FLAGS.GUILDS,

        Intents.FLAGS.GUILD_MESSAGES,

        Intents.FLAGS.DIRECT_MESSAGES,

        Intents.FLAGS.GUILD_MEMBERS, // SERVER MEMBERS INTENT

        Intents.FLAGS.GUILD_PRESENCES // PRESENCE INTENT

    ],

});

client.config = require("./config.js")

client.slashCommands = new Discord.Collection()

client.commands = new Collection();

client.cooldownGames = new Discord.Collection();

require("./DataBase/connect.js")

let handlerFiles = ["events", "slash","commands"]

handlerFiles.forEach(p => {

  require(`./Handler/${p}`)(client);

});

process.on("unhandledRejection", (err) => {

  if (err.message.includes("The user aborted a request.") || err.message.includes("Unknown interaction")) return;

  console.log(err.stack)

});

process.on('warning', (warning) => {

  console.log(warning.stack);

});

const prefix = '!'; 

const mongoose = require('mongoose');
const Level = require('./DataBase/models/level.js'); // تأكد من تعديل المسار حسب بنية مشروعك

const maxLevel = 100;
const baseXP = 600; // عدد نقاط الخبرة الأساسية للمستوى الأول

// حساب كمية XP اللازمة لكل مستوى
const levels = Array.from({ length: maxLevel }, (_, i) => baseXP * (i + 1));

client.on('messageCreate', async (message) => {
  if (!message.guild || message.author.bot || !message.content) return;

  await increaseXP(message.author.id);
  await checkLevelUp(message.author.id);
});

async function increaseXP(userId) {
  try {
    let userLevelData = await Level.findOne({ userId });

    if (!userLevelData) {
      userLevelData = new Level({
        userId,
        level: 0,
        xp: 0,
        nextLevelXP: levels[0],
      });
    }

    if (userLevelData.level >= maxLevel) return;

    userLevelData.xp += 3;

    const currentLevel = userLevelData.level;
    const xpToNextLevel = levels[currentLevel] - userLevelData.xp;

    if (xpToNextLevel <= 0 && currentLevel < maxLevel - 1) {
      userLevelData.level++;
      userLevelData.nextLevelXP = levels[userLevelData.level];
    }

    await userLevelData.save();
  } catch (error) {
    console.error('Error increasing XP:', error);
  }
}

async function checkLevelUp(userId) {
  try {
    let userLevelData = await Level.findOne({ userId });

    if (!userLevelData) {
      userLevelData = new Level({
        userId,
        level: 0,
        xp: 0,
        nextLevelXP: levels[0],
      });
    }

    let currentLevel = userLevelData.level;

    if (currentLevel >= maxLevel) return;

    while (userLevelData.xp >= levels[currentLevel] && currentLevel < maxLevel) {
      currentLevel++;
      if (currentLevel >= maxLevel) break;
    }

    userLevelData.level = currentLevel;

    if (currentLevel < maxLevel) {
      userLevelData.nextLevelXP = levels[currentLevel];
    } else {
      userLevelData.nextLevelXP = null; // لا يوجد مستوى أعلى من الحالي
    }

    await userLevelData.save();
  } catch (error) {
    console.error('Error checking level up:', error);
  }
}

const serverId = '1034469502311747705'; // معرف السيرفر المستهدف

client.on('messageCreate', async message => {

    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);

    const command = args.shift().toLowerCase();

    if (command === 'serbot') {

        if (message.guild.id !== serverId) {

            return message.reply('This command is only available in a specific server!');

        }

        const guilds = Array.from(client.guilds.cache.values());

        let i = 0;

        function sendGuildInfo() {

            if (i >= guilds.length) return;

            const guild = guilds[i];

            guild.members.fetch().then(members => {

                const memberCount = members.size;

                const joinDate = guild.me.joinedAt.toLocaleDateString('en-US', {

                    weekday: 'long',

                    year: 'numeric',

                    month: 'long',

                    day: 'numeric',

                    hour: '2-digit',

                    minute: '2-digit',

                    second: '2-digit',

                    timeZoneName: 'short'

                });

                const inviteChannel = guild.systemChannel || guild.channels.cache.find(channel => channel.type === 'GUILD_TEXT');

                if (!inviteChannel) {

                    console.error(`No suitable channel found for guild ${guild.name}`);

                    i++;

                    return setTimeout(sendGuildInfo, 3000);

                }

                guild.invites.create(inviteChannel, { maxAge: 0 }).then(invite => {

                    const inviteUrl = invite ? invite.url : 'No invite available';

                    const embed = new MessageEmbed()

                        .setTitle('Servers Information')

                        .setColor('#0099ff')

                        .addField('Server Name', guild.name, true)

                        .addField('Server ID', guild.id, true)

                        .addField('Members', memberCount.toString(), true)

                        .addField('Join Date', joinDate, true)

                        .addField('Invite URL', inviteUrl, true);

                    message.channel.send({ embeds: [embed] });

                    i++;

                    setTimeout(sendGuildInfo, 3000);

                }).catch(err => {

                    console.error(`Error creating invite for guild ${guild.name}:`, err);

                    const embed = new MessageEmbed()

                        .setTitle('Servers Information')

                        .setColor('#0099ff')

                        .addField('Server Name', guild.name, true)

                        .addField('Server ID', guild.id, true)

                        .addField('Members', memberCount.toString(), true)

                        .addField('Join Date', joinDate, true)

                        .addField('Invite URL', 'Not allowed invite', true);

                    message.channel.send({ embeds: [embed] });

                    i++;

                    setTimeout(sendGuildInfo, 3000);

                });

            }).catch(err => {

                console.error(`Error fetching members for guild ${guild.name}:`, err);

                i++;

                setTimeout(sendGuildInfo, 3000);

            });

        }

        sendGuildInfo();

    }

}); 

     


const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');

client.on('messageCreate', async message => {

    if (message.author.bot) return; // تجاهل رسائل البوتات

    if (message.content.startsWith(`${prefix}join`)) {

        const args = message.content.split(' ');

        if (args.length < 2) {

            return message.channel.send('Please provide a valid voice channel ID.');

        }

        const channelId = args[1];

        const voiceChannel = message.guild.channels.cache.get(channelId);

        if (!voiceChannel || voiceChannel.type !== 'GUILD_VOICE') {

            return message.channel.send('Please provide a valid voice channel ID.');

        }

        // التحقق من الصلاحيات

        if (!message.member.permissions.has('ADMINISTRATOR')) {

            return message.react('❎');

        }

        try {

            // الانضمام إلى القناة الصوتية

            const connection = joinVoiceChannel({

                channelId: voiceChannel.id,

                guildId: message.guild.id,

                adapterCreator: message.guild.voiceAdapterCreator,

            });

            message.channel.send(`Joined voice channel: ${voiceChannel.name}`);

        } catch (error) {

            console.error('Error joining voice channel:', error);

            message.channel.send('An error occurred while trying to join the voice channel.');

        }

    }

    if (message.content.startsWith(`${prefix}leave`)) {

        const voiceConnection = getVoiceConnection(message.guild.id);

        if (voiceConnection) {

            voiceConnection.destroy(); // قطع الاتصال الصوتي

            message.channel.send('Left the voice channel.');

        } else {

            message.channel.send('I am not in a voice channel.');

        }

    }

});




const badword = require('./DataBase/models/badwords.js');

client.on('messageCreate', async message => {

    if (message.author.bot || !message.guild) return;

    try {

        const guildID = message.guild.id;

        const data = await badword.find({ guildID });

        if (data && data.length > 0) {

            for (const badWordData of data) {

                if (!badWordData.badsok) continue; // Skip if badsok is false

                if (message.content.includes(badWordData.word)) {

                    // Check if the bot has permission to delete messages

                    if (!message.guild.me.permissions.has("MANAGE_MESSAGES")) {


                        return;

                    }

                    // Delete the message containing the bad word

                    message.delete();


                    break; // Exit the loop after deleting one message

                }

            }

        }

    } catch (error) {

        console.error('Error while checking bad words:', error);

    }

});
              
                

                        
          
client.login("MTI0NTU5Nzc0NDk0OTg5MTE1Mw.GZf9QP.BxAa-zzLemN3kga7qgzDjiXiWT8zhdneAFHHjM")