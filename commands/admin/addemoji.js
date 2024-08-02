const { Message, Client, Util } = require("discord.js");

module.exports = {

        name: "addemoji",

        description: `add emojis to the server(can add multiple emojis at the same time).`,
    
cooldown:20,
    
  aliases: ["adde"],

        run: async (client, message, args) => {

                const permission = message.member.permissions.has("MANAGE_EMOJIS_AND_STICKERS ");

                const guilds = message.guild.me.permissions.has("MANAGE_EMOJIS_AND_STICKERS ");

                if (!permission) return message.reply({ content: ":rolling_eyes: **You don't have permission**" });

                let emojis = args.join(' ').match(/<?(a)?:?(\w{2,32}):(\d{17,19})>?/gi);

                if (!emojis) return message.reply({ content: `:rolling_eyes: **Please provide emojis to add.**` }).catch((err) => {

                        console.log(`i couldn't reply to the message: ` + err.message)

                })

                let emojisA = []

                emojis.forEach((emote) => {

                        let emoji = Util.parseEmoji(emote);

                        if (emoji.id) {

                                const Link = `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? "gif" : "png"}`;

                                message.guild.emojis.create(`${Link}`, `${emoji.name}`).then((em) => {

                                        emojisA.push(em.toString())

                                        if (emojis.length == emojisA.length) {

                                                message.reply(`${emojisA.map(e => e).join(',')} **Done added emoji**`).catch((err) => {

                                                        console.log(`i couldn't reply to the message: ` + err.message)

                                                })

                                                emojisA = []

                                        }

                                }).catch((error) => {

                                        message.reply("Error : " + error.message).catch((err) => {

                                                console.log(`i couldn't reply to the message: ` + err.message)

                                        })

                                });

                        }

                })

        },

};

