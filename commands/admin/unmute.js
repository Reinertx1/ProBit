const { MessageEmbed } = require("discord.js");

const ms = require("ms");

const Module = require("../../DataBase/models/guild.js");

module.exports = {

  name: `unmute`,

  description: 'Unmutes a member.',

  type: 'CHAT_INPUT',

  userPermissions: ["MUTE_MEMBERS"],

  botPermissions: ["MANAGE_ROLES"],

  aliases: ["unm"],

  cooldown: 20,

  run: async (client, message, args, guildData) => {

    let target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

    if (!target) {

      const embed = new MessageEmbed()

        .setTitle("Unmute Command")

        .setDescription(`**Usage:**
/unmute [user] or [ID] 

**Examples:**
/unmute @User or id
or
!unmute @user or id`)

        .setColor("#504bbf")

        .setTimestamp()

      return message.reply({ embeds: [embed] });

    }

    let role = message.guild.roles.cache.find(ro => ro.name == 'Muted');

    if (!role) {

      return message.reply(`🙄 - **Can't find the muted role.**`);

    }

    if (!target.roles.cache.has(role.id)) {

      return message.reply(`${target.user.username} isn't muted`);

    }

    if (message.guild.me.roles.highest.position <= role.position) {

      return message.reply(`🙄 - Please check my permissions and role position.`);

    }

    let obj = guildData.muted.find(c => c.userID === target.id);

    target.roles.remove(role.id).catch(err => 0);

    if (obj) {

      guildData.muted.splice(guildData.muted.indexOf(obj), 1);

      guildData.save();

    }

    return message.reply(`✅ ${target.user.username} unmuted!`);

  }

};