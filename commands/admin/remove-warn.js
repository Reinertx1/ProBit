const { MessageEmbed } = require("discord.js");

const { Warn } = require("../../DataBase/models/warnschema.js"); // استيراد النموذج المناسب

module.exports = {

    name: "remove-warn",

    description: `Removes warn from a user.`,
aliases: ["حذف-ت","rw"],
    run: async (client, message, args) => {

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

        const permission = message.member.permissions.has("MANAGE_MESSAGES");

        if (!permission) {

            return message.reply(":x: **You don't have permission to use this command**");

        }

        if (!member) {

            return message.reply(":rolling_eyes: **Please mention member or provide their ID**");

        }

        try {

            if (!args[1]) {

                // Remove all warns for the member

                const removedWarns = await Warn.deleteMany({ guildId: message.guild.id, memberId: member.id });

                message.reply(`:white_check_mark: **Removed ${removedWarns.deletedCount} warn(s) from ${member.user.username}.**`);

            } else {

                // Remove specific number of warns

                const countToRemove = parseInt(args[1]);

                if (isNaN(countToRemove)) {

                    return message.reply(":rolling_eyes: **Invalid number of warns to remove**");

                }

                const existingWarns = await Warn.find({ guildId: message.guild.id, memberId: member.id }).exec();

                const currentWarnCount = existingWarns.length;

                if (countToRemove <= 0 || countToRemove > currentWarnCount) {

                    return message.reply(`:rolling_eyes: **Invalid number of warns to remove. Current count: ${currentWarnCount}**`);

                }

                // Sort warns by timestamp and remove the oldest ones

                const oldestWarns = existingWarns.sort((a, b) => a.timestamp - b.timestamp).slice(0, countToRemove);

                const oldestIds = oldestWarns.map(warn => warn._id);

                await Warn.deleteMany({ _id: { $in: oldestIds } });

                message.reply(`:white_check_mark: **Removed ${countToRemove} warn(s) from ${member.user.username}.**`);

            }

        } catch (err) {

            console.error(`Error while removing warns: ${err}`);

            message.reply("An error occurred while removing warns.");

        }

    },

};