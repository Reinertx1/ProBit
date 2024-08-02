const { PREFIX } = require('../../JSON/config.json');

const Discord = require('discord.js');

const guildModel = require("../../DataBase/models/guild.js");

const cooldowns = new Discord.Collection();

module.exports = {

    name: 'messageCreate',

    run: async (message, client) => {

        if (!message.guild || message.author.bot) return;

        let globalBot = client.config.globalBot;

        let ID = client.config.guildID;

        if (!globalBot && message.guild.id !== ID) return;

        let cooldownGames = client.cooldownGames;

        let args, cmd;

        // التحقق من البريفكس

        if (message.content.startsWith(PREFIX)) {

            // إذا بدأت بالبريفكس، استخرج الأمر والأجزاء

            args = message.content.slice(PREFIX.length).trim().split(/ +/);

            const commandName = args.shift().toLowerCase();

            cmd = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        } else {

            // إذا لم تبدأ بالبريفكس، استخرج الأمر فقط

            const cmdName = message.content.trim().split(/ +/)[0].toLowerCase();

            cmd = client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(cmdName));

            args = message.content.trim().split(/ +/).slice(1); // استخراج الوسائط بدون الأمر

        }

        // التأكد من وجود الأمر

        if (!cmd || !message.channel) return;

        message.member = message.guild.members.cache.get(message.author.id);

        // التحقق من نظام التجميد

        if (cmd.cooldown && cmd.cooldown !== 0) {

            if (!cooldowns.has(cmd.name)) {

                cooldowns.set(cmd.name, new Discord.Collection());

            }

            const now = Date.now();

            const timestamps = cooldowns.get(cmd.name);

            const cooldownAmount = cmd.cooldown * 1000;

            if (timestamps.has(message.author.id)) {

                const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

                if (now < expirationTime) {

                    const timeLeft = (expirationTime - now) / 1000;

                    if (timeLeft < 1) return;

                    return message.reply(`**${message.author.username}**, Cool down (**${Math.floor(timeLeft)} seconds** left)`).then(msg => { setTimeout(() => msg.delete(), 5000)});

                }

            }

            timestamps.set(message.author.id, now);

            setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

        }

        // التحقق من نظام التجميد للألعاب

        if (cmd.cooldownGames) {

            if (!cooldownGames.has(cmd.name)) {

                cooldownGames.set(cmd.name, new Discord.Collection());

            }

            let channelCooldown = cooldownGames.get(cmd.name);

            if (channelCooldown.has(message.channel.id)) {

                return message.reply(`**عفوًا، هناك جولة قيد التشغيل بالفعل!**`);

            }

        }

        // جلب بيانات الخادم

        let guildData = await guildModel.findOne({ guildID: message.guild.id });

        if (!guildData) {

            guildData = await new guildModel({ guildID: message.guild.id }).save();

        }

        // التحقق من الصلاحيات للمشرفين فقط

        if (cmd.onlyAdmins) {

            let admins = guildData.active.admins;

            if (!admins.length) return;

            let validRoles = message.member.roles.cache.filter(c => admins.includes(c.id)).map(c => c.id);

            if (!validRoles.length && message.member.permissions.has("ADMINISTRATOR")) {

                return message.reply(`لا يوجد مشرفون`);

            }

        }

        // التحقق من الصلاحيات لصاحب الخادم فقط

        if (cmd.onlyShip && message.author.id !== message.guild.ownerId) {

            return message.reply(`غير مسموح`);

        }

        // التحقق من صلاحيات المستخدم

        if (cmd.userPermissions) {

            if (!message.member.permissions.has(cmd.userPermissions)) {

                return message.reply(`لا تمتلك الصلاحيات المطلوبة \n المطلوبة: [${cmd.userPermissions}]`);

            }

        }

        // التحقق من صلاحيات البوت

        if (cmd.botPermissions) {

            let botPerms = message.channel.permissionsFor(client.user);

            if (!botPerms || !botPerms.has(cmd.botPermissions) || !message.guild.me.permissions.has(cmd.botPermissions)) {

                return message.reply(`أحتاج الصلاحيات \n المطلوبة: [${cmd.botPermissions}]`);

            }

        }

        cmd.run(client, message, args, guildData);

    }

};