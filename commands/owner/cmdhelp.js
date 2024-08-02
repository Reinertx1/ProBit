const Discord = require('discord.js');

const { readdirSync } = require('fs');

const ms = require('ms');

const Color = `#ffdf5c`;

module.exports = {

    name: 'command',

    category: 'help',

    description: 'Shows information about commands',

    usage: '?command <command>',

    timeout: 15,

    aliases: ['commands', 'cmd'],

    run: async (client, message, args) => {

        if (!args[0]) {

            return message.channel.send(':x: | Please specify a command!');

        }

        const commandName = args[0].toLowerCase();

        const command =

            client.commands.get(commandName) ||

            client.commands.find(

                (cmd) => cmd.aliases && cmd.aliases.includes(commandName)

            );

        if (!command) {

            const embed = new Discord.MessageEmbed()

                .setDescription(`Invalid command! Use \`${PREFIX}help\` for all of my commands!`)

                .setColor('RED');

            return message.channel.send({ embeds: [embed] });

        }

        const embed = new Discord.MessageEmbed()

            .setTitle('__Command Details:__')

            .addField(

                'Command Name:',

                command.name ? `\`${command.name}\`` : 'No name for this command.'

            )

            .addField(

                'Aliases:',

                command.aliases && command.aliases.length

                    ? `\`${command.aliases.join('` | `')}\``

                    : 'No aliases for this command.'

            )

            .addField(

                'Command Description:',

                command.description

                    ? command.description

                    : 'No description for this command.'

            )

            .addField(

                'Cooldown:',

                command.timeout

                    ? `${ms(command.timeout * 1000, { long: true })}`

                    : 'No cooldown'

            )

            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))

            .setTimestamp();

        return message.channel.send({ embeds: [embed] });

    }

};