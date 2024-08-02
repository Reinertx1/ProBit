const { MessageEmbed } = require("discord.js");

const { Warn } = require("../../DataBase/models/warnschema.js"); // استيراد النموذج المناسب

module.exports = {

    name: "warnings",

    description: `Get the list of warnings for the server or a user`,
aliases: ["التحذيرات","wing"],
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

            // Query MongoDB for warnings

            const warns = await Warn.find({ guildId: message.guild.id, memberId: member.id }).exec();

            let embed = new MessageEmbed()

                .setTitle(`Warnings for ${member.user.username}`)

                .setColor("#ff0000");

            if (warns.length > 0) {

                embed.setDescription(`Total Warnings: ${warns.length}`);

                embed.addFields(

                    warns.map((warn, index) => ({

                        name: `Warning ${index + 1}`,

                        value: `Reason: ${warn.reason}`,

                    }))

                );

            } else {

                embed.setDescription("No warnings found.");

            }

            message.reply({ embeds: [embed] });

        } catch (err) {

            console.error(`Error while fetching warnings: ${err}`);

            message.reply("An error occurred while fetching warnings.");

        }

    },

};