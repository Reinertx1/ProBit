const { MessageEmbed } = require("discord.js");

const ms = require("ms");

const Module = require("../../DataBase/models/guild.js");

const { setLongTimeout } = require("../../Functions/utils.js");

module.exports = {

  name: "mute",

  description: "Mute a member from text/voice channels so they cannot type.",

  aliases: ["m"],

  cooldown: 15,

  userPermissions: ["MUTE_MEMBERS"],

  botPermissions: ["MANAGE_ROLES"],

  run: async (client, message, args, guildData) => {

      
      
    let target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

    if (!target) {

      const embed = new MessageEmbed()

        .setTitle("Mute Command")

        .setDescription(`

**Usage:**
/mute [user] (time ends with m,h,d,mo,y) (reason)

**Examples:**
/mute @User or id 1m
or
!mute @user or id 1h`)

        .setColor("#504bbf")

        .setTimestamp()

      return message.reply({ embeds: [embed] });

    }

    let reason = args.slice(2).join(" ") || "No Reason Provided";

    let time = args[1] || "7d";

    if (!ms(time)) time = "7d";

    let role = message.guild.roles.cache.find(ro => ro.name == 'Muted');

    if (!role) {

      try {

        role = await message.guild.roles.create({

          name: 'Muted',

          permissions: [],

        });

        message.guild.channels.cache.forEach(async (channel) => {

          await channel.permissionOverwrites.edit(role, {

            SEND_MESSAGES: false,

            ADD_REACTIONS: false

          });

        });

      } catch (error) {

        console.log(error);

        return message.reply(`❌ There was an error creating the 'Muted' role.`);

      }

    }

    if (target.roles.cache.has(role.id)) {

      return message.reply(`**🙄 - ${target.user.username} is already muted**`);

    }

    if (target.roles.highest.position >= message.member.roles.highest.position &&

        message.guild.ownerId !== target.id &&

        message.guild.ownerId !== message.member.id ||

        message.guild.ownerId == target.id) {

      return message.reply(`🙄 - ** You can't mute ${target.user.username}. **`);

    }

    if (message.guild.me.roles.highest.position <= role.position) {

      return message.reply({

        content: `🙄 - I couldn't change the roles for that user. Please check my permissions and role position.`

      });

    }

    let obj = {

      userID: target.id,

      roleID: role.id,

      time: ms(time) + Date.now(),

    };

    let oldObj = guildData.muted.find(c => c.userID === target.id);

    if (!oldObj) {

      guildData.muted.push(obj);

      guildData.save();

    } else {

      guildData.muted[guildData.muted.indexOf(oldObj)] = obj;

      await Module.findOneAndUpdate({ guildID: message.guild.id }, { muted: guildData.muted });

    }

    target.roles.add(role.id).then(c => {

      setLongTimeout(async () => {

        let newData = await Module.findOne({ guildID: message.guild.id });

        if (!newData || !newData.muted.length) return;

        let newobj = newData.muted.find(c => c.userID === target.id);

        if (!newobj) return;

        target.roles.remove(newobj.roleID).catch(err => 0);

        newData.muted.splice(newData.muted.indexOf(newobj), 1);

        newData.save().catch(err => 0);

      }, ms(time));

      return message.reply(`✅ **${target.user.username} muted from the text! 🤐**`);

    }).catch(err => 0);

  }

};