const { Warn } = require("../../DataBase/models/warnschema.js");

const { MessageEmbed } = require("discord.js");

module.exports = {

    name: "warn",

    description: "Gives a warn to a user.",
    
aliases: ["تحذير","w"],
    
    run: async (client, message, args) => {

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

        const permission = message.member.permissions.has("MANAGE_MESSAGES");

        const reason_msg = args.slice(1).join(' ');

        if (!permission) {

            return message.reply(":x: **You don't have permission to use this command**");

        }

        if (!args[0]) {

            return message.reply(":rolling_eyes: **Please mention member or provide their ID**");

        }

        if (!member) {

            return message.reply(":rolling_eyes: **I couldn't find this member**");

        }

        if (member.id === message.author.id) {

            return message.reply(`:rolling_eyes: **You can't warn yourself**`);

        }

        if (message.member.roles.highest.position <= member.roles.highest.position) {

            return message.reply(`:rolling_eyes: **You can't warn ${member.user.username}**`);

        }

        if (!reason_msg) {

            return message.reply(":rolling_eyes: **Please provide a reason for the warn**");

        }

        // MongoDB integration

        try {

            // Adding warn to MongoDB

            const warn = new Warn({

                guildId: message.guild.id,

                memberId: member.id,

                reason: reason_msg

            });

            await warn.save();

            // Get total warns for the member

            const warns = await Warn.find({ guildId: message.guild.id, memberId: member.id }).exec();

            const WarnCount = warns.length;


            message.reply(`:white_check_mark: **${member.user.username} warned!**`);

            // Sending embed to the warned member

            const embed = new MessageEmbed()

                .setTitle(':warning: You were warned!')

                .setDescription(reason_msg)

                .setTimestamp()

                .setFooter(message.guild.name, message.guild.iconURL());

            member.send({ embeds: [embed] })

                .catch(err => console.error(`Failed to send warn message to ${member.user.username}: ${err}`));

        } catch (err) {

            console.error(`Error while handling warn: ${err}`);

            message.reply("An error occurred while handling the warn.");

        }

    },

};